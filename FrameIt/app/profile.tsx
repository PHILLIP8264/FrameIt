import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { profileStyles as styles } from "../styles";

export default function Profile() {
  const { user, logout } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<"username" | "email" | "password">(
    "username"
  );
  const [editValue, setEditValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const explorerStats = {
    name: user?.displayName || "Adventure Seeker",
    email: user?.email || "explorer@frameit.com",
    level: 9,
    currentTitle: "Seasoned Adventurer",
    totalXP: 5890,
    questsCompleted: 23,
    locationsVisited: 45,
    photosDiscovered: 67,
    currentStreak: 7,
    joinDate: "January 2024",
  };

  const achievements = [
    {
      id: 1,
      title: "First Quest",
      icon: "🎯",
      unlocked: true,
      description: "Complete your first quest",
    },
    {
      id: 2,
      title: "Explorer",
      icon: "�️",
      unlocked: true,
      description: "Visit 10 different locations",
    },
    {
      id: 3,
      title: "Photographer",
      icon: "📸",
      unlocked: true,
      description: "Take 50 quest photos",
    },
    {
      id: 4,
      title: "Adventurer",
      icon: "🚀",
      unlocked: true,
      description: "Reach Level 5",
    },
    {
      id: 5,
      title: "Streak Master",
      icon: "🔥",
      unlocked: false,
      description: "Complete quests for 30 days straight",
    },
    {
      id: 6,
      title: "Master Explorer",
      icon: "👑",
      unlocked: false,
      description: "Reach Level 15",
    },
  ];

  const recentDiscoveries = [
    { id: 1, title: "Urban Explorer", location: "Downtown", date: "Aug 3" },
    {
      id: 2,
      title: "Golden Hour Hunter",
      location: "Riverside",
      date: "Aug 2",
    },
    {
      id: 3,
      title: "Market Stories",
      location: "Farmer's Market",
      date: "Aug 1",
    },
  ];

  const handleEditProfile = (type: "username" | "email" | "password") => {
    setEditType(type);
    setEditValue(
      type === "username"
        ? explorerStats.name
        : type === "email"
        ? explorerStats.email
        : ""
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
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(explorerStats.name)}
            </Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv.{explorerStats.level}</Text>
          </View>
        </View>

        <Text style={styles.userName}>{explorerStats.name}</Text>
        <Text style={styles.userTitle}>{explorerStats.currentTitle}</Text>
        <Text style={styles.userEmail}>{explorerStats.email}</Text>
        <Text style={styles.joinDate}>
          Explorer since {explorerStats.joinDate}
        </Text>

        {/* XP Progress */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.xpText}>
              {explorerStats.totalXP.toLocaleString()} XP
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "70%" }]} />
          </View>
          <Text style={styles.progressText}>2,110 XP to Level 10</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>🎯 Adventure Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={32} color="#FFD700" />
            <Text style={styles.statNumber}>
              {explorerStats.totalXP.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.statNumber}>
              {explorerStats.questsCompleted}
            </Text>
            <Text style={styles.statLabel}>Quests Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location" size={32} color="#FF5722" />
            <Text style={styles.statNumber}>
              {explorerStats.locationsVisited}
            </Text>
            <Text style={styles.statLabel}>Locations Visited</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="camera" size={32} color="#2196F3" />
            <Text style={styles.statNumber}>
              {explorerStats.photosDiscovered}
            </Text>
            <Text style={styles.statLabel}>Photos Captured</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>🏆 Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.lockedAchievement,
              ]}
            >
              <Text
                style={[
                  styles.achievementIcon,
                  !achievement.unlocked && styles.lockedIcon,
                ]}
              >
                {achievement.unlocked ? achievement.icon : "🔒"}
              </Text>
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
        <Text style={styles.sectionTitle}>📸 Recent Discoveries</Text>
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
        <Text style={styles.sectionTitle}>⚙️ Account Settings</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditProfile("username")}
        >
          <Ionicons name="person-outline" size={20} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>Change Username</Text>
            <Text style={styles.actionSubtext}>{explorerStats.name}</Text>
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
            <Text style={styles.actionSubtext}>{explorerStats.email}</Text>
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
    </ScrollView>
  );
}
