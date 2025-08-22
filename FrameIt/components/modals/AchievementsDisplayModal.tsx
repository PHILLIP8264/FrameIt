import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FirestoreService } from "../../services";
import { Achievement } from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";

interface AchievementsDisplayModalProps {
  visible: boolean;
  onClose: () => void;
  userAchievements: string[];
}

export default function AchievementsDisplayModal({
  visible,
  onClose,
  userAchievements,
}: AchievementsDisplayModalProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAchievements();
    }
  }, [visible]);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const allAchievements = await FirestoreService.getAchievements();
      setAchievements(allAchievements);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (
    type: string,
    isEarned: boolean
  ): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      quest: "map",
      vote: "heart",
      streak: "flame",
      social: "people",
      discovery: "telescope",
      challenge: "trophy",
    };

    return iconMap[type] || "star";
  };

  const getAchievementColor = (type: string, isEarned: boolean) => {
    if (!isEarned) return "#9CA3AF";

    const colorMap: { [key: string]: string } = {
      quest: "#10B981",
      vote: "#EF4444",
      streak: "#F59E0B",
      social: "#8B5CF6",
      discovery: "#3B82F6",
      challenge: "#FFD700",
    };

    return colorMap[type] || "#D61A66";
  };

  const getAchievementProgress = (achievement: Achievement) => {
    const isEarned = userAchievements.includes(achievement.id);
    return {
      isEarned,
      progress: isEarned ? 100 : 0,
      progressText: isEarned ? "Completed" : "Not earned",
    };
  };

  const categorizeAchievements = () => {
    const categories = {
      quest: achievements.filter((a) => a.type === "quest"),
      vote: achievements.filter((a) => a.type === "vote"),
      streak: achievements.filter((a) => a.type === "streak"),
    };
    return categories;
  };

  const earnedCount = achievements.filter((a) =>
    userAchievements.includes(a.id)
  ).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={["#137CD8", "#D61A66"]} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.closeButton} onLongPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Achievements</Text>
              <Text style={styles.headerSubtitle}>
                {earnedCount} of {achievements.length} earned
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="trophy" size={28} color="#FFD700" />
            </View>
          </View>
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#137CD8" />
            <Text style={styles.loadingText}>Loading achievements...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Progress Summary */}
            <View style={styles.progressSummary}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercentage}>
                  {Math.round(
                    (earnedCount / Math.max(achievements.length, 1)) * 100
                  )}
                  %
                </Text>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Text style={styles.progressText}>
                  Keep exploring to unlock more achievements!
                </Text>
              </View>
            </View>

            {/* Achievement Categories */}
            {Object.entries(categorizeAchievements()).map(
              ([category, categoryAchievements]) => {
                if (categoryAchievements.length === 0) return null;

                const categoryEarnedCount = categoryAchievements.filter((a) =>
                  userAchievements.includes(a.id)
                ).length;

                return (
                  <View key={category} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <Ionicons
                        name={getAchievementIcon(category, true)}
                        size={20}
                        color={getAchievementColor(category, true)}
                      />
                      <Text style={styles.categoryTitle}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
                        Achievements
                      </Text>
                      <Text style={styles.categoryCount}>
                        {categoryEarnedCount}/{categoryAchievements.length}
                      </Text>
                    </View>

                    <View style={styles.achievementsGrid}>
                      {categoryAchievements.map((achievement) => {
                        const progress = getAchievementProgress(achievement);
                        return (
                          <View
                            key={achievement.id}
                            style={[
                              styles.achievementCard,
                              progress.isEarned
                                ? styles.earnedAchievement
                                : styles.lockedAchievement,
                            ]}
                          >
                            <View
                              style={[
                                styles.achievementIconContainer,
                                {
                                  backgroundColor: progress.isEarned
                                    ? getAchievementColor(
                                        achievement.type,
                                        true
                                      )
                                    : "#F3F4F6",
                                },
                              ]}
                            >
                              <Ionicons
                                name={getAchievementIcon(
                                  achievement.type,
                                  progress.isEarned
                                )}
                                size={24}
                                color={progress.isEarned ? "#fff" : "#9CA3AF"}
                              />
                            </View>
                            <View style={styles.achievementInfo}>
                              <Text
                                style={[
                                  styles.achievementName,
                                  !progress.isEarned && styles.lockedText,
                                ]}
                                numberOfLines={1}
                              >
                                {achievement.name}
                              </Text>
                              <Text
                                style={[
                                  styles.achievementDescription,
                                  !progress.isEarned && styles.lockedText,
                                ]}
                                numberOfLines={2}
                              >
                                {achievement.description}
                              </Text>
                              <Text
                                style={[
                                  styles.achievementStatus,
                                  progress.isEarned
                                    ? styles.earnedStatus
                                    : styles.lockedStatus,
                                ]}
                              >
                                {progress.progressText}
                              </Text>
                            </View>
                            {progress.isEarned && (
                              <View style={styles.earnedBadge}>
                                <Ionicons
                                  name="checkmark"
                                  size={16}
                                  color="#fff"
                                />
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              }
            )}

            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerInfo: {
    flex: 1,
    alignItems: "center" as const,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  headerIcon: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#D61A66",
  },
  content: {
    flex: 1,
  },
  progressSummary: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 20,
    backgroundColor: "#F8FAFC",
    margin: 20,
    borderRadius: 12,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#137CD8",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 15,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#D61A66",
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#111827",
    flex: 1,
    marginLeft: 10,
  },
  categoryCount: {
    fontSize: 14,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  achievementsGrid: {
    paddingHorizontal: 20,
  },
  achievementCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  earnedAchievement: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  lockedAchievement: {
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB",
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  achievementStatus: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  earnedStatus: {
    color: "#10B981",
  },
  lockedStatus: {
    color: "#9CA3AF",
  },
  lockedText: {
    color: "#9CA3AF",
  },
  earnedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  bottomSpacing: {
    height: 20,
  },
};
