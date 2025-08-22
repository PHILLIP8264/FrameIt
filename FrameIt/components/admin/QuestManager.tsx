import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Quest } from "../../types/database";
import { FirestoreService } from "../../services";
import { QuestFormModal } from "./modals/QuestFormModal";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";

interface QuestManagerProps {
  onRefresh?: () => void;
}

export const QuestManager: React.FC<QuestManagerProps> = ({ onRefresh }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    setLoading(true);
    try {
      const questList = await FirestoreService.getAllQuests();
      setQuests(questList);
    } catch (error) {
      console.error("Error loading quests:", error);
      setQuests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuest = async (formData: any) => {
    try {
      const questData = {
        ...formData,
        startDate: editingQuest?.startDate || new Date().toISOString(),
        endDate:
          editingQuest?.endDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: editingQuest?.createdBy || "admin",
        coordinates: editingQuest?.coordinates || { latitude: 0, longitude: 0 },
        radius: editingQuest?.radius || 100,
        addressDetails: editingQuest?.addressDetails || {
          city: "Unknown",
          state: "Unknown",
          country: "Unknown",
        },
        minLevel: editingQuest?.minLevel || 1,
        questType: editingQuest?.questType || "global",
        visibility: editingQuest?.visibility || "public",
        creatorRole: editingQuest?.creatorRole || "admin",
        photoRequirements: editingQuest?.photoRequirements || {
          subjects: ["General photo"],
        },
        rewards: editingQuest?.rewards || {
          baseXP: formData.xpReward,
          bonusXP: { speedBonus: 10, qualityBonus: 20, firstTime: 5 },
        },
        isRecurring: editingQuest?.isRecurring || false,
        moderationRequired: editingQuest?.moderationRequired || false,
        statistics: editingQuest?.statistics || {
          totalParticipants: 0,
          successRate: 0,
          averageCompletionTime: 0,
        },
      };

      if (editingQuest) {
        await updateDoc(doc(db, "quests", editingQuest.questId), questData);
        Alert.alert("Success", "Quest updated successfully!");
      } else {
        await addDoc(collection(db, "quests"), questData);
        Alert.alert("Success", "Quest created successfully!");
      }

      setModalVisible(false);
      loadQuests();
      onRefresh?.();
    } catch (error) {
      console.error("Error saving quest:", error);
      Alert.alert("Error", "Failed to save quest. Please try again.");
    }
  };

  const handleDeleteQuest = (quest: Quest) => {
    Alert.alert(
      "Delete Quest",
      `Are you sure you want to delete "${quest.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "quests", quest.questId));
              Alert.alert("Success", "Quest deleted successfully!");
              loadQuests();
              onRefresh?.();
            } catch (error) {
              console.error("Error deleting quest:", error);
              Alert.alert("Error", "Failed to delete quest.");
            }
          },
        },
      ]
    );
  };

  const toggleQuestStatus = async (quest: Quest) => {
    try {
      const newStatus = quest.status === "active" ? "expired" : "active";
      await updateDoc(doc(db, "quests", quest.questId), { status: newStatus });
      loadQuests();
      onRefresh?.();
    } catch (error) {
      console.error("Error updating quest status:", error);
      Alert.alert("Error", "Failed to update quest status.");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: "#4CAF50",
      intermediate: "#FF9800",
      advanced: "#F44336",
      expert: "#9C27B0",
    };
    return colors[difficulty as keyof typeof colors] || "#666";
  };

  const filteredQuests = quests.filter((quest) => {
    if (filter === "active") return quest.status === "active";
    if (filter === "inactive") return quest.status !== "active";
    return true;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quest Management</Text>
        <Text style={styles.subtitle}>
          {quests.length} total •{" "}
          {quests.filter((q) => q.status === "active").length} active
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              setEditingQuest(null);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Create Quest</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshButton} onPress={loadQuests}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {["all", "active", "inactive"].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterOption && styles.filterButtonTextActive,
                ]}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quest List */}
      <ScrollView style={styles.questsList}>
        {filteredQuests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="map" size={60} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Quests Found</Text>
            <Text style={styles.emptyStateText}>
              {filter === "all"
                ? "Create your first quest to get started!"
                : `No ${filter} quests found.`}
            </Text>
          </View>
        ) : (
          filteredQuests.map((quest) => (
            <View key={quest.questId} style={styles.questCard}>
              <View style={styles.questHeader}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        quest.status === "active" ? "#4CAF50" : "#999",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {quest.status === "active" ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>

              <View style={styles.questMeta}>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(quest.difficulty) },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {quest.difficulty.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.categoryText}>{quest.category}</Text>
              </View>

              <Text style={styles.questDescription}>{quest.description}</Text>

              <View style={styles.questRewards}>
                <View style={styles.rewardItem}>
                  <Ionicons name="flash" size={16} color="#FFD700" />
                  <Text style={styles.rewardText}>{quest.xpReward} XP</Text>
                </View>
                <View style={styles.rewardItem}>
                  <Ionicons name="location" size={16} color="#2196F3" />
                  <Text style={styles.rewardText}>
                    {quest.location || "Location TBD"}
                  </Text>
                </View>
                <View style={styles.rewardItem}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.rewardText}>
                    {quest.estimatedDuration}m
                  </Text>
                </View>
              </View>

              <View style={styles.questActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleQuestStatus(quest)}
                >
                  <Ionicons
                    name={quest.status === "active" ? "pause" : "play"}
                    size={16}
                    color="#007AFF"
                  />
                  <Text style={styles.actionButtonText}>
                    {quest.status === "active" ? "Deactivate" : "Activate"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingQuest(quest);
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="pencil" size={16} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.dangerButton]}
                  onPress={() => handleDeleteQuest(quest)}
                >
                  <Ionicons name="trash" size={16} color="#F44336" />
                  <Text
                    style={[styles.actionButtonText, styles.dangerButtonText]}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Quest Form Modal */}
      <QuestFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveQuest}
        editingQuest={editingQuest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },

  header: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4, marginBottom: 16 },

  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  refreshButton: { padding: 8 },

  filterContainer: { flexDirection: "row", justifyContent: "space-around" },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
  },
  filterButtonActive: { backgroundColor: "#007AFF" },
  filterButtonText: { fontSize: 14, color: "#666" },
  filterButtonTextActive: { color: "#fff" },

  questsList: { flex: 1, padding: 16 },
  emptyState: { alignItems: "center", padding: 40 },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },

  questCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  questTitle: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "white", fontSize: 12, fontWeight: "600" },

  questMeta: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: { color: "white", fontSize: 10, fontWeight: "bold" },
  categoryText: { fontSize: 12, color: "#666", fontStyle: "italic" },

  questDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },

  questRewards: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rewardItem: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  rewardText: { fontSize: 12, color: "#666", marginLeft: 4 },

  questActions: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e3f2fd",
  },
  actionButtonText: { color: "#007AFF", fontSize: 12, marginLeft: 4 },
  dangerButton: { backgroundColor: "#ffebee" },
  dangerButtonText: { color: "#F44336" },
});

export default QuestManager;
