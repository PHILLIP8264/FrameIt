import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Quest, QuestAnalytics, QuestReview } from "../../types/database";
import { FirestoreService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import SwipeButton from "../shared/SwipeButton";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface QuestDetailsModalProps {
  quest: Quest | null;
  onClose: () => void;
  onStartQuest: (questId: string) => void;
  userLocation?: { latitude: number; longitude: number };
  asPage?: boolean;
}

export default function QuestDetailsModal({
  quest,
  onClose,
  onStartQuest,
  userLocation,
  asPage = false,
}: QuestDetailsModalProps) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<QuestAnalytics | null>(null);
  const [reviews, setReviews] = useState<QuestReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [canAttempt, setCanAttempt] = useState<{
    canAttempt: boolean;
    reason?: string;
  }>({ canAttempt: true });

  useEffect(() => {
    if (!quest || !user?.uid) return;

    const loadQuestData = async () => {
      setLoading(true);
      try {
        const [analyticsData, reviewsData, eligibility] = await Promise.all([
          FirestoreService.getQuestAnalytics(quest.questId),
          FirestoreService.getQuestReviews(quest.questId),
          FirestoreService.canUserAttemptQuest(user.uid, quest.questId),
        ]);

        setAnalytics(analyticsData);
        setReviews(reviewsData);
        setCanAttempt(eligibility);
      } catch (error) {
        console.error("Error loading quest data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestData();
  }, [quest, user?.uid]);

  if (!quest) return null;

  const formatDistance = (distance?: number) => {
    if (!distance) return "";
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const formatAvailableHours = (quest: Quest) => {
    if (!quest.availableHours) return "Available anytime";
    return `Available ${quest.availableHours.start} - ${quest.availableHours.end}`;
  };

  const distance = userLocation
    ? FirestoreService.calculateDistance(userLocation, quest.coordinates)
    : undefined;

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  const getCategoryGradient = (category: string): [string, string] => {
    switch (category.toLowerCase()) {
      case "urban":
        return ["#667eea", "#764ba2"];
      case "nature":
        return ["#11998e", "#38ef7d"];
      case "historical":
        return ["#f093fb", "#f5576c"];
      case "cultural":
        return ["#4facfe", "#00f2fe"];
      case "creative":
        return ["#fa709a", "#fee140"];
      default:
        return ["#667eea", "#764ba2"];
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "hard":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "walk";
      case "medium":
        return "fitness";
      case "hard":
        return "barbell";
      default:
        return "help-circle";
    }
  };

  const handleSwipeLeft = () => {
    onClose();
  };

  const handleSwipeRight = () => {
    if (canAttempt.canAttempt && quest) {
      onStartQuest(quest.questId);
    }
  };

  const contentView = (
    <ImageBackground
      source={require("../../assets/images/blank.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
        style={styles.wrapper}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={getCategoryGradient(quest.category)}
          style={styles.heroHeader}
        >
          <View style={styles.heroContent}>
            <TouchableOpacity onLongPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.questBadges}>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(quest.difficulty) },
                ]}
              >
                <Ionicons
                  name={getDifficultyIcon(quest.difficulty) as any}
                  size={16}
                  color="white"
                />
                <Text style={styles.difficultyText}>{quest.difficulty}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{quest.category}</Text>
              </View>
            </View>

            <Text style={styles.questTitle}>{quest.title}</Text>

            {distance && (
              <View style={styles.distanceContainer}>
                <Ionicons
                  name="location"
                  size={16}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.distanceText}>
                  {formatDistance(distance)} away
                </Text>
              </View>
            )}

            <View style={styles.xpContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.xpText}>{quest.rewards.baseXP} XP</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Stats */}
          {analytics && (
            <View style={styles.quickStatsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {analytics.totalCompletions > 0
                    ? `${(
                        (analytics.totalCompletions / analytics.totalAttempts) *
                        100
                      ).toFixed(0)}%`
                    : "N/A"}
                </Text>
                <Text style={styles.statLabel}>Success</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.statValue}>
                    {analytics.averageRating.toFixed(1)}
                  </Text>
                  <Ionicons
                    name="star"
                    size={16}
                    color="#FFD700"
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {analytics.averageCompletionTime}m
                </Text>
                <Text style={styles.statLabel}>Avg Time</Text>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.description}>{quest.description}</Text>
          </View>

          {/* Location */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <View style={styles.locationCard}>
              <Text style={styles.locationName}>{quest.location}</Text>
              <Text style={styles.locationAddress}>
                {quest.addressDetails?.street
                  ? `${quest.addressDetails.street}, `
                  : ""}
                {quest.addressDetails?.city || "Location details unavailable"}
              </Text>
            </View>
          </View>

          {/* Photo Requirements */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={24} color="#E91E63" />
              <Text style={styles.sectionTitle}>Photo Requirements</Text>
            </View>
            <View style={styles.requirementsCard}>
              <View style={styles.requirementItem}>
                <Ionicons name="images" size={18} color="#E91E63" />
                <View style={styles.requirementContent}>
                  <Text style={styles.requirementLabel}>Subjects</Text>
                  <Text style={styles.requirementValue}>
                    {quest.photoRequirements.subjects.join(", ")}
                  </Text>
                </View>
              </View>

              {quest.photoRequirements.style && (
                <View style={styles.requirementItem}>
                  <Ionicons name="brush" size={18} color="#E91E63" />
                  <View style={styles.requirementContent}>
                    <Text style={styles.requirementLabel}>Style</Text>
                    <Text style={styles.requirementValue}>
                      {quest.photoRequirements.style}
                    </Text>
                  </View>
                </View>
              )}

              {quest.photoRequirements.timeOfDay !== "any" && (
                <View style={styles.requirementItem}>
                  <Ionicons name="time" size={18} color="#E91E63" />
                  <View style={styles.requirementContent}>
                    <Text style={styles.requirementLabel}>Best Time</Text>
                    <Text style={styles.requirementValue}>
                      {quest.photoRequirements.timeOfDay}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.sectionTitle}>Rewards</Text>
            </View>
            <View style={styles.rewardsCard}>
              <View style={styles.rewardItem}>
                <View style={styles.rewardIconContainer}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                </View>
                <View style={styles.rewardContent}>
                  <Text style={styles.rewardValue}>
                    {quest.rewards.baseXP} XP
                  </Text>
                  <Text style={styles.rewardLabel}>Base Reward</Text>
                </View>
              </View>

              {quest.rewards.bonusXP.firstTime > 0 && (
                <View style={styles.rewardItem}>
                  <View
                    style={[
                      styles.rewardIconContainer,
                      { backgroundColor: "rgba(76, 175, 80, 0.1)" },
                    ]}
                  >
                    <Ionicons name="trophy" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.rewardContent}>
                    <Text style={styles.rewardValue}>
                      +{quest.rewards.bonusXP.firstTime} XP
                    </Text>
                    <Text style={styles.rewardLabel}>First Time Bonus</Text>
                  </View>
                </View>
              )}

              {quest.rewards.bonusXP.speedBonus > 0 && (
                <View style={styles.rewardItem}>
                  <View
                    style={[
                      styles.rewardIconContainer,
                      { backgroundColor: "rgba(255, 152, 0, 0.1)" },
                    ]}
                  >
                    <Ionicons name="flash" size={20} color="#FF9800" />
                  </View>
                  <View style={styles.rewardContent}>
                    <Text style={styles.rewardValue}>
                      +{quest.rewards.bonusXP.speedBonus} XP
                    </Text>
                    <Text style={styles.rewardLabel}>Speed Bonus</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Quest Details */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color="#2196F3" />
              <Text style={styles.sectionTitle}>Details</Text>
            </View>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {quest.estimatedDuration} min
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="trophy" size={16} color="#666" />
                <Text style={styles.detailText}>Level {quest.minLevel}+</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {formatAvailableHours(quest)}
                </Text>
              </View>
              {quest.maxAttempts && (
                <View style={styles.detailItem}>
                  <Ionicons name="repeat" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {quest.maxAttempts} attempts max
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Community Reviews */}
          {reviews.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbubbles" size={24} color="#9C27B0" />
                <Text style={styles.sectionTitle}>Community Reviews</Text>
              </View>
              {reviews.slice(0, 2).map((review) => (
                <View key={review.reviewId} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewStars}>
                      {renderStarRating(review.rating)}
                    </View>
                    <Text style={styles.reviewHelpful}>
                      {review.helpfulVotes} helpful
                    </Text>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Eligibility Warning */}
          {!canAttempt.canAttempt && canAttempt.reason && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={24} color="#FF9500" />
              <Text style={styles.warningText}>{canAttempt.reason}</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Quest Action SwipeButton */}
        <View style={styles.swipeButtonContainer}>
          <SwipeButton
            leftText="Cancel"
            rightText={!canAttempt.canAttempt ? "Locked" : "Start Quest"}
            centerText={!canAttempt.canAttempt ? "🔒" : "🚀"}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            disabled={!canAttempt.canAttempt}
            instructionText={
              !canAttempt.canAttempt
                ? canAttempt.reason || "Quest is locked"
                : "Swipe right to start your quest adventure!"
            }
          />
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </LinearGradient>
    </ImageBackground>
  );

  if (asPage) {
    return contentView;
  }

  return (
    <Modal
      visible={!!quest}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {contentView}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },
  heroHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroContent: {
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  questBadges: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  difficultyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  categoryBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  questTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  distanceText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "500",
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 8,
  },
  xpText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 5,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 8,
  },
  locationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: "#666",
  },
  requirementsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  requirementContent: {
    flex: 1,
  },
  requirementLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  requirementValue: {
    fontSize: 14,
    color: "#666",
  },
  rewardsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  rewardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardContent: {
    flex: 1,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  rewardLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  detailsGrid: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewStars: {
    flexDirection: "row",
  },
  reviewHelpful: {
    fontSize: 12,
    color: "#666",
  },
  reviewText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
    gap: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#FF9500",
    flex: 1,
    fontWeight: "500",
  },
  swipeButtonContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: "white",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});
