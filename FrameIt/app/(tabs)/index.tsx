import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { homeStyles as styles } from "../../styles";
import { useAuth } from "../../contexts/AuthContext";
import FirestoreService from "../../services/FirestoreService";
import LocationService from "../../services/LocationService";
import {
  User,
  CompletedQuest,
  Quest,
  QuestAttempt,
} from "../../types/database";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";

export default function Index() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [nearbyQuests, setNearbyQuests] = useState<
    (Quest & { distance?: number })[]
  >([]);
  const [activeAttempts, setActiveAttempts] = useState<QuestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Load all data
  const loadData = async () => {
    if (!user?.uid) return;

    try {
      const [questsData, completedData, attemptsData] = await Promise.all([
        userLocation
          ? FirestoreService.getNearbyQuests(userLocation, 10, 5)
          : Promise.resolve([]),
        FirestoreService.getCompletedQuests(user.uid),
        FirestoreService.getUserQuestAttempts(user.uid),
      ]);

      setNearbyQuests(questsData);
      setCompletedQuests(completedData);
      setActiveAttempts(
        attemptsData.filter((attempt) => attempt.status === "in-progress")
      );
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Real-time listener for user data
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as User);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Initialize location services
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const permission = await LocationService.requestLocationPermission();
        setLocationPermission(permission);

        if (permission) {
          const location = await LocationService.getCurrentLocation();
          setUserLocation(location);
        }
      } catch (error) {
        console.error("Error initializing location:", error);
      }
    };

    initializeLocation();
  }, []);

  // Load quest and completion data
  useEffect(() => {
    if (!user?.uid) return;
    loadData();
  }, [user?.uid, userLocation]);

  // Calculate level progress
  const calculateLevelProgress = (xp: number, level: number) => {
    const baseXP = 500;
    const currentLevelXP = baseXP * Math.pow(1.3, level - 1);
    const nextLevelXP = baseXP * Math.pow(1.3, level);
    const progressXP = xp - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    const progressPercentage = Math.max(
      0,
      Math.min(100, (progressXP / neededXP) * 100)
    );
    const remainingXP = Math.max(0, nextLevelXP - xp);

    return { progressPercentage, remainingXP, nextLevel: level + 1 };
  };

  const quickStats = {
    level: userData?.level || 1,
    totalXP: userData?.xp || 0,
    questsCompleted: completedQuests.length,
    currentStreak: userData?.streakCount || 0,
    activeQuests: activeAttempts.length,
  };

  const levelProgress = calculateLevelProgress(
    quickStats.totalXP,
    quickStats.level
  );

  // Dynamic achievements based on user progress
  const achievements = [
    {
      id: 1,
      icon: "trophy",
      title: "First Quest",
      unlocked: completedQuests.length > 0,
    },
    {
      id: 2,
      icon: "map",
      title: "Explorer",
      unlocked: completedQuests.length >= 5,
    },
    {
      id: 3,
      icon: "camera",
      title: "Photographer",
      unlocked: completedQuests.length >= 10,
    },
    {
      id: 4,
      icon: "star",
      title: "Rising Star",
      unlocked: (userData?.level || 1) >= 5,
    },
  ];

  // Get user's display name
  const displayName = userData?.displayName || user?.displayName || "Explorer";

  if (loading) {
    return (
      <ImageBackground
        source={require("../../assets/images/blank.png")}
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
        imageStyle={styles.backgroundImage}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Loading your adventure...
        </Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/blank.png")}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
            <View
              style={[
                styles.progressFill,
                { width: `${levelProgress.progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {levelProgress.remainingXP.toLocaleString()} XP to Level{" "}
            {levelProgress.nextLevel}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.statNumber}>{quickStats.questsCompleted}</Text>
            <Text style={styles.statLabel}>Quests Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="play-circle" size={32} color="#2196F3" />
            <Text style={styles.statNumber}>{quickStats.activeQuests}</Text>
            <Text style={styles.statLabel}>Active Quests</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={32} color="#FF9800" />
            <Text style={styles.statNumber}>{quickStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Active Quest Progress */}
        {activeAttempts.length > 0 && (
          <View style={styles.section}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Ionicons name="play-circle" size={20} color="#007AFF" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                Active Quests
              </Text>
            </View>
            {activeAttempts.map((attempt) => {
              const quest = nearbyQuests.find(
                (q) => q.questId === attempt.questId
              );
              if (!quest) return null;

              return (
                <TouchableOpacity
                  key={attempt.attemptId}
                  style={[
                    styles.questCard,
                    { borderLeftWidth: 4, borderLeftColor: "#2196F3" },
                  ]}
                  onPress={() => router.push("/(tabs)/challenges")}
                >
                  <View style={styles.questInfo}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <View style={styles.questDetails}>
                      <Ionicons name="play-circle" size={14} color="#2196F3" />
                      <Text
                        style={[styles.questLocation, { color: "#2196F3" }]}
                      >
                        In Progress • Started{" "}
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.questReward,
                      {
                        backgroundColor: "#2196F3",
                        borderRadius: 15,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      },
                    ]}
                    onPress={() => router.push("/(tabs)/challenges")}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      Continue
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Friends Activity */}
        {userData?.friends && userData.friends.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="people" size={20} color="#007AFF" />
                <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                  Friends Activity
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/profile")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.friendsActivityContainer}>
              {userData.friends.slice(0, 4).map((friend) => (
                <View key={friend.friendId} style={styles.friendActivityCard}>
                  {friend.profileImageUrl ? (
                    <Image
                      source={{ uri: friend.profileImageUrl }}
                      style={styles.friendActivityAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.friendActivityAvatar,
                        styles.friendActivityAvatarPlaceholder,
                      ]}
                    >
                      <Text style={styles.friendActivityAvatarText}>
                        {friend.displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.friendActivityName} numberOfLines={1}>
                    {friend.displayName}
                  </Text>
                  <Text style={styles.friendActivityLevel}>
                    Lv.{friend.level}
                  </Text>
                </View>
              ))}
              {userData.friends.length > 4 && (
                <TouchableOpacity
                  style={styles.moreFriendsActivityCard}
                  onPress={() => router.push("/profile")}
                >
                  <View style={styles.moreFriendsActivityCircle}>
                    <Text style={styles.moreFriendsActivityText}>
                      +{userData.friends.length - 4}
                    </Text>
                  </View>
                  <Text style={styles.moreFriendsActivityLabel}>More</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Nearby Quests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                Quests Near You
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/challenges")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {nearbyQuests.slice(0, 3).map((quest) => (
            <TouchableOpacity key={quest.questId} style={styles.questCard}>
              <View style={styles.questInfo}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <View style={styles.questDetails}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.questLocation}>
                    {quest.location} • {quest.difficulty}
                  </Text>
                </View>
                {/* Photo requirements preview */}
                <View style={styles.questDetails}>
                  <Ionicons name="camera-outline" size={14} color="#666" />
                  <Text style={[styles.questLocation, { fontStyle: "italic" }]}>
                    {quest.photoRequirements.subjects.slice(0, 2).join(", ")}
                    {quest.photoRequirements.subjects.length > 2 && "..."}
                  </Text>
                </View>
              </View>
              <View style={styles.questReward}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.questXP}>{quest.xpReward} XP</Text>
                {quest.rewards.bonusXP.firstTime > 0 && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#FF9500",
                      fontWeight: "bold",
                    }}
                  >
                    +{quest.rewards.bonusXP.firstTime}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
