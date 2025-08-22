import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../../types/database";
import { FirestoreService } from "../../services";

interface UserProfileModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
}

interface UserStats {
  totalQuests: number;
  streak: number;
  joinedDate: string;
  rank: number;
  achievements: string[];
  recentActivity: {
    type: string;
    description: string;
    date: string;
  }[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function UserProfileModal({
  visible,
  user,
  onClose,
}: UserProfileModalProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadUserStats();
    }
  }, [visible, user]);

  const loadUserStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load user's completed quests
      const completedQuests = await FirestoreService.getCompletedQuests(
        user.userId
      );

      // Calculate streak (sample data for now)
      const streak = calculateStreak(completedQuests);

      // Get join date (using a fallback since createdAt might not exist)
      const joinedDate = "Member since 2024"; // Fallback for now

      // Sample achievements and recent activity
      const achievements = getAchievements(user.level, completedQuests.length);
      const recentActivity = getRecentActivity(completedQuests);

      setUserStats({
        totalQuests: completedQuests.length,
        streak,
        joinedDate,
        rank: user.level, // Using level as rank for now
        achievements,
        recentActivity,
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (completedQuests: any[]): number => {
    // Simple streak calculation - could be improved
    return Math.min(completedQuests.length, 10);
  };

  const getAchievements = (
    level: number,
    questsCompleted: number
  ): string[] => {
    const achievements = [];
    if (level >= 5) achievements.push("Explorer");
    if (level >= 10) achievements.push("Adventurer");
    if (level >= 15) achievements.push("Legend");
    if (questsCompleted >= 10) achievements.push("Quest Master");
    if (questsCompleted >= 25) achievements.push("Explorer Elite");
    return achievements;
  };

  const getRecentActivity = (completedQuests: any[]) => {
    return completedQuests.slice(0, 5).map((quest, index) => ({
      type: "quest_completed",
      description: `Completed quest "${quest.questId}"`,
      date: quest.completedAt
        ? new Date(quest.completedAt).toLocaleDateString()
        : "Recent",
    }));
  };

  const getTitleFromLevel = (level: number) => {
    if (level >= 15) return "Master Explorer";
    if (level >= 10) return "Expert Explorer";
    if (level >= 5) return "Adventurer";
    if (level >= 3) return "Scout";
    return "Novice Explorer";
  };

  const getBadgeIcon = (level: number) => {
    if (level >= 15) return "ribbon";
    if (level >= 10) return "trophy";
    if (level >= 5) return "star";
    if (level >= 3) return "medal";
    return "folder";
  };

  const getProgressToNextLevel = (currentXP: number, level: number) => {
    const currentLevelXP = (level - 1) * 1000;
    const nextLevelXP = level * 1000;
    const progress =
      ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (!user) return null;
  console.log("User Profile Modal");
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onLongPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#007AFF" />
              </View>
              <View style={styles.badgeContainer}>
                <Ionicons
                  name={getBadgeIcon(user.level) as any}
                  size={20}
                  color="#FFD700"
                />
              </View>
            </View>

            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.title}>{getTitleFromLevel(user.level)}</Text>

            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {user.level}</Text>
              <View style={styles.xpContainer}>
                <Text style={styles.xpText}>
                  {user.xp?.toLocaleString() || 0} XP
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getProgressToNextLevel(
                          user.xp || 0,
                          user.level
                        )}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : userStats ? (
            <>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.statNumber}>{userStats.totalQuests}</Text>
                  <Text style={styles.statLabel}>Quests Completed</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="flame" size={24} color="#FF5722" />
                  <Text style={styles.statNumber}>{userStats.streak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="calendar" size={24} color="#9C27B0" />
                  <Text style={styles.statNumber}>{userStats.rank}</Text>
                  <Text style={styles.statLabel}>Global Rank</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="time" size={24} color="#607D8B" />
                  <Text style={styles.statNumber}>{userStats.joinedDate}</Text>
                  <Text style={styles.statLabel}>Joined</Text>
                </View>
              </View>

              {/* Achievements */}
              {userStats.achievements.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Achievements</Text>
                  <View style={styles.achievementsContainer}>
                    {userStats.achievements.map((achievement, index) => (
                      <View key={index} style={styles.achievementBadge}>
                        <Ionicons name="medal" size={16} color="#FFD700" />
                        <Text style={styles.achievementText}>
                          {achievement}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Recent Activity */}
              {userStats.recentActivity.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Activity</Text>
                  <View style={styles.activityContainer}>
                    {userStats.recentActivity.map((activity, index) => (
                      <View key={index} style={styles.activityItem}>
                        <View style={styles.activityIcon}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#4CAF50"
                          />
                        </View>
                        <View style={styles.activityContent}>
                          <Text style={styles.activityDescription}>
                            {activity.description}
                          </Text>
                          <Text style={styles.activityDate}>
                            {activity.date}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#007AFF",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  badgeContainer: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  levelContainer: {
    alignItems: "center",
  },
  levelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
  },
  xpContainer: {
    alignItems: "center",
  },
  xpText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  achievementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8DC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  achievementText: {
    fontSize: 12,
    color: "#B8860B",
    marginLeft: 4,
    fontWeight: "500",
  },
  activityContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: "#666",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});
