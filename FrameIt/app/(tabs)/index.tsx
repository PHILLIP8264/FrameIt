import React from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { homeStyles as styles } from "../../styles";

export default function Index() {
  const quickStats = {
    level: 9,
    totalXP: 5890,
    questsCompleted: 23,
    locationsVisited: 45,
    currentStreak: 7,
  };

  const nearbyQuests = [
    {
      id: 1,
      title: "Urban Explorer",
      location: "Downtown",
      xp: 150,
      distance: "0.8km",
    },
    {
      id: 2,
      title: "Street Art Hunter",
      location: "Arts District",
      xp: 200,
      distance: "1.2km",
    },
    {
      id: 3,
      title: "Architecture Seeker",
      location: "Business District",
      xp: 300,
      distance: "2.1km",
    },
  ];

  const achievements = [
    { id: 1, icon: "🏆", title: "First Quest", unlocked: true },
    { id: 2, icon: "🗺️", title: "Explorer", unlocked: true },
    { id: 3, icon: "📸", title: "Photographer", unlocked: true },
    { id: 4, icon: "⭐", title: "Rising Star", unlocked: false },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Ready for Adventure? 🗺️</Text>
        <Text style={styles.welcomeSubtitle}>
          Discover amazing locations and capture the world around you
        </Text>
      </View>

      {/* Level & XP Progress */}
      <View style={styles.levelSection}>
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {quickStats.level}</Text>
          </View>
          <View style={styles.xpContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.xpText}>
              {quickStats.totalXP.toLocaleString()} XP
            </Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "70%" }]} />
        </View>
        <Text style={styles.progressText}>2,110 XP to Level 10</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
          <Text style={styles.statNumber}>{quickStats.questsCompleted}</Text>
          <Text style={styles.statLabel}>Quests Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="location" size={32} color="#FF5722" />
          <Text style={styles.statNumber}>{quickStats.locationsVisited}</Text>
          <Text style={styles.statLabel}>Places Visited</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={32} color="#FF9800" />
          <Text style={styles.statNumber}>{quickStats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Nearby Quests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Quests Near You</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/challenges")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {nearbyQuests.map((quest) => (
          <TouchableOpacity key={quest.id} style={styles.questCard}>
            <View style={styles.questInfo}>
              <Text style={styles.questTitle}>{quest.title}</Text>
              <View style={styles.questDetails}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.questLocation}>
                  {quest.location} • {quest.distance}
                </Text>
              </View>
            </View>
            <View style={styles.questReward}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.questXP}>{quest.xp} XP</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Recent Achievements</Text>
        <View style={styles.achievementGrid}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.lockedAchievement,
              ]}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text
                style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.lockedText,
                ]}
              >
                {achievement.title}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => router.push("/(tabs)/challenges")}
        >
          <Ionicons name="map" size={24} color="white" />
          <Text style={styles.primaryActionText}>Start New Quest</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => router.push("/(tabs)/gallery")}
          >
            <Ionicons name="camera" size={20} color="#007AFF" />
            <Text style={styles.secondaryActionText}>View Discoveries</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => router.push("/(tabs)/leaderboard")}
          >
            <Ionicons name="trophy" size={20} color="#007AFF" />
            <Text style={styles.secondaryActionText}>Rankings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
