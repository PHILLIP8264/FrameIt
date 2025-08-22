import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import StorageService from "../../services/StorageService";
import { FirestoreService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";

interface PendingReview {
  logId: string;
  userId: string;
  filePath: string;
  downloadURL: string;
  questId?: string;
  timestamp: Date;
  moderationResult: any;
  reviewStatus: "pending" | "approved" | "rejected";
}

interface ModerationQueueProps {
  onRefresh?: () => void;
}

export default function ModerationQueue({ onRefresh }: ModerationQueueProps) {
  const { user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    highRisk: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (hasAdminAccess) {
      loadPendingReviews();
    }
  }, [filter, hasAdminAccess]);

  const checkAdminAccess = async () => {
    if (!user?.uid) {
      console.log("❌ No user UID found");
      setHasAdminAccess(false);
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Checking admin access for user:", user.uid);
      const userData = await FirestoreService.getUser(user.uid);

      console.log("📋 User data:", {
        userId: userData?.userId,
        email: userData?.email,
        displayName: userData?.displayName,
        role: userData?.role,
      });

      if (userData && userData.role === "admin") {
        console.log("✅ Admin access granted");
        setHasAdminAccess(true);
        loadPendingReviews();
        loadModerationStats();
      } else {
        console.log("❌ Admin access denied - user role:", userData?.role);
        setHasAdminAccess(false);
        Alert.alert(
          "Access Denied",
          "Only administrators can access the moderation queue."
        );
      }
    } catch (error) {
      console.error("❌ Error checking admin access:", error);
      setHasAdminAccess(false);
      Alert.alert("Error", "Failed to verify admin access.");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingReviews = () => {
    const q = query(
      collection(db, "moderationQueue"),
      where("reviewStatus", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let reviews = snapshot.docs.map((doc) => ({
        logId: doc.id,
        ...doc.data(),
      })) as PendingReview[];

      // Apply filters in memory to avoid index requirements
      if (filter === "recent") {
        // Sort by timestamp and take first 10
        reviews = reviews
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 10);
      } else if (filter === "high-risk") {
        // Filter high-risk items
        reviews = reviews.filter((review) => {
          const confidence = review.moderationResult?.confidence || 0;
          return confidence > 0.7; // High confidence in content issues
        });
      }

      setPendingReviews(reviews);
      setLoading(false);
    });

    return unsubscribe;
  };

  const loadModerationStats = async () => {
    try {
      // Get pending count
      const pendingQuery = query(
        collection(db, "moderationQueue"),
        where("reviewStatus", "==", "pending")
      );
      const pendingSnapshot = await getDocs(pendingQuery);

      // Get all approved items
      const approvedQuery = query(
        collection(db, "moderationQueue"),
        where("reviewStatus", "==", "approved")
      );
      const approvedSnapshot = await getDocs(approvedQuery);

      // Get all rejected items
      const rejectedQuery = query(
        collection(db, "moderationQueue"),
        where("reviewStatus", "==", "rejected")
      );
      const rejectedSnapshot = await getDocs(rejectedQuery);

      // Filter approved/rejected by last 7 days in memory
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentApproved = approvedSnapshot.docs.filter((doc) => {
        const data = doc.data();
        const reviewedAt = data.reviewedAt?.toDate();
        return reviewedAt && reviewedAt >= weekAgo;
      });

      const recentRejected = rejectedSnapshot.docs.filter((doc) => {
        const data = doc.data();
        const reviewedAt = data.reviewedAt?.toDate();
        return reviewedAt && reviewedAt >= weekAgo;
      });

      // Calculate high-risk items
      const highRiskCount = pendingSnapshot.docs.filter((doc) => {
        const data = doc.data();
        return (data.moderationResult?.confidence || 0) > 0.7;
      }).length;

      setStats({
        pending: pendingSnapshot.size,
        approved: recentApproved.length,
        rejected: recentRejected.length,
        highRisk: highRiskCount,
      });
    } catch (error) {
      console.error("Error loading moderation stats:", error);
      // Set fallback stats on error
      setStats({
        pending: 0,
        approved: 0,
        rejected: 0,
        highRisk: 0,
      });
    }
  };

  const handleApprove = async (logId: string) => {
    try {
      await StorageService.approveContent(logId, user!.uid);
      Alert.alert("Success", "Content approved successfully.");
      loadModerationStats(); // Refresh stats
      if (onRefresh) onRefresh(); // Notify parent component
    } catch (error) {
      console.error("Error approving content:", error);
      Alert.alert("Error", "Failed to approve content.");
    }
  };

  const handleReject = async (logId: string, reason?: string) => {
    const performReject = async (rejectionReason: string) => {
      try {
        await StorageService.rejectContent(logId, user!.uid, rejectionReason);
        Alert.alert("Success", "Content rejected successfully.");
        loadModerationStats(); // Refresh stats
        if (onRefresh) onRefresh(); // Notify parent component
      } catch (error) {
        console.error("Error rejecting content:", error);
        Alert.alert("Error", "Failed to reject content.");
      }
    };

    if (reason) {
      performReject(reason);
    } else {
      Alert.prompt(
        "Reject Content",
        "Please provide a reason for rejection:",
        async (reason) => {
          if (reason) {
            performReject(reason);
          }
        }
      );
    }
  };

  const openDetailModal = (review: PendingReview) => {
    setSelectedReview(review);
    setModalVisible(true);
  };

  const getRiskLevel = (review: PendingReview) => {
    const confidence = review.moderationResult?.confidence || 0;
    if (confidence > 0.8) return { level: "High", color: "#f44336" };
    if (confidence > 0.5) return { level: "Medium", color: "#ff9800" };
    return { level: "Low", color: "#4caf50" };
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  if (!hasAdminAccess) {
    return (
      <View style={styles.container}>
        <Text style={styles.accessDenied}>Access Denied</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading moderation queue...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Dashboard */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#4caf50" }]}>
            {stats.approved}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#f44336" }]}>
            {stats.rejected}
          </Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#ff9800" }]}>
            {stats.highRisk}
          </Text>
          <Text style={styles.statLabel}>High Risk</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Content Moderation Queue</Text>
        <Text style={styles.subHeader}>
          {pendingReviews.length} items pending review
        </Text>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {["all", "high-risk", "recent"].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.filterButtonActive,
              ]}
              onLongPress={() => setFilter(filterOption)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterOption && styles.filterButtonTextActive,
                ]}
              >
                {filterOption === "high-risk"
                  ? "High Risk"
                  : filterOption === "recent"
                  ? "Recent"
                  : "All"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.reviewList}>
        {pendingReviews.map((review) => {
          const riskLevel = getRiskLevel(review);

          return (
            <View
              key={review.logId}
              style={[
                styles.reviewItem,
                { borderLeftColor: riskLevel.color, borderLeftWidth: 4 },
              ]}
            >
              <View style={styles.reviewHeader}>
                <View style={styles.riskBadge}>
                  <Text style={[styles.riskText, { color: riskLevel.color }]}>
                    {riskLevel.level} Risk
                  </Text>
                </View>
                <Text style={styles.timeAgo}>
                  {getTimeAgo(review.timestamp)}
                </Text>
              </View>

              <TouchableOpacity onLongPress={() => openDetailModal(review)}>
                <Image
                  source={{ uri: review.downloadURL }}
                  style={styles.image}
                />
              </TouchableOpacity>

              <View style={styles.reviewDetails}>
                <Text style={styles.questInfo}>
                  Quest: {review.questId || "Unknown"}
                </Text>
                <Text style={styles.userInfo}>User: {review.userId}</Text>
                <Text style={styles.timestamp}>
                  {new Date(review.timestamp).toLocaleString()}
                </Text>

                <View style={styles.quickModerationInfo}>
                  <Text style={styles.confidenceText}>
                    AI Confidence:{" "}
                    {Math.round(
                      (review.moderationResult?.confidence || 0) * 100
                    )}
                    %
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onLongPress={() => openDetailModal(review)}
                  >
                    <Ionicons name="eye" size={16} color="#007AFF" />
                    <Text style={styles.detailButtonText}>Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onLongPress={() => handleApprove(review.logId)}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onLongPress={() => handleReject(review.logId)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {pendingReviews.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.emptyStateText}>No items pending review!</Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Content Review Details</Text>
              <TouchableOpacity onLongPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedReview && (
              <ScrollView style={styles.modalBody}>
                <Image
                  source={{ uri: selectedReview.downloadURL }}
                  style={styles.modalImage}
                />

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Quest ID</Text>
                  <Text style={styles.detailValue}>
                    {selectedReview.questId || "Unknown"}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>User ID</Text>
                  <Text style={styles.detailValue}>
                    {selectedReview.userId}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Submitted</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedReview.timestamp).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>AI Moderation Results</Text>
                  <View style={styles.moderationDetails}>
                    <Text style={styles.moderationText}>
                      Adult Content:{" "}
                      {selectedReview.moderationResult?.categories?.adult ||
                        "N/A"}
                    </Text>
                    <Text style={styles.moderationText}>
                      Violence:{" "}
                      {selectedReview.moderationResult?.categories?.violence ||
                        "N/A"}
                    </Text>
                    <Text style={styles.moderationText}>
                      Racy Content:{" "}
                      {selectedReview.moderationResult?.categories?.racy ||
                        "N/A"}
                    </Text>
                    <Text style={styles.moderationText}>
                      Overall Confidence:{" "}
                      {Math.round(
                        (selectedReview.moderationResult?.confidence || 0) * 100
                      )}
                      %
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalApproveButton}
                    onLongPress={() => {
                      handleApprove(selectedReview.logId);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Approve Content</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalRejectButton}
                    onLongPress={() => {
                      setModalVisible(false);
                      handleReject(selectedReview.logId);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Reject Content</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  // Stats Dashboard
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  // Header
  headerContainer: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  // Filters
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  accessDenied: {
    fontSize: 18,
    color: "#f44336",
    textAlign: "center",
    marginTop: 50,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 16,
    color: "#666",
  },
  reviewList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  riskText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: 12,
    color: "#999",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewDetails: {
    flex: 1,
  },
  questInfo: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  quickModerationInfo: {
    marginBottom: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: "#666",
  },
  moderationInfo: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  moderationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  moderationText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e3f2fd",
  },
  detailButtonText: {
    color: "#007AFF",
    fontSize: 12,
    marginLeft: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: "center",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  modalImage: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  moderationDetails: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  modalActions: {
    marginTop: 20,
  },
  modalApproveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  modalRejectButton: {
    backgroundColor: "#f44336",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
