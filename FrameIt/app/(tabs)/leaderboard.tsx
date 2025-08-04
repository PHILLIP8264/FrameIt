import React, { useState } from "react";
import { Text, View, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { leaderboardStyles as styles } from "../../styles";

interface ExplorerEntry {
  id: string;
  name: string;
  totalXP: number;
  questsCompleted: number;
  locationsVisited: number;
  rank: number;
  level: number;
  title: string;
  badge: string;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "all"
  >("week");

  const [explorerData] = useState<ExplorerEntry[]>([
    {
      id: "1",
      name: "UrbanExplorer",
      totalXP: 8450,
      questsCompleted: 34,
      locationsVisited: 67,
      rank: 1,
      level: 12,
      title: "Master Explorer",
      badge: "🏆",
    },
    {
      id: "2",
      name: "AdventureSeeker",
      totalXP: 7280,
      questsCompleted: 29,
      locationsVisited: 58,
      rank: 2,
      level: 11,
      title: "Quest Master",
      badge: "🗺️",
    },
    {
      id: "3",
      name: "You",
      totalXP: 5890,
      questsCompleted: 23,
      locationsVisited: 45,
      rank: 3,
      level: 9,
      title: "Seasoned Adventurer",
      badge: "⭐",
      isCurrentUser: true,
    },
    {
      id: "4",
      name: "PhotoHunter",
      totalXP: 5650,
      questsCompleted: 22,
      locationsVisited: 41,
      rank: 4,
      level: 8,
      title: "Explorer",
      badge: "🎯",
    },
    {
      id: "5",
      name: "StreetWanderer",
      totalXP: 5200,
      questsCompleted: 20,
      locationsVisited: 38,
      rank: 5,
      level: 8,
      title: "Explorer",
      badge: "📸",
    },
    {
      id: "6",
      name: "NatureSeeker",
      totalXP: 4980,
      questsCompleted: 19,
      locationsVisited: 35,
      rank: 6,
      level: 7,
      title: "Adventurer",
      badge: "🌿",
    },
    {
      id: "7",
      name: "CityScout",
      totalXP: 4750,
      questsCompleted: 18,
      locationsVisited: 33,
      rank: 7,
      level: 7,
      title: "Adventurer",
      badge: "🏙️",
    },
    {
      id: "8",
      name: "LensExplorer",
      totalXP: 4420,
      questsCompleted: 17,
      locationsVisited: 29,
      rank: 8,
      level: 6,
      title: "Scout",
      badge: "📷",
    },
    {
      id: "9",
      name: "QuestRookie",
      totalXP: 3890,
      questsCompleted: 15,
      locationsVisited: 24,
      rank: 9,
      level: 5,
      title: "Scout",
      badge: "🎒",
    },
    {
      id: "10",
      name: "NewExplorer",
      totalXP: 3200,
      questsCompleted: 12,
      locationsVisited: 18,
      rank: 10,
      level: 4,
      title: "Novice",
      badge: "🗂️",
    },
  ]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return "#007AFF"; // Blue
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "trophy";
      case 2:
        return "medal-outline";
      case 3:
        return "ribbon-outline";
      default:
        return "star-outline";
    }
  };

  const getLevelProgress = (level: number) => {
    const nextLevelXP = level * 1000;
    const currentLevelXP = (level - 1) * 1000;
    return { current: currentLevelXP, next: nextLevelXP };
  };

  const renderExplorerEntry = ({ item }: { item: ExplorerEntry }) => (
    <View
      style={[
        styles.leaderboardItem,
        item.isCurrentUser && styles.currentUserItem,
      ]}
    >
      <View style={styles.rankContainer}>
        <Ionicons
          name={getRankIcon(item.rank) as any}
          size={24}
          color={getRankColor(item.rank)}
        />
        <Text style={[styles.rankText, { color: getRankColor(item.rank) }]}>
          #{item.rank}
        </Text>
      </View>

      <View style={styles.explorerInfo}>
        <View style={styles.explorerHeader}>
          <Text style={styles.explorerBadge}>{item.badge}</Text>
          <View style={styles.nameAndTitle}>
            <Text style={styles.explorerName}>{item.name}</Text>
            <Text style={styles.explorerTitle}>{item.title}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{item.level}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statValue}>
              {item.totalXP.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.statValue}>{item.questsCompleted}</Text>
            <Text style={styles.statLabel}>Quests</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="location" size={16} color="#FF5722" />
            <Text style={styles.statValue}>{item.locationsVisited}</Text>
            <Text style={styles.statLabel}>Places</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(["week", "month", "all"] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText,
              ]}
            >
              {period === "all" ? "All Time" : period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top 3 Podium */}
      <View style={styles.podiumContainer}>
        <Text style={styles.podiumTitle}>🏆 Top Explorers</Text>
        <View style={styles.podium}>
          {explorerData.slice(0, 3).map((explorer, index) => (
            <View key={explorer.id} style={styles.podiumPlace}>
              <Text style={styles.podiumBadge}>{explorer.badge}</Text>
              <Text style={styles.podiumName}>{explorer.name}</Text>
              <Text style={styles.podiumXP}>
                {explorer.totalXP.toLocaleString()} XP
              </Text>
              <View
                style={[
                  styles.podiumRank,
                  { backgroundColor: getRankColor(explorer.rank) },
                ]}
              >
                <Text style={styles.podiumRankText}>{explorer.rank}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Adventure Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.globalStat}>
          <Ionicons name="people" size={20} color="#007AFF" />
          <Text style={styles.globalStatText}>2,847 Active Explorers</Text>
        </View>
        <View style={styles.globalStat}>
          <Ionicons name="location" size={20} color="#FF5722" />
          <Text style={styles.globalStatText}>12,593 Locations Discovered</Text>
        </View>
      </View>

      {/* Full Leaderboard */}
      <Text style={styles.sectionTitle}>🗺️ Global Rankings</Text>
      <FlatList
        data={explorerData}
        renderItem={renderExplorerEntry}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}
