import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { profileStyles as styles } from "../styles";
import FirestoreService from "../services/FirestoreService";
import { User, CompletedQuest, Achievement } from "../types/database";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import ProfilePhotoModal, {
  ProfilePhotoModalRef,
} from "../components/modals/ProfilePhotoModal";

export default function Profile() {
  const { user, logout } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profilePhotoModalVisible, setProfilePhotoModalVisible] =
    useState(false);
  const [editType, setEditType] = useState<"username" | "email" | "password">(
    "username"
  );
  const [editValue, setEditValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [userData, setUserData] = useState<User | null>(null);
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const profilePhotoModalRef = useRef<ProfilePhotoModalRef>(null);

  // Real-time listener for user data
  useEffect(() => {
    if (!user?.uid) return;

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

  // Load completed quests and achievements
  useEffect(() => {
    if (!user?.uid) return;

    const loadUserData = async () => {
      try {
        const [questsData, achievementsData] = await Promise.all([
          FirestoreService.getCompletedQuests(user.uid),
          FirestoreService.getAchievements(),
        ]);
        setCompletedQuests(questsData);
        setAchievements(achievementsData);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [user?.uid]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "#666" }}>Unable to load profile data</Text>
      </View>
    );
  }

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

  const levelProgress = calculateLevelProgress(userData.xp, userData.level);

  // Get user's tag info
  const getUserTag = () => {
    const tagNames: { [key: string]: string } = {
      beginner: "Beginner Adventure",
      amateur: "Amateur Adventure",
      advanced: "Advanced Adventure",
      seasoned: "Seasoned Adventure",
      pro: "Pro Adventure",
    };
    return tagNames[userData.tag || "beginner"] || "Explorer";
  };

  // Calculate stats
  const stats = {
    name: userData.displayName || user?.displayName || "Adventure Seeker",
    email: userData.email || user?.email || "explorer@frameit.com",
    level: userData.level,
    currentTitle: getUserTag(),
    totalXP: userData.xp,
    questsCompleted: completedQuests.length,
    currentStreak: userData.streakCount,
    joinDate: new Date(userData.signedUpDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    }),
  };

  // Mock achievements with UI data
  const achievementsUI = [
    {
      id: "first-quest",
      title: "First Quest",
      icon: "trophy-outline",
      unlocked: completedQuests.length > 0,
      description: "Complete your first quest",
    },
    {
      id: "explorer",
      title: "Explorer",
      icon: "map-outline",
      unlocked: completedQuests.length >= 5,
      description: "Complete 5 quests",
    },
    {
      id: "photographer",
      title: "Photographer",
      icon: "camera-outline",
      unlocked: completedQuests.length >= 10,
      description: "Complete 10 quests",
    },
    {
      id: "adventurer",
      title: "Adventurer",
      icon: "rocket-outline",
      unlocked: userData.level >= 5,
      description: "Reach Level 5",
    },
    {
      id: "streak-master",
      title: "Streak Master",
      icon: "flame-outline",
      unlocked: userData.streakCount >= 30,
      description: "Complete quests for 30 days straight",
    },
    {
      id: "master-explorer",
      title: "Master Explorer",
      icon: "trophy",
      unlocked: userData.level >= 15,
      description: "Reach Level 15",
    },
  ];

  const recentDiscoveries = completedQuests.slice(-3).map((quest, index) => ({
    id: quest.questId,
    title: `Quest Completed`,
    location: "Adventure Location",
    date: new Date(quest.completedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const handleEditProfile = (type: "username" | "email" | "password") => {
    setEditType(type);
    setEditValue(
      type === "username" ? stats.name : type === "email" ? stats.email : ""
    );
    setEditModalVisible(true);
  };

  const handleSaveChanges = async () => {
    try {
      if (editType === "password") {
        if (editValue !== confirmPassword) {
          Alert.alert("Error", "Passwords don't match");
          return;
        }
        if (editValue.length < 6) {
          Alert.alert("Error", "Password must be at least 6 characters");
          return;
        }
        // TODO: Implement password update with Firebase
        Alert.alert("Success", "Password updated successfully");
      } else if (editType === "email") {
        // TODO: Implement email update with Firebase
        Alert.alert("Success", "Email updated successfully");
      } else if (editType === "username") {
        // TODO: Implement username update with Firebase
        Alert.alert("Success", "Username updated successfully");
      }

      setEditModalVisible(false);
      setEditValue("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePhotoUpdated = (newPhotoURL: string) => {
    // Update the local userData state to reflect the change immediately
    if (userData) {
      setUserData({
        ...userData,
        profileImageUrl: newPhotoURL,
      });
    }
  };

  const isAdmin = userData?.role === "admin" || userData?.role === "management";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explorer Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => setProfilePhotoModalVisible(true)}
        >
          {userData?.profileImageUrl ? (
            <Image
              source={{ uri: userData.profileImageUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(stats.name)}</Text>
            </View>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv.{stats.level}</Text>
          </View>
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.userName}>{stats.name}</Text>
        <Text style={styles.userTitle}>{stats.currentTitle}</Text>
        <Text style={styles.userEmail}>{stats.email}</Text>
        <Text style={styles.joinDate}>Explorer since {stats.joinDate}</Text>

        {/* XP Progress */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.xpText}>
              {stats.totalXP.toLocaleString()} XP
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
              {stats.totalXP.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.statNumber}>{stats.questsCompleted}</Text>
            <Text style={styles.statLabel}>Quests Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={32} color="#FF5722" />
            <Text style={styles.statNumber}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={32} color="#2196F3" />
            <Text style={styles.statNumber}>
              {achievementsUI.filter((a) => a.unlocked).length}
            </Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
            Achievements
          </Text>
        </View>
        <View style={styles.achievementsGrid}>
          {achievementsUI.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.lockedAchievement,
              ]}
            >
              <View
                style={[
                  styles.achievementIcon,
                  !achievement.unlocked && styles.lockedIcon,
                ]}
              >
                <Ionicons
                  name={
                    achievement.unlocked
                      ? (achievement.icon as any)
                      : "lock-closed"
                  }
                  size={24}
                  color={achievement.unlocked ? "#007AFF" : "#999"}
                />
              </View>
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

      {/* Recent Discoveries */}
      <View style={styles.recentSection}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Ionicons name="camera" size={20} color="#007AFF" />
          <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
            Recent Discoveries
          </Text>
        </View>
        {recentDiscoveries.map((discovery) => (
          <View key={discovery.id} style={styles.discoveryItem}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
            <View style={styles.discoveryInfo}>
              <Text style={styles.discoveryTitle}>{discovery.title}</Text>
              <Text style={styles.discoveryLocation}>{discovery.location}</Text>
            </View>
            <Text style={styles.discoveryDate}>{discovery.date}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsSection}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Ionicons name="settings" size={20} color="#007AFF" />
          <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
            Account Settings
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditProfile("username")}
        >
          <Ionicons name="person-outline" size={20} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>Change Username</Text>
            <Text style={styles.actionSubtext}>{stats.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditProfile("email")}
        >
          <Ionicons name="mail-outline" size={20} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>Change Email</Text>
            <Text style={styles.actionSubtext}>{stats.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditProfile("password")}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>Change Password</Text>
            <Text style={styles.actionSubtext}>••••••••</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Share Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={[styles.actionText, styles.logoutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Panel Button - Visible only to admins */}
      {isAdmin && (
        <TouchableOpacity
          style={{
            backgroundColor: "#FF6B35",
            margin: 20,
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={() => router.push("/admin")}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Admin Panel
          </Text>
        </TouchableOpacity>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Change{" "}
              {editType === "username"
                ? "Username"
                : editType === "email"
                ? "Email"
                : "Password"}
            </Text>
            <TouchableOpacity onPress={handleSaveChanges}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {editType === "password" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {editType === "username"
                  ? "New Username"
                  : editType === "email"
                  ? "New Email"
                  : "New Password"}
              </Text>
              <TextInput
                style={styles.input}
                secureTextEntry={editType === "password"}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Enter new ${editType}`}
                keyboardType={
                  editType === "email" ? "email-address" : "default"
                }
              />
            </View>

            {editType === "password" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        ref={profilePhotoModalRef}
        visible={profilePhotoModalVisible}
        onClose={() => setProfilePhotoModalVisible(false)}
        currentPhotoURL={userData?.profileImageUrl}
        onPhotoUpdated={handlePhotoUpdated}
      />
    </ScrollView>
  );
}
