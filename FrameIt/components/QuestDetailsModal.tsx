import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Quest, QuestAnalytics, QuestReview } from "../types/database";
import FirestoreService from "../services/FirestoreService";
import { useAuth } from "../contexts/AuthContext";

interface QuestDetailsModalProps {
  quest: Quest | null;
  onClose: () => void;
  onStartQuest: (questId: string) => void;
  userLocation?: { latitude: number; longitude: number };
}

export default function QuestDetailsModal({
  quest,
  onClose,
  onStartQuest,
  userLocation,
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

  return (
    <Modal
      visible={!!quest}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ScrollView style={{ flex: 1, backgroundColor: "transparent" }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                flex: 1,
                color: "#333",
              }}
            >
              {quest.title}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Quest Description */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                lineHeight: 24,
              }}
            >
              {quest.description}
            </Text>
          </View>

          {/* Location & Distance */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
              padding: 15,
              backgroundColor: "#f5f5f5",
              borderRadius: 10,
            }}
          >
            <Ionicons name="location" size={24} color="#007AFF" />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {quest.location}
              </Text>
              <Text style={{ color: "#666", fontSize: 14 }}>
                {quest.addressDetails.street}, {quest.addressDetails.city}
              </Text>
              {distance && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Ionicons name="location" size={12} color="#007AFF" />
                  <Text
                    style={{ color: "#007AFF", fontSize: 12, marginLeft: 4 }}
                  >
                    {formatDistance(distance)} away
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Photo Requirements */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="camera" size={18} color="#007AFF" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginLeft: 8,
                  color: "#333",
                }}
              >
                Photo Requirements
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#e3f2fd",
                borderRadius: 10,
                padding: 15,
                borderLeftWidth: 4,
                borderLeftColor: "#2196F3",
              }}
            >
              <Text style={{ fontSize: 16, marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold" }}>Subjects: </Text>
                {quest.photoRequirements.subjects.join(", ")}
              </Text>
              {quest.photoRequirements.style && (
                <Text style={{ fontSize: 16, marginBottom: 8 }}>
                  <Text style={{ fontWeight: "bold" }}>Style: </Text>
                  {quest.photoRequirements.style}
                </Text>
              )}
              {quest.photoRequirements.timeOfDay !== "any" && (
                <Text style={{ fontSize: 16, marginBottom: 8 }}>
                  <Text style={{ fontWeight: "bold" }}>Best Time: </Text>
                  {quest.photoRequirements.timeOfDay}
                </Text>
              )}
              {quest.photoRequirements.minResolution && (
                <Text style={{ fontSize: 14, color: "#666" }}>
                  Min resolution: {quest.photoRequirements.minResolution.width}{" "}
                  × {quest.photoRequirements.minResolution.height}
                </Text>
              )}
            </View>
          </View>

          {/* Rewards */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="trophy" size={18} color="#FFD700" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginLeft: 8,
                  color: "#333",
                }}
              >
                Rewards
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#fff3e0",
                borderRadius: 10,
                padding: 15,
                borderLeftWidth: 4,
                borderLeftColor: "#FF9800",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Base XP: </Text>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={{ marginLeft: 4 }}>
                  {quest.rewards.baseXP} points
                </Text>
              </View>
              {quest.rewards.bonusXP.firstTime > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="trophy-outline" size={14} color="#FF9500" />
                  <Text
                    style={{ fontSize: 16, marginLeft: 4, color: "#FF9500" }}
                  >
                    <Text style={{ fontWeight: "bold" }}>
                      First Time Bonus:{" "}
                    </Text>
                    +{quest.rewards.bonusXP.firstTime} XP
                  </Text>
                </View>
              )}
              {quest.rewards.bonusXP.speedBonus > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="flash" size={14} color="#FF9500" />
                  <Text
                    style={{ fontSize: 16, marginLeft: 4, color: "#FF9500" }}
                  >
                    <Text style={{ fontWeight: "bold" }}>Speed Bonus: </Text>+
                    {quest.rewards.bonusXP.speedBonus} XP (quick completion)
                  </Text>
                </View>
              )}
              {quest.rewards.bonusXP.qualityBonus > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="ribbon" size={14} color="#FF9500" />
                  <Text
                    style={{ fontSize: 16, marginLeft: 4, color: "#FF9500" }}
                  >
                    <Text style={{ fontWeight: "bold" }}>Quality Bonus: </Text>+
                    {quest.rewards.bonusXP.qualityBonus} XP (high-rated photos)
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quest Analytics */}
          {analytics && (
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons name="analytics" size={18} color="#007AFF" />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginLeft: 8,
                    color: "#333",
                  }}
                >
                  Quest Statistics
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 10,
                  padding: 15,
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#4CAF50",
                    }}
                  >
                    {analytics.totalCompletions > 0
                      ? `${(
                          (analytics.totalCompletions /
                            analytics.totalAttempts) *
                          100
                        ).toFixed(0)}%`
                      : "N/A"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    Success Rate
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#2196F3",
                    }}
                  >
                    {analytics.averageCompletionTime}m
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>Avg Time</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#FF9800",
                      }}
                    >
                      {analytics.averageRating.toFixed(1)}
                    </Text>
                    <Ionicons
                      name="star"
                      size={20}
                      color="#FFD700"
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                  <Text style={{ fontSize: 12, color: "#666" }}>Rating</Text>
                </View>
              </View>
            </View>
          )}

          {/* Quest Info */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="information-circle" size={18} color="#007AFF" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginLeft: 8,
                  color: "#333",
                }}
              >
                Quest Details
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 10,
                padding: 15,
              }}
            >
              <Text style={{ fontSize: 16, marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold" }}>Difficulty: </Text>
                {quest.difficulty.charAt(0).toUpperCase() +
                  quest.difficulty.slice(1)}
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold" }}>Estimated Time: </Text>
                {quest.estimatedDuration} minutes
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold" }}>Availability: </Text>
                {formatAvailableHours(quest)}
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold" }}>Min Level: </Text>
                Level {quest.minLevel}
              </Text>
              {quest.maxAttempts && (
                <Text style={{ fontSize: 16 }}>
                  <Text style={{ fontWeight: "bold" }}>Max Attempts: </Text>
                  {quest.maxAttempts}
                </Text>
              )}
            </View>
          </View>

          {/* Community Reviews */}
          {reviews.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 10,
                  color: "#333",
                }}
              >
                💬 Community Reviews
              </Text>
              {reviews.slice(0, 3).map((review) => (
                <View
                  key={review.reviewId}
                  style={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: 10,
                    padding: 15,
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flexDirection: "row" }}>
                      {renderStarRating(review.rating)}
                    </View>
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 12,
                        color: "#666",
                      }}
                    >
                      {review.helpfulVotes} helpful votes
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: "#333", lineHeight: 20 }}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Eligibility Warning */}
          {!canAttempt.canAttempt && canAttempt.reason && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 149, 0, 0.1)",
                borderRadius: 10,
                padding: 15,
                marginBottom: 20,
                borderLeftWidth: 4,
                borderLeftColor: "#FF9500",
              }}
            >
              <Ionicons name="warning" size={24} color="#FF9500" />
              <Text
                style={{
                  marginLeft: 10,
                  fontSize: 14,
                  color: "#FF9500",
                  flex: 1,
                }}
              >
                {canAttempt.reason}
              </Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={{
              backgroundColor: !canAttempt.canAttempt ? "#9CA3AF" : "#4F46E5",
              borderRadius: 15,
              padding: 20,
              alignItems: "center",
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => {
              if (canAttempt.canAttempt) {
                onClose();
                onStartQuest(quest.questId);
              }
            }}
            disabled={!canAttempt.canAttempt}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={!canAttempt.canAttempt ? "lock-closed" : "rocket"}
                size={24}
                color="white"
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {!canAttempt.canAttempt
                  ? "Quest Locked"
                  : "Start Quest Adventure!"}
              </Text>
            </View>
            {canAttempt.canAttempt && (
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  marginTop: 5,
                  opacity: 0.8,
                }}
              >
                Ready to capture amazing photos?
              </Text>
            )}
          </TouchableOpacity>

          {loading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}
