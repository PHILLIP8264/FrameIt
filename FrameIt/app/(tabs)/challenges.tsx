import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { challengesStyles as styles } from "../../styles";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  Quest,
  CompletedQuest,
  QuestAnalytics,
  QuestReview,
} from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";
import FirestoreService from "../../services/FirestoreService";
import LocationService, {
  LocationCoords,
} from "../../services/LocationService";
import QuestMap from "../../components/QuestMap";
import QuestDiscoveryMap from "../../components/QuestDiscoveryMap";

interface QuestWithStatus extends Quest {
  completed: boolean;
  distance?: number;
  canAttempt?: boolean;
  eligibilityReason?: string;
  analytics?: QuestAnalytics | null;
  attempts?: number;
}

export default function Challenges() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<QuestWithStatus[]>([]);
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<QuestWithStatus | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [filter, setFilter] = useState<{
    category?: string;
    difficulty?: string;
    sort: "distance" | "xp" | "difficulty";
  }>({ sort: "distance" });

  // Get user location on component mount
  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const hasPermission = await LocationService.requestLocationPermission();
      if (hasPermission) {
        const location = await LocationService.getCurrentLocation();
        setUserLocation(location);
      } else {
        // Use default Pretoria, South Africa location if permission denied
        setUserLocation({
          latitude: -25.7479,
          longitude: 28.2293,
        });
      }
    } catch (error) {
      console.error("Location initialization error:", error);
      // Use default location on error
      setUserLocation({
        latitude: -25.7479,
        longitude: 28.2293,
      });
    }
  };

  // Real-time listener for active quests
  useEffect(() => {
    loadQuests();
  }, [userLocation, filter]);

  const loadQuests = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Get quests with filters
      const questsData = await FirestoreService.getQuests({
        category: filter.category,
        difficulty: filter.difficulty,
        userLocation: userLocation || undefined,
        limitCount: 50,
      });

      // Load completed quests for current user
      const completed = await FirestoreService.getCompletedQuests(user.uid);
      setCompletedQuests(completed);

      // Enhance quests with additional data
      const enhancedQuests = await Promise.all(
        questsData.map(async (quest) => {
          const [analytics, eligibility] = await Promise.all([
            FirestoreService.getQuestAnalytics(quest.questId),
            FirestoreService.canUserAttemptQuest(user.uid, quest.questId),
          ]);

          const isCompleted = completed.some(
            (c) => c.questId === quest.questId
          );
          const distance = userLocation
            ? FirestoreService.calculateDistance(
                userLocation,
                quest.coordinates
              )
            : undefined;

          return {
            ...quest,
            completed: isCompleted,
            distance,
            canAttempt: eligibility.canAttempt,
            eligibilityReason: eligibility.reason,
            analytics,
          };
        })
      );

      // Sort quests based on selected filter
      const sortedQuests = enhancedQuests.sort((a, b) => {
        switch (filter.sort) {
          case "distance":
            if (!a.distance || !b.distance) return 0;
            return a.distance - b.distance;
          case "xp":
            return b.xpReward - a.xpReward;
          case "difficulty":
            const difficultyOrder = {
              beginner: 1,
              intermediate: 2,
              advanced: 3,
              expert: 4,
            };
            return (
              difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
            );
          default:
            return 0;
        }
      });

      setQuests(sortedQuests);
      setLoading(false);
    } catch (error) {
      console.error("Error loading quests:", error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuests();
    setRefreshing(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "#4CAF50";
      case "intermediate":
        return "#FF9800";
      case "advanced":
        return "#F44336";
      case "expert":
        return "#9C27B0";
      default:
        return "#757575";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "urban":
        return "business-outline";
      case "nature":
        return "leaf-outline";
      case "architecture":
      case "buildings":
        return "library-outline";
      case "street":
        return "walk-outline";
      case "creative":
        return "color-palette-outline";
      default:
        return "camera-outline";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "walk-outline";
      case "intermediate":
        return "bicycle-outline";
      case "advanced":
        return "rocket-outline";
      case "expert":
        return "diamond-outline";
      default:
        return "star-outline";
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return "";
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const formatAvailableHours = (quest: Quest) => {
    if (!quest.availableHours) return "Available anytime";
    return `Available ${quest.availableHours.start} - ${quest.availableHours.end}`;
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading quests...</Text>
      </View>
    );
  }

  const toggleQuest = async (questId: string) => {
    if (!user?.uid) return;

    const quest = quests.find((q) => q.questId === questId);
    if (!quest) return;

    try {
      if (quest.completed) {
        Alert.alert(
          "Quest Completed",
          "This quest has already been completed!"
        );
      } else {
        // Check eligibility first
        const eligibility = await FirestoreService.canUserAttemptQuest(
          user.uid,
          questId
        );

        if (!eligibility.canAttempt) {
          Alert.alert(
            "Cannot Start Quest",
            eligibility.reason || "This quest is not available"
          );
          return;
        }

        // Check if user is within quest radius
        if (
          userLocation &&
          quest.distance &&
          quest.distance > quest.radius / 1000
        ) {
          Alert.alert(
            "Too Far Away",
            `You need to be within ${
              quest.radius
            }m of the quest location to start. You are ${formatDistance(
              quest.distance
            )} away.`
          );
          return;
        }

        Alert.alert(
          "Start Quest",
          `${quest.title}\n\n${quest.description}\n\nLocation: ${
            quest.location
          }\n${formatAvailableHours(quest)}`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Start Quest",
              onPress: async () => {
                try {
                  const attemptId = await FirestoreService.startQuestAttempt(
                    user.uid,
                    questId,
                    userLocation || undefined
                  );

                  Alert.alert(
                    "Quest Started!",
                    "Go out and capture amazing photos! Remember to follow the photo requirements."
                  );

                  // Refresh quests to update UI
                  loadQuests();
                } catch (error) {
                  console.error("Error starting quest:", error);
                  Alert.alert("Error", "Failed to start quest");
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error toggling quest:", error);
      Alert.alert("Error", "Failed to update quest status");
    }
  };

  const deleteQuest = (questId: string) => {
    Alert.alert("Delete Quest", "Are you sure you want to delete this quest?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // TODO: Implement quest deletion for admins only
          Alert.alert(
            "Info",
            "Quest deletion is only available for administrators"
          );
        },
      },
    ]);
  };

  const openQuestDetails = (quest: QuestWithStatus) => {
    setSelectedQuest(quest);
  };

  const renderQuest = ({ item }: { item: QuestWithStatus }) => (
    <TouchableOpacity
      style={styles.questCard}
      onPress={() => openQuestDetails(item)}
    >
      <View style={styles.questHeader}>
        <View style={styles.questTitleRow}>
          <Ionicons
            name={getCategoryIcon(item.category) as any}
            size={24}
            color="#007AFF"
            style={styles.categoryIcon}
          />
          <Text style={styles.questTitle}>{item.title}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) },
            ]}
          >
            <Ionicons
              name={getDifficultyIcon(item.difficulty) as any}
              size={12}
              color="white"
            />
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.questDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.locationText}>
          {item.location}
          {item.distance && ` • ${formatDistance(item.distance)} away`}
        </Text>
      </View>

      {/* Photo Requirements */}
      <View style={styles.requirementsRow}>
        <Ionicons name="camera-outline" size={16} color="#666" />
        <Text style={styles.requirementsText}>
          {item.photoRequirements.subjects.join(", ")}
          {item.photoRequirements.timeOfDay !== "any" &&
            ` • ${item.photoRequirements.timeOfDay}`}
        </Text>
      </View>

      {/* Availability */}
      <View style={styles.availabilityRow}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.availabilityText}>
          {formatAvailableHours(item)}
        </Text>
      </View>

      {/* Analytics */}
      {item.analytics && (
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsLabel}>Success Rate</Text>
            <Text style={styles.analyticsValue}>
              {item.analytics.totalCompletions > 0
                ? `${(
                    (item.analytics.totalCompletions /
                      item.analytics.totalAttempts) *
                    100
                  ).toFixed(0)}%`
                : "N/A"}
            </Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsLabel}>Avg Time</Text>
            <Text style={styles.analyticsValue}>
              {item.analytics.averageCompletionTime}min
            </Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsLabel}>Rating</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.analyticsValue}>
                {item.analytics.averageRating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.questFooter}>
        <View style={styles.xpContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.xpText}>{item.xpReward} XP</Text>
          {item.rewards.bonusXP.firstTime > 0 && (
            <Text style={styles.bonusText}>
              +{item.rewards.bonusXP.firstTime} bonus
            </Text>
          )}
        </View>

        <View style={styles.questActions}>
          <TouchableOpacity
            style={[
              styles.questButton,
              item.completed
                ? styles.completedButton
                : !item.canAttempt
                ? styles.disabledButton
                : styles.startButton,
            ]}
            onPress={() => toggleQuest(item.questId)}
            disabled={!item.canAttempt && !item.completed}
          >
            <Ionicons
              name={
                item.completed
                  ? "checkmark-circle"
                  : !item.canAttempt
                  ? "lock-closed-outline"
                  : "play-circle-outline"
              }
              size={20}
              color="white"
            />
            <Text style={styles.buttonText}>
              {item.completed
                ? "Completed"
                : !item.canAttempt
                ? "Locked"
                : "Start Quest"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteQuest(item.questId)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Eligibility reason */}
      {!item.canAttempt && item.eligibilityReason && (
        <View style={styles.eligibilityWarning}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#FF9500"
          />
          <Text style={styles.eligibilityText}>{item.eligibilityReason}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Calculate stats
  const completedCount = quests.filter((quest) => quest.completed).length;
  const totalCount = quests.length;
  const totalXP = quests
    .filter((quest) => quest.completed)
    .reduce((sum, quest) => sum + quest.xpReward, 0);

  return (
    <ImageBackground
      source={require("../../assets/images/blank.png")}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={[styles.container, { backgroundColor: "transparent" }]}>
        {/* Stats Header */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total Quests</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>

        {/* View Toggle & Location Banner */}
        <View style={styles.locationBanner}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.locationBannerText}>
              {userLocation ? "Quests near you" : "Loading location..."}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.mapToggleButton}
            onPress={() => setShowMap(!showMap)}
          >
            <Ionicons
              name={showMap ? "list" : "map"}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>

        {/* Map or List View */}
        {showMap ? (
          <QuestDiscoveryMap
            quests={quests}
            userLocation={userLocation || undefined}
            onQuestPress={(quest) => {
              // Find the corresponding QuestWithStatus object
              const questWithStatus = quests.find(
                (q) => q.questId === quest.questId
              );
              if (questWithStatus) {
                setSelectedQuest(questWithStatus);
              }
            }}
            selectedQuestId={selectedQuest?.questId}
          />
        ) : (
          <FlatList
            data={quests}
            renderItem={renderQuest}
            keyExtractor={(item) => item.questId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {/* Quest Details Modal */}
        {selectedQuest && (
          <Modal
            visible={!!selectedQuest}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setSelectedQuest(null)}
          >
            <ScrollView style={{ flex: 1, backgroundColor: "transparent" }}>
              <View style={{ padding: 20 }}>
                {/* Modal Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text style={{ fontSize: 24, fontWeight: "bold", flex: 1 }}>
                    {selectedQuest.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedQuest(null)}
                    style={{ padding: 10 }}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Quest Details */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, color: "#666", lineHeight: 24 }}>
                    {selectedQuest.description}
                  </Text>
                </View>

                {/* Location & Distance */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 15,
                    padding: 15,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 10,
                  }}
                >
                  <Ionicons name="location" size={20} color="#007AFF" />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                      {selectedQuest.location}
                    </Text>
                    <Text style={{ color: "#666", fontSize: 14 }}>
                      {selectedQuest.addressDetails.street},{" "}
                      {selectedQuest.addressDetails.city}
                    </Text>
                    {selectedQuest.distance && (
                      <Text style={{ color: "#007AFF", fontSize: 12 }}>
                        {formatDistance(selectedQuest.distance)} away
                      </Text>
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
                      }}
                    >
                      Photo Requirements
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: 10,
                      padding: 15,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginBottom: 5 }}>
                      <Text style={{ fontWeight: "bold" }}>Subjects: </Text>
                      {selectedQuest.photoRequirements.subjects.join(", ")}
                    </Text>
                    {selectedQuest.photoRequirements.style && (
                      <Text style={{ fontSize: 16, marginBottom: 5 }}>
                        <Text style={{ fontWeight: "bold" }}>Style: </Text>
                        {selectedQuest.photoRequirements.style}
                      </Text>
                    )}
                    {selectedQuest.photoRequirements.timeOfDay !== "any" && (
                      <Text style={{ fontSize: 16, marginBottom: 5 }}>
                        <Text style={{ fontWeight: "bold" }}>Best Time: </Text>
                        {selectedQuest.photoRequirements.timeOfDay}
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
                      }}
                    >
                      Rewards
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#fff5e6",
                      borderRadius: 10,
                      padding: 15,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginBottom: 5 }}>
                      <Text style={{ fontWeight: "bold" }}>Base XP: </Text>
                      {selectedQuest.rewards.baseXP} points
                    </Text>
                    {selectedQuest.rewards.bonusXP.firstTime > 0 && (
                      <Text
                        style={{
                          fontSize: 16,
                          marginBottom: 5,
                          color: "#FF9500",
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>
                          First Time Bonus:{" "}
                        </Text>
                        +{selectedQuest.rewards.bonusXP.firstTime} XP
                      </Text>
                    )}
                    {selectedQuest.rewards.bonusXP.speedBonus > 0 && (
                      <Text
                        style={{
                          fontSize: 16,
                          marginBottom: 5,
                          color: "#FF9500",
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>
                          Speed Bonus:{" "}
                        </Text>
                        +{selectedQuest.rewards.bonusXP.speedBonus} XP (for
                        quick completion)
                      </Text>
                    )}
                    {selectedQuest.rewards.bonusXP.qualityBonus > 0 && (
                      <Text
                        style={{
                          fontSize: 16,
                          marginBottom: 5,
                          color: "#FF9500",
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>
                          Quality Bonus:{" "}
                        </Text>
                        +{selectedQuest.rewards.bonusXP.qualityBonus} XP (for
                        high-rated photos)
                      </Text>
                    )}
                  </View>
                </View>

                {/* Quest Info */}
                <View style={{ marginBottom: 20 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons
                      name="information-circle"
                      size={18}
                      color="#007AFF"
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        marginLeft: 8,
                      }}
                    >
                      Quest Info
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: 10,
                      padding: 15,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginBottom: 5 }}>
                      <Text style={{ fontWeight: "bold" }}>Difficulty: </Text>
                      {selectedQuest.difficulty}
                    </Text>
                    <Text style={{ fontSize: 16, marginBottom: 5 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        Estimated Time:{" "}
                      </Text>
                      {selectedQuest.estimatedDuration} minutes
                    </Text>
                    <Text style={{ fontSize: 16, marginBottom: 5 }}>
                      <Text style={{ fontWeight: "bold" }}>Availability: </Text>
                      {formatAvailableHours(selectedQuest)}
                    </Text>
                    {selectedQuest.maxAttempts && (
                      <Text style={{ fontSize: 16, marginBottom: 5 }}>
                        <Text style={{ fontWeight: "bold" }}>
                          Max Attempts:{" "}
                        </Text>
                        {selectedQuest.maxAttempts}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Start Quest Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: selectedQuest.completed
                      ? "#4CAF50"
                      : !selectedQuest.canAttempt
                      ? "#999"
                      : "#007AFF",
                    borderRadius: 15,
                    padding: 20,
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                  onPress={() => {
                    setSelectedQuest(null);
                    if (!selectedQuest.completed && selectedQuest.canAttempt) {
                      toggleQuest(selectedQuest.questId);
                    }
                  }}
                  disabled={
                    !selectedQuest.canAttempt && !selectedQuest.completed
                  }
                >
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
                  >
                    {selectedQuest.completed
                      ? "Completed"
                      : !selectedQuest.canAttempt
                      ? "Locked"
                      : "Start Quest"}
                  </Text>
                  {!selectedQuest.canAttempt &&
                    selectedQuest.eligibilityReason && (
                      <Text
                        style={{
                          color: "white",
                          fontSize: 14,
                          marginTop: 5,
                          opacity: 0.8,
                        }}
                      >
                        {selectedQuest.eligibilityReason}
                      </Text>
                    )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Modal>
        )}
      </View>
    </ImageBackground>
  );
}
