import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { leaderboardStyles as styles } from "../../styles";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { User } from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";

interface ExplorerEntry extends User {
  questsCompleted: number;
  rank: number;
  title: string;
  badge: string;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "globally" | "team" | "friends"
  >("globally");
  const [explorerData, setExplorerData] = useState<ExplorerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get("window");

  const periods = ["globally", "team", "friends"] as const;
  const currentIndex = periods.indexOf(selectedPeriod);

  // Real-time listener for users (leaderboard data)
  useEffect(() => {
    const usersQuery = query(
      collection(db, "users"),
      orderBy("xp", "desc"),
      limit(50) // Top 50 users
    );

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc, index) => {
          const userData = doc.data() as User;
          return {
            ...userData,
            questsCompleted: 0,
            rank: index + 1,
            title: getTitleFromTag(userData.tag || "beginner"),
            badge: getBadgeFromLevel(userData.level),
            isCurrentUser: doc.id === user?.uid,
          } as ExplorerEntry;
        });

        setExplorerData(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const getTitleFromTag = (tag: string) => {
    const titles: { [key: string]: string } = {
      beginner: "Novice Explorer",
      amateur: "Scout",
      advanced: "Adventurer",
      seasoned: "Expert Explorer",
      pro: "Master Explorer",
    };
    return titles[tag] || "Explorer";
  };

  const getBadgeFromLevel = (level: number) => {
    if (level >= 15) return "ribbon";
    if (level >= 10) return "trophy";
    if (level >= 5) return "star";
    if (level >= 3) return "medal";
    return "folder";
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Loading leaderboard...
        </Text>
      </View>
    );
  }

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

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    const newPeriod = periods[pageIndex];
    if (newPeriod && newPeriod !== selectedPeriod) {
      setSelectedPeriod(newPeriod);
    }
  };

  const scrollToPage = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
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
          <View style={styles.explorerBadge}>
            <Ionicons name={item.badge as any} size={20} color="#FFD700" />
          </View>
          <View style={styles.nameAndTitle}>
            <Text style={styles.explorerName}>{item.displayName}</Text>
            <Text style={styles.explorerTitle}>{item.title}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{item.level}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statValue}>{item.xp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.statValue}>{item.questsCompleted}</Text>
            <Text style={styles.statLabel}>Quests</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="location" size={16} color="#FF5722" />
            <Text style={styles.statValue}>{item.questsCompleted}</Text>
            <Text style={styles.statLabel}>Places</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabContent = (period: (typeof periods)[number]) => {
    const getTabTitle = () => {
      switch (period) {
        case "globally":
          return "Global Rankings";
        case "team":
          return "Team Rankings";
        case "friends":
          return "Friends Rankings";
        default:
          return "Rankings";
      }
    };

    const getEmptyMessage = () => {
      switch (period) {
        case "team":
          return "Join a team to see team rankings!";
        case "friends":
          return "Add friends to see their rankings!";
        default:
          return "No data available";
      }
    };

    // For now, only show data for globally. Team and friends will need separate data sources
    const dataToShow = period === "globally" ? explorerData : [];

    return (
      <ScrollView
        style={{ width: screenWidth }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
        {/* Full Leaderboard */}
        {dataToShow.length > 0 ? (
          <View>
            {dataToShow.map((item) => (
              <View key={item.userId}>{renderExplorerEntry({ item })}</View>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
              {getEmptyMessage()}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { padding: 0 }]}>
      {/* Period Selector - Now acts as indicators */}
      <View
        style={[styles.periodSelector, { marginHorizontal: 20, marginTop: 20 }]}
      >
        {periods.map((period, index) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activePeriodButton,
            ]}
            onPress={() => {
              setSelectedPeriod(period);
              scrollToPage(index);
            }}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText,
              ]}
            >
              {period === "globally"
                ? "Globally"
                : period === "team"
                ? "Team"
                : "Friends"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Swipeable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {periods.map((period) => renderTabContent(period))}
      </ScrollView>
    </View>
  );
}
