import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import profileStyles from "../styles/profileStyles";
import { FirestoreService } from "../services";
import { User, CompletedQuest, Achievement, Team } from "../types/database";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import ProfilePhotoModal, {
  ProfilePhotoModalRef,
} from "../components/modals/ProfilePhotoModal";
import TagChangeModal from "../components/modals/TagChangeModal";
import AchievementsDisplayModal from "../components/modals/AchievementsDisplayModal";
import SwipeableCard from "../components/shared/SwipeableCard";
import FriendsModal from "../components/social/FriendsModal";
import { TeamManagementModal } from "../components/social/TeamManagementModal";
import { JoinTeamModal } from "../components/social/JoinTeamModal";

const styles = profileStyles;

export default function Profile() {
  const { user, logout } = useAuth();
  const [profilePhotoModalVisible, setProfilePhotoModalVisible] =
    useState(false);
  const [tagChangeModalVisible, setTagChangeModalVisible] = useState(false);
  const [achievementsModalVisible, setAchievementsModalVisible] =
    useState(false);
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [teamManagementModalVisible, setTeamManagementModalVisible] =
    useState(false);
  const [joinTeamModalVisible, setJoinTeamModalVisible] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [primaryTeam, setPrimaryTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const profilePhotoModalRef = useRef<ProfilePhotoModalRef>(null);

  // Load user data
  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as User);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Load additional data
  useEffect(() => {
    if (!userData?.userId) return;

    const loadData = async () => {
      try {
        const [quests, userAchievements] = await Promise.all([
          FirestoreService.getCompletedQuests(userData.userId),
          FirestoreService.getAchievements(),
        ]);

        setCompletedQuests(quests);
        setAchievements(userAchievements);

        if (userData.primaryTeam) {
          const team = await FirestoreService.getTeam(userData.primaryTeam);
          setPrimaryTeam(team);

          if (team) {
            const members = await FirestoreService.getTeamMembers(team.teamId);
            setTeamMembers(members);
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    loadData();
  }, [userData?.userId, userData?.primaryTeam]);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleTagLongPress = () => {
    setTagChangeModalVisible(true);
  };

  const formatJoinDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Unknown";
    }
  };

  const getAdventureStats = () => {
    const totalQuests = completedQuests.length;
    const uniqueLocations = new Set(completedQuests.map((q) => q.questId)).size;
    const totalPoints = completedQuests.reduce(
      (sum, quest) => sum + (quest.xpEarned || 0),
      0
    );

    return {
      totalQuests,
      uniqueLocations,
      totalPoints,
    };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserTag = () => {
    const tagNames: { [key: string]: string } = {
      beginner: "Beginner Adventure",
      amateur: "Amateur Adventure",
      advanced: "Advanced Adventure",
      seasoned: "Seasoned Adventure",
      pro: "Pro Adventure",
    };
    return tagNames[userData?.tag || "beginner"] || "Explorer";
  };

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

  const levelProgress = calculateLevelProgress(
    userData?.xp || 0,
    userData?.level || 1
  );

  const stats = getAdventureStats();

  if (!userData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8F9FA",
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ fontSize: 16, color: "#EF4444", textAlign: "center" }}>
          Unable to load profile
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onLongPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explorer Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onLongPress={() => router.push("/settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Section - Like the old design */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onLongPress={() => setProfilePhotoModalVisible(true)}
          >
            {userData?.profileImageUrl ? (
              <Image
                source={{ uri: userData.profileImageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(userData?.displayName || "User")}
                </Text>
              </View>
            )}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>
                Lv.{userData?.level || 1}
              </Text>
            </View>
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>
            {userData?.displayName || "Adventure Seeker"}
          </Text>
          <Pressable onLongPress={handleTagLongPress}>
            <Text style={styles.userTitle}>{getUserTag()}</Text>
            <Text
              style={[styles.cardHint, { textAlign: "center", marginTop: 2 }]}
            >
              Long press to change tag
            </Text>
          </Pressable>
          <Text style={styles.userEmail}>
            {userData?.email || "user@example.com"}
          </Text>
          <Text style={styles.joinDate}>
            Explorer since {formatJoinDate(userData?.signedUpDate)}
          </Text>

          {/* XP Progress */}
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.xpText}>
                {(userData?.xp || 0).toLocaleString()} XP
              </Text>
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
        </View>

        {/* Adventure Stats Section */}
        <View style={styles.statsSection}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Ionicons name="analytics" size={20} color="#007AFF" />
            <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
              Adventure Stats
            </Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="star" size={32} color="#FFD700" />
              <Text style={styles.statNumber}>
                {(userData?.xp || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.totalQuests}</Text>
              <Text style={styles.statLabel}>Quests Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={32} color="#FF5722" />
              <Text style={styles.statNumber}>
                {userData?.streakCount || 0}
              </Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={32} color="#2196F3" />
              <Text style={styles.statNumber}>{achievements.length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <TouchableOpacity
          style={styles.achievementsSection}
          onLongPress={() => setAchievementsModalVisible(true)}
          activeOpacity={0.7}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 15,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="trophy" size={20} color="#FFD700" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                Achievements
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.achievementCount}>
                {(userData?.achievements || []).length} earned
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9CA3AF"
                style={{ marginLeft: 5 }}
              />
            </View>
          </View>
          <View style={styles.achievementsGrid}>
            {achievements.slice(0, 6).map((achievement, index) => {
              const isEarned = (userData?.achievements || []).includes(
                achievement.id
              );
              return (
                <View key={achievement.id} style={[styles.achievementCard]}>
                  <View
                    style={[
                      styles.achievementIcon,
                      { backgroundColor: isEarned ? "#FFD700" : "#F3F4F6" },
                    ]}
                  >
                    <Ionicons
                      name="trophy"
                      size={24}
                      color={isEarned ? "#fff" : "#9CA3AF"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.achievementTitle,
                      !isEarned && styles.lockedText,
                    ]}
                    numberOfLines={1}
                  >
                    {achievement.name}
                  </Text>
                  {isEarned && (
                    <View style={styles.earnedBadge}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </View>
              );
            })}
            {/* Fill remaining slots with placeholder cards */}
            {Array.from({ length: Math.max(0, 6 - achievements.length) }).map(
              (_, index) => (
                <View
                  key={`placeholder-${index}`}
                  style={[styles.achievementCard, styles.lockedAchievement]}
                >
                  <View style={[styles.achievementIcon, styles.lockedIcon]}>
                    <Ionicons name="lock-closed" size={24} color="#9CA3AF" />
                  </View>
                  <Text
                    style={[styles.achievementTitle, styles.lockedText]}
                    numberOfLines={1}
                  >
                    Coming Soon
                  </Text>
                </View>
              )
            )}
          </View>
          <Text style={styles.tapHint}>Tap to view all achievements</Text>
        </TouchableOpacity>

        {/* Friends */}
        <SwipeableCard
          title="Friends"
          subtitle={`${
            userData?.friends?.length || 0
          } friends • Swipe right to manage`}
          icon="people"
          iconColor="#4F46E5"
          onSwipeRight={() => setFriendsModalVisible(true)}
        />

        {/* Join Team */}
        <SwipeableCard
          title="Join Team"
          subtitle="Join teams with invite codes • Swipe right to join"
          icon="people-circle"
          iconColor="#4F46E5"
          onSwipeRight={() => setJoinTeamModalVisible(true)}
        />

        {/* Team Leader - Unified Management */}
        {userData?.role === "team_leader" && (
          <SwipeableCard
            title="Team Management Hub"
            subtitle="Manage teams, create challenges & quests, invite members • Swipe right to access"
            icon="analytics"
            iconColor="#007AFF"
            onSwipeRight={() => router.push("/unified-team-management")}
          />
        )}

        {/* Admin Panel */}
        {userData?.role === "admin" && (
          <SwipeableCard
            title="Admin Panel"
            subtitle="Manage app settings and users • Swipe right to access"
            icon="shield"
            iconColor="#FF4444"
            onSwipeRight={() => router.push("/admin")}
          />
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutCard} onLongPress={handleLogout}>
          <View style={styles.cardRow}>
            <Ionicons name="log-out" size={20} color="#FF4444" />
            <Text style={[styles.cardLabel, { color: "#FF4444" }]}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        ref={profilePhotoModalRef}
        visible={profilePhotoModalVisible}
        onClose={() => setProfilePhotoModalVisible(false)}
        currentPhotoURL={userData?.profileImageUrl}
        onPhotoUpdated={(newUrl) => {
          if (userData) {
            setUserData({ ...userData, profileImageUrl: newUrl });
          }
        }}
      />

      {/* Tag Change Modal */}
      <TagChangeModal
        visible={tagChangeModalVisible}
        onClose={() => setTagChangeModalVisible(false)}
        currentTag={userData?.tag || "explorer"}
      />

      {/* Achievements Display Modal */}
      <AchievementsDisplayModal
        visible={achievementsModalVisible}
        onClose={() => setAchievementsModalVisible(false)}
        userAchievements={userData?.achievements || []}
      />

      {/* Friends Modal */}
      <FriendsModal
        visible={friendsModalVisible}
        onClose={() => setFriendsModalVisible(false)}
      />

      {/* Team Management Modal */}
      <TeamManagementModal
        visible={teamManagementModalVisible}
        onClose={() => setTeamManagementModalVisible(false)}
        onTeamUpdate={() => {
          // Refresh user data after team updates
          if (user?.uid) {
            FirestoreService.getUser(user.uid).then((freshData) => {
              if (freshData) setUserData(freshData);
            });
          }
        }}
      />

      {/* Join Team Modal */}
      <JoinTeamModal
        visible={joinTeamModalVisible}
        onClose={() => setJoinTeamModalVisible(false)}
        onTeamJoined={() => {
          // Refresh user data after joining team
          if (user?.uid) {
            FirestoreService.getUser(user.uid).then((freshData) => {
              if (freshData) setUserData(freshData);
            });
          }
        }}
      />
    </View>
  );
}
