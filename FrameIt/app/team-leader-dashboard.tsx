import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services";
import { User, Team, Quest } from "../types/database";
import { teamLeaderStyles as styles } from "../styles";

const formatDate = (timestamp: Date | any): string => {
  // Handle Firestore timestamp objects
  let date: Date;
  if (timestamp && typeof timestamp.toDate === "function") {
    // Firestore timestamp
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    // JavaScript Date
    date = timestamp;
  } else if (timestamp && timestamp.seconds) {
    // Firestore timestamp object format
    date = new Date(timestamp.seconds * 1000);
  } else {
    // Fallback
    return "Unknown date";
  }

  try {
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

interface TeamStats {
  totalMembers: number;
  totalXP: number;
  completedQuests: number;
  activeQuests: number;
  teamRank: number;
}

interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  targetXP: number;
  currentXP: number;
  deadline: Date;
  participants: string[];
  isActive: boolean;
  reward?: string;
}

export default function TeamLeaderDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const { width } = Dimensions.get("window");

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user?.uid]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get user data
      const userData = await FirestoreService.getUser(user!.uid);
      if (!userData || userData.role !== "team_leader") {
        Alert.alert(
          "Access Denied",
          "You must be a team leader to access this dashboard."
        );
        router.back();
        return;
      }

      setUserData(userData);

      // Get user's teams
      const teams = await FirestoreService.getUserTeams(user!.uid);
      setUserTeams(teams);

      // Select first team by default
      if (teams.length > 0) {
        const firstTeam = teams[0];
        setSelectedTeam(firstTeam);
        await loadTeamData(firstTeam);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async (team: Team) => {
    try {
      // Get team members
      const members = await FirestoreService.getTeamMembers(team.teamId);

      // Calculate team stats
      const totalXP = members.reduce(
        (sum, member) => sum + (member.xp || 0),
        0
      );
      const stats: TeamStats = {
        totalMembers: members.length,
        totalXP,
        completedQuests: 0, // TODO: Implement quest counting
        activeQuests: 0, // TODO: Implement active quest counting
        teamRank: 1, // TODO: Calculate actual team rank
      };

      setTeamStats(stats);

      // Load team challenges
      const challenges: TeamChallenge[] = [
        {
          id: "1",
          title: "Weekly XP Challenge",
          description: "Team goal: Earn 5000 XP this week",
          targetXP: 5000,
          currentXP: totalXP % 5000,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          participants: members.map((m) => m.userId),
          isActive: true,
          reward: "Team Achievement Badge",
        },
        {
          id: "2",
          title: "Urban Explorer Challenge",
          description: "Complete 20 urban quests as a team",
          targetXP: 20,
          currentXP: 12,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          participants: members.map((m) => m.userId),
          isActive: true,
          reward: "Exclusive Urban Badge",
        },
      ];

      setTeamChallenges(challenges);

      // Sample recent activity
      setRecentActivity([
        { type: "member_joined", user: "John Doe", time: "2 hours ago" },
        {
          type: "quest_completed",
          user: "Jane Smith",
          quest: "City Center Photo",
          time: "4 hours ago",
        },
        {
          type: "challenge_started",
          challenge: "Weekly XP Challenge",
          time: "1 day ago",
        },
      ]);
    } catch (error) {
      console.error("Error loading team data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleCreateChallenge = () => {
    // Navigate to create challenge screen
    router.push("/create-team-challenge");
  };

  const handleManageTeam = () => {
    // Navigate to enhanced team management
    router.push("/enhanced-team-management");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData || userData.role !== "team_leader") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color="#FF4757" />
          <Text style={styles.errorTitle}>Access Restricted</Text>
          <Text style={styles.errorMessage}>
            This dashboard is only available for team leaders.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onLongPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onLongPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Leader Dashboard</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onLongPress={handleManageTeam}
        >
          <Ionicons name="settings" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Team Selector */}
        {userTeams.length > 1 && (
          <View style={styles.teamSelector}>
            <Text style={styles.sectionTitle}>Select Team</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {userTeams.map((team) => (
                <TouchableOpacity
                  key={team.teamId}
                  style={[
                    styles.teamCard,
                    selectedTeam?.teamId === team.teamId &&
                      styles.selectedTeamCard,
                  ]}
                  onLongPress={() => {
                    setSelectedTeam(team);
                    loadTeamData(team);
                  }}
                >
                  <Text
                    style={[
                      styles.teamCardName,
                      selectedTeam?.teamId === team.teamId &&
                        styles.selectedTeamCardName,
                    ]}
                  >
                    {team.name}
                  </Text>
                  <Text style={styles.teamCardMembers}>
                    {team.members?.length || 0} members
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedTeam && (
          <>
            {/* Team Overview */}
            <View style={styles.overviewSection}>
              <Text style={styles.sectionTitle}>{selectedTeam.name}</Text>
              <Text style={styles.sectionSubtitle}>Team Overview</Text>

              {teamStats && (
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Ionicons name="people" size={24} color="#007AFF" />
                    <Text style={styles.statNumber}>
                      {teamStats.totalMembers}
                    </Text>
                    <Text style={styles.statLabel}>Members</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="trophy" size={24} color="#FFD700" />
                    <Text style={styles.statNumber}>
                      {teamStats.totalXP.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Total XP</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="flag" size={24} color="#28A745" />
                    <Text style={styles.statNumber}>
                      {teamStats.completedQuests}
                    </Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="trending-up" size={24} color="#FF6B35" />
                    <Text style={styles.statNumber}>#{teamStats.teamRank}</Text>
                    <Text style={styles.statLabel}>Team Rank</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Active Challenges */}
            <View style={styles.challengesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Team Challenges</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onLongPress={handleCreateChallenge}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>

              {teamChallenges.map((challenge) => (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <View
                      style={[
                        styles.challengeStatus,
                        challenge.isActive
                          ? styles.activeStatus
                          : styles.inactiveStatus,
                      ]}
                    >
                      <Text style={styles.challengeStatusText}>
                        {challenge.isActive ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.challengeDescription}>
                    {challenge.description}
                  </Text>

                  <View style={styles.challengeProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(
                              (challenge.currentXP / challenge.targetXP) * 100,
                              100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {challenge.currentXP} / {challenge.targetXP}
                    </Text>
                  </View>

                  <View style={styles.challengeFooter}>
                    <View style={styles.challengeInfo}>
                      <Ionicons name="time" size={16} color="#666" />
                      <Text style={styles.challengeDeadline}>
                        Ends {formatDate(challenge.deadline)}
                      </Text>
                    </View>
                    <View style={styles.challengeParticipants}>
                      <Ionicons name="people" size={16} color="#666" />
                      <Text style={styles.participantCount}>
                        {challenge.participants.length} participants
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Recent Activity */}
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>

              {recentActivity.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={
                        activity.type === "member_joined"
                          ? "person-add"
                          : activity.type === "quest_completed"
                          ? "checkmark-circle"
                          : "flash"
                      }
                      size={20}
                      color="#007AFF"
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      {activity.type === "member_joined" &&
                        `${activity.user} joined the team`}
                      {activity.type === "quest_completed" &&
                        `${activity.user} completed ${activity.quest}`}
                      {activity.type === "challenge_started" &&
                        `${activity.challenge} was started`}
                    </Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              <View style={styles.actionsGrid}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onLongPress={handleManageTeam}
                >
                  <Ionicons name="people" size={32} color="#007AFF" />
                  <Text style={styles.actionTitle}>Manage Team</Text>
                  <Text style={styles.actionSubtitle}>Add/remove members</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onLongPress={handleCreateChallenge}
                >
                  <Ionicons name="trophy" size={32} color="#FFD700" />
                  <Text style={styles.actionTitle}>Create Challenge</Text>
                  <Text style={styles.actionSubtitle}>Set team goals</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onLongPress={() => router.push("/(tabs)/leaderboard")}
                >
                  <Ionicons name="analytics" size={32} color="#28A745" />
                  <Text style={styles.actionTitle}>View Analytics</Text>
                  <Text style={styles.actionSubtitle}>Team performance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onLongPress={() => router.push("/(tabs)/leaderboard")}
                >
                  <Ionicons name="podium" size={32} color="#FF6B35" />
                  <Text style={styles.actionTitle}>Leaderboard</Text>
                  <Text style={styles.actionSubtitle}>Team rankings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
