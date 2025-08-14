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
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { profileStyles as styles } from "../styles";
import FirestoreService from "../services/FirestoreService";
import { User, CompletedQuest, Achievement, Team } from "../types/database";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import ProfilePhotoModal, {
  ProfilePhotoModalRef,
} from "../components/modals/ProfilePhotoModal";
import FriendsModal from "../components/FriendsModal";
import { TeamManagementModal } from "../components/TeamManagementModal";
import { JoinTeamModal } from "../components/JoinTeamModal";

export default function Profile() {
  const { user, logout } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profilePhotoModalVisible, setProfilePhotoModalVisible] =
    useState(false);
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [teamManagementModalVisible, setTeamManagementModalVisible] =
    useState(false);
  const [joinTeamModalVisible, setJoinTeamModalVisible] = useState(false);
  const [editType, setEditType] = useState<"username" | "email" | "password">(
    "username"
  );
  const [editValue, setEditValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [userData, setUserData] = useState<User | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [primaryTeam, setPrimaryTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
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

  // Load team data when userData changes
  useEffect(() => {
    const loadTeamData = async () => {
      if (!userData?.teams || userData.teams.length === 0) {
        setUserTeams([]);
        setPrimaryTeam(null);
        setTeamMembers([]);
        return;
      }

      try {
        // Load all user teams
        const teams = await FirestoreService.getUserTeams(userData.userId);
        setUserTeams(teams);

        // Load primary team details and members
        if (userData.primaryTeam) {
          const [primaryTeamData, membersData] = await Promise.all([
            FirestoreService.getTeam(userData.primaryTeam),
            FirestoreService.getTeamMembers(userData.primaryTeam),
          ]);
          setPrimaryTeam(primaryTeamData);
          setTeamMembers(membersData);
        } else if (teams.length > 0) {
          // Use first team as primary if no primary team set
          const [membersData] = await Promise.all([
            FirestoreService.getTeamMembers(teams[0].teamId),
          ]);
          setPrimaryTeam(teams[0]);
          setTeamMembers(membersData);
        }
      } catch (error) {
        console.error("Error loading team data:", error);
        setUserTeams([]);
        setPrimaryTeam(null);
        setTeamMembers([]);
      }
    };

    loadTeamData();
  }, [userData?.teams, userData?.primaryTeam]);

  // Function to refresh team data (called by child components)
  const refreshTeamData = async () => {
    if (!userData?.teams || userData.teams.length === 0) return;

    try {
      const teams = await FirestoreService.getUserTeams(userData.userId);
      setUserTeams(teams);

      if (userData.primaryTeam) {
        const [primaryTeamData, membersData] = await Promise.all([
          FirestoreService.getTeam(userData.primaryTeam),
          FirestoreService.getTeamMembers(userData.primaryTeam),
        ]);
        setPrimaryTeam(primaryTeamData);
        setTeamMembers(membersData);
      }
    } catch (error) {
      console.error("Error refreshing team data:", error);
    }
  };

  // Function to refresh user data (for when user joins a group)
  const refreshUserData = async () => {
    if (!user?.uid) return;

    try {
      const freshUserData = await FirestoreService.getUser(user.uid);
      if (freshUserData) {
        setUserData(freshUserData);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
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

  const isAdmin = userData?.role === "admin";
  const isTeamLeader = userData?.role === "team_leader";

  return (
    <ImageBackground
      source={require("../assets/images/blank.png")}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <ScrollView style={styles.scrollContainer}>
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

        {/* Friends Section */}
        <View style={styles.friendsSection}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 15,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="people" size={20} color="#007AFF" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                Friends ({userData?.friends?.length || 0})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.manageFriendsButton}
              onPress={() => setFriendsModalVisible(true)}
            >
              <Ionicons name="person-add" size={16} color="#007AFF" />
              <Text style={styles.manageFriendsText}>Manage</Text>
            </TouchableOpacity>
          </View>

          {userData?.friends && userData.friends.length > 0 ? (
            <View style={styles.friendsList}>
              {userData.friends.slice(0, 6).map((friend, index) => (
                <View key={friend.friendId} style={styles.friendItem}>
                  {friend.profileImageUrl ? (
                    <Image
                      source={{ uri: friend.profileImageUrl }}
                      style={styles.friendAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.friendAvatar,
                        styles.friendAvatarPlaceholder,
                      ]}
                    >
                      <Text style={styles.friendAvatarText}>
                        {getInitials(friend.displayName)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.friendName} numberOfLines={1}>
                    {friend.displayName}
                  </Text>
                  <Text style={styles.friendLevel}>Lv.{friend.level}</Text>
                </View>
              ))}
              {userData.friends.length > 6 && (
                <TouchableOpacity
                  style={styles.moreFriendsItem}
                  onPress={() => setFriendsModalVisible(true)}
                >
                  <View style={styles.moreFriendsCircle}>
                    <Text style={styles.moreFriendsText}>
                      +{userData.friends.length - 6}
                    </Text>
                  </View>
                  <Text style={styles.moreFriendsLabel}>More</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyFriendsContainer}
              onPress={() => setFriendsModalVisible(true)}
            >
              <Ionicons name="person-add-outline" size={32} color="#8E8E93" />
              <Text style={styles.emptyFriendsText}>Add Friends</Text>
              <Text style={styles.emptyFriendsSubtext}>
                Connect with other explorers!
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Join Team Section - Only for users not in any teams */}
        {userData?.role === "basic" &&
          (!userData?.teams || userData.teams.length === 0) && (
            <View style={styles.friendsSection}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 15,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="people" size={20} color="#34C759" />
                  <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                    Join a Team
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.manageFriendsButton}
                  onPress={() => setJoinTeamModalVisible(true)}
                >
                  <Ionicons name="enter" size={16} color="#34C759" />
                  <Text
                    style={[styles.manageFriendsText, { color: "#34C759" }]}
                  >
                    Join
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.emptyFriendsContainer,
                  { borderColor: "#34C759" },
                ]}
                onPress={() => setJoinTeamModalVisible(true)}
              >
                <Ionicons name="people-outline" size={32} color="#34C759" />
                <Text style={[styles.emptyFriendsText, { color: "#34C759" }]}>
                  Join a Team
                </Text>
                <Text style={styles.emptyFriendsSubtext}>
                  Enter a team code to join a team
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Current Teams Section - For users already in teams (but not team leaders) */}
        {userData?.teams &&
          userData.teams.length > 0 &&
          !isTeamLeader &&
          !isAdmin && (
            <View style={styles.friendsSection}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <Ionicons name="people-circle" size={20} color="#34C759" />
                <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                  My Teams ({userTeams.length})
                </Text>
              </View>

              <View
                style={[
                  styles.emptyFriendsContainer,
                  {
                    borderColor: "#34C759",
                    backgroundColor: "rgba(52, 199, 89, 0.1)",
                  },
                ]}
              >
                <Ionicons name="people-circle" size={32} color="#34C759" />
                <Text style={[styles.emptyFriendsText, { color: "#34C759" }]}>
                  Team Member
                </Text>
                <Text style={styles.emptyFriendsSubtext}>
                  You're part of {userTeams.length} team
                  {userTeams.length > 1 ? "s" : ""}
                  {primaryTeam && ` • Primary: ${primaryTeam.name}`}
                </Text>
              </View>
            </View>
          )}

        {/* Team Management Section - Only for Team Leaders */}
        {isTeamLeader && (
          <View style={styles.friendsSection}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 15,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="people-circle" size={20} color="#34C759" />
                <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                  Team Management
                </Text>
              </View>
              <TouchableOpacity
                style={styles.manageFriendsButton}
                onPress={() => setTeamManagementModalVisible(true)}
              >
                <Ionicons name="settings" size={16} color="#34C759" />
                <Text style={[styles.manageFriendsText, { color: "#34C759" }]}>
                  Manage
                </Text>
              </TouchableOpacity>
            </View>

            {/* Show teams info if user has teams, otherwise show create team prompt */}
            {userTeams.length > 0 ? (
              <View
                style={[
                  styles.emptyFriendsContainer,
                  {
                    borderColor: "#34C759",
                    backgroundColor: "rgba(52, 199, 89, 0.1)",
                  },
                ]}
              >
                <View style={{ alignItems: "center", marginBottom: 15 }}>
                  <Ionicons name="people-circle" size={32} color="#34C759" />
                  <Text style={[styles.emptyFriendsText, { color: "#34C759" }]}>
                    {userTeams.length} Team{userTeams.length > 1 ? "s" : ""}
                  </Text>
                  {primaryTeam && (
                    <Text
                      style={[styles.emptyFriendsSubtext, { marginBottom: 10 }]}
                    >
                      Primary: {primaryTeam.name}
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    width: "100%",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#34C759",
                      }}
                    >
                      {teamMembers.length}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#666" }}>Members</Text>
                  </View>
                  {primaryTeam?.maxMembers && (
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#34C759",
                        }}
                      >
                        {primaryTeam.maxMembers}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#666" }}>Max</Text>
                    </View>
                  )}
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#34C759",
                      }}
                    >
                      {userTeams.filter((t) => t.isActive).length}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#666" }}>Active</Text>
                  </View>
                </View>

                {primaryTeam?.inviteCode && (
                  <View
                    style={{
                      marginTop: 15,
                      padding: 10,
                      backgroundColor: "rgba(0, 122, 255, 0.1)",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#007AFF",
                      borderStyle: "dashed",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#666",
                        textAlign: "center",
                        marginBottom: 5,
                      }}
                    >
                      Current Invite Code ({primaryTeam.name}):
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#007AFF",
                        textAlign: "center",
                        letterSpacing: 2,
                      }}
                    >
                      {primaryTeam.inviteCode}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.emptyFriendsContainer,
                  { borderColor: "#34C759" },
                ]}
                onPress={() => setTeamManagementModalVisible(true)}
              >
                <Ionicons
                  name="people-circle-outline"
                  size={32}
                  color="#34C759"
                />
                <Text style={[styles.emptyFriendsText, { color: "#34C759" }]}>
                  Create Your Team
                </Text>
                <Text style={styles.emptyFriendsSubtext}>
                  Set up and manage team members
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
      </ScrollView>

      <FriendsModal
        visible={friendsModalVisible}
        onClose={() => setFriendsModalVisible(false)}
      />

      <TeamManagementModal
        visible={teamManagementModalVisible}
        onClose={() => setTeamManagementModalVisible(false)}
        onTeamUpdate={refreshTeamData}
      />

      <JoinTeamModal
        visible={joinTeamModalVisible}
        onClose={() => setJoinTeamModalVisible(false)}
        onTeamJoined={refreshUserData}
      />
    </ImageBackground>
  );
}
