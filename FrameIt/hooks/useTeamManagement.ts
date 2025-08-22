import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import { FirestoreService } from "../services";
import {
  User,
  Team,
  Quest,
  TeamActivity,
  TeamChallenge as DatabaseTeamChallenge,
} from "../types/database";

interface TeamMember extends User {
  joinedAt?: Date;
  isLeader?: boolean;
}

interface TeamChallenge {
  id: string;
  teamId: string;
  title: string;
  description: string;
  type: "xp" | "quests" | "locations" | "time";
  targetValue: number;
  currentValue: number;
  reward?: string;
  status: "active" | "completed" | "paused" | "failed";
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
  progress?: number;
  participants?: string[];
  startDate?: Date;
  deadline?: Date;
  isActive?: boolean;
  duration?: number;
}

interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  type: "xp" | "quests" | "locations" | "time";
  defaultTarget: number;
  icon: string;
  color: string;
}

interface TeamQuest {
  id?: string;
  title: string;
  description: string;
  location: string;
  category: "urban" | "nature" | "cultural" | "adventure" | "social";
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
  targetTeams: string[];
  isActive: boolean;
  createdBy: string;
  createdAt?: Date;
}

type TabType = "overview" | "members" | "challenges" | "quests" | "create";

export function useTeamManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);
  const [teamQuests, setTeamQuests] = useState<TeamQuest[]>([]);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Modal states
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showCreateQuest, setShowCreateQuest] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showTeamCode, setShowTeamCode] = useState(false);

  // Form states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  // Challenge form
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeType, setChallengeType] = useState<
    "xp" | "quests" | "locations" | "time"
  >("xp");
  const [targetValue, setTargetValue] = useState("");
  const [duration, setDuration] = useState("7");
  const [reward, setReward] = useState("");

  // Quest form
  const [questTitle, setQuestTitle] = useState("");
  const [questDescription, setQuestDescription] = useState("");
  const [questLocation, setQuestLocation] = useState("");
  const [questCategory, setQuestCategory] = useState("Nature");
  const [questXP, setQuestXP] = useState("");
  const [questDifficulty, setQuestDifficulty] = useState<
    "beginner" | "intermediate" | "advanced" | "expert"
  >("beginner");
  const [questDuration, setQuestDuration] = useState("30");

  // Team creation form
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState("50");

  const challengeTemplates: ChallengeTemplate[] = [
    {
      id: "weekly_xp",
      title: "Weekly XP Challenge",
      description: "Team goal: Earn {target} XP this week",
      type: "xp",
      defaultTarget: 5000,
      icon: "trophy",
      color: "#FFD700",
    },
    {
      id: "quest_marathon",
      title: "Quest Marathon",
      description: "Complete {target} quests as a team",
      type: "quests",
      defaultTarget: 20,
      icon: "flag",
      color: "#007AFF",
    },
    {
      id: "explorer_challenge",
      title: "Location Explorer",
      description: "Discover {target} unique locations",
      type: "locations",
      defaultTarget: 10,
      icon: "location",
      color: "#28A745",
    },
  ];

  // Helper functions
  const getActivityIcon = (type: TeamActivity["type"]) => {
    switch (type) {
      case "member_joined":
        return "person-add";
      case "member_left":
        return "person-remove";
      case "challenge_created":
        return "trophy";
      case "challenge_completed":
        return "checkmark-circle";
      case "challenge_deleted":
        return "trash";
      case "quest_created":
        return "map";
      case "quest_completed":
        return "flag";
      case "quest_deleted":
        return "trash";
      case "team_created":
        return "people";
      case "progress_update":
        return "trending-up";
      default:
        return "information-circle";
    }
  };

  const getActivityColor = (type: TeamActivity["type"]) => {
    switch (type) {
      case "member_joined":
        return "#007AFF";
      case "member_left":
        return "#FF6B6B";
      case "challenge_created":
        return "#FFD700";
      case "challenge_completed":
        return "#28A745";
      case "challenge_deleted":
        return "#FF6B6B";
      case "quest_created":
        return "#007AFF";
      case "quest_completed":
        return "#28A745";
      case "quest_deleted":
        return "#FF6B6B";
      case "team_created":
        return "#007AFF";
      case "progress_update":
        return "#FF9500";
      default:
        return "#666";
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Unknown time";

    try {
      let date: Date;
      if (timestamp && typeof timestamp.toDate === "function") {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (
        typeof timestamp === "string" ||
        typeof timestamp === "number"
      ) {
        date = new Date(timestamp);
      } else {
        return "Unknown time";
      }

      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Unknown time";
    }
  };

  const formatActivityTimestamp = (timestamp: any) => {
    if (!timestamp) return "Unknown time";

    try {
      let date: Date;
      if (timestamp && typeof timestamp.toDate === "function") {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (
        typeof timestamp === "string" ||
        typeof timestamp === "number"
      ) {
        date = new Date(timestamp);
      } else {
        return "Unknown time";
      }

      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting activity timestamp:", error);
      return "Unknown time";
    }
  };

  // Data loading functions
  const loadData = async () => {
    if (!user?.uid) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    try {
      const userData = await FirestoreService.getUser(user.uid);
      if (!userData) {
        Alert.alert("Error", "User data not found");
        return;
      }

      if (userData.role !== "team_leader") {
        Alert.alert(
          "Access Denied",
          "Only team leaders can access this feature",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      const teams = await FirestoreService.getUserTeams(user.uid);
      setUserTeams(teams);

      if (teams.length > 0) {
        await selectTeam(teams[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const selectTeam = async (team: Team) => {
    setSelectedTeam(team);
    setLoading(true);

    try {
      const [members, challenges, quests, activities] = await Promise.all([
        FirestoreService.getTeamMembers(team.teamId),
        FirestoreService.getTeamChallenges(team.teamId),
        FirestoreService.getTeamQuests(team.teamId),
        FirestoreService.getTeamActivities(team.teamId),
      ]);

      setTeamMembers(members);

      const formattedChallenges = challenges.map(
        (challenge: DatabaseTeamChallenge) => ({
          id: challenge.challengeId,
          teamId: challenge.teamId,
          title: challenge.title,
          description: challenge.description,
          type: challenge.type,
          targetValue: challenge.targetValue,
          currentValue: challenge.currentValue,
          duration: (challenge as any).duration || 7,
          reward: challenge.reward,
          status: challenge.status,
          createdAt: challenge.createdAt,
          completedAt: challenge.completedAt,
          createdBy: challenge.createdBy,
        })
      );
      setTeamChallenges(formattedChallenges);

      setTeamQuests([]);
      setTeamActivities(activities || []);
    } catch (error) {
      console.error("Error loading team data:", error);
      Alert.alert("Error", "Failed to load team details");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Team management functions
  const createTeam = async () => {
    if (!user?.uid || !teamName.trim()) {
      Alert.alert("Error", "Please enter a team name");
      return;
    }

    setLoading(true);
    try {
      const teamId = await FirestoreService.createTeam(
        {
          name: teamName.trim(),
          description: teamDescription.trim() || undefined,
          maxMembers: parseInt(maxMembers) || 50,
        },
        user.uid
      );

      Alert.alert("Success", "Team created successfully!");
      resetTeamForm();
      setShowCreateTeam(false);
      await loadData();
    } catch (error: any) {
      console.error("Error creating team:", error);
      Alert.alert("Error", error.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    if (!selectedTeam) return;

    try {
      const code = await FirestoreService.generateTeamCode(selectedTeam.teamId);
      setGeneratedCode(code);
      setShowTeamCode(true);
    } catch (error) {
      console.error("Error generating invite code:", error);
      Alert.alert("Error", "Failed to generate invite code");
    }
  };

  const inviteByEmail = async () => {
    if (!selectedTeam || !inviteEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    try {
      Alert.alert("Info", "Email invitation feature coming soon");
    } catch (error: any) {
      console.error("Error inviting user:", error);
      Alert.alert("Error", error.message || "Failed to send invitation");
    }
  };

  // Challenge management functions
  const createChallenge = async () => {
    if (!selectedTeam || !challengeTitle.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      Alert.alert("Info", "Challenge creation feature coming soon");
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      Alert.alert("Error", error.message || "Failed to create challenge");
    }
  };

  // Quest management functions
  const createQuest = async () => {
    if (!selectedTeam || !questTitle.trim() || !questLocation.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      Alert.alert("Info", "Quest creation feature coming soon");
    } catch (error: any) {
      console.error("Error creating quest:", error);
      Alert.alert("Error", error.message || "Failed to create quest");
    }
  };

  const resetTeamForm = () => {
    setTeamName("");
    setTeamDescription("");
    setMaxMembers("50");
  };

  const resetChallengeForm = () => {
    setChallengeTitle("");
    setChallengeDescription("");
    setChallengeType("xp");
    setTargetValue("");
    setDuration("7");
    setReward("");
  };

  const resetQuestForm = () => {
    setQuestTitle("");
    setQuestDescription("");
    setQuestLocation("");
    setQuestCategory("Nature");
    setQuestXP("");
    setQuestDifficulty("beginner");
    setQuestDuration("30");
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!selectedTeam?.teamId) return;

    const unsubscribeTeam = FirestoreService.subscribeToTeam(
      selectedTeam.teamId,
      (updatedTeam) => {
        if (updatedTeam) {
          setSelectedTeam(updatedTeam);
        }
      }
    );

    const unsubscribeChallenges = FirestoreService.subscribeToTeamChallenges(
      selectedTeam.teamId,
      (updatedChallenges) => {
        const formattedChallenges = updatedChallenges.map((challenge) => ({
          id: challenge.challengeId,
          teamId: challenge.teamId,
          title: challenge.title,
          description: challenge.description,
          type: challenge.type,
          targetValue: challenge.targetValue,
          currentValue: challenge.currentValue,
          duration: (challenge as any).duration || 7,
          reward: challenge.reward,
          status: challenge.status,
          createdAt: challenge.createdAt,
          completedAt: challenge.completedAt,
          createdBy: challenge.createdBy,
        }));
        setTeamChallenges(formattedChallenges);
      }
    );

    return () => {
      unsubscribeTeam();
      unsubscribeChallenges();
    };
  }, [selectedTeam?.teamId]);

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  return {
    // State
    loading,
    refreshing,
    userTeams,
    selectedTeam,
    teamMembers,
    teamChallenges,
    teamQuests,
    teamActivities,
    activeTab,
    showCreateChallenge,
    showCreateQuest,
    showCreateTeam,
    showJoinTeam,
    showTeamCode,
    searchQuery,
    searchResults,
    inviteEmail,
    joinCode,
    generatedCode,
    challengeTitle,
    challengeDescription,
    challengeType,
    targetValue,
    duration,
    reward,
    questTitle,
    questDescription,
    questLocation,
    questCategory,
    questXP,
    questDifficulty,
    questDuration,
    teamName,
    teamDescription,
    maxMembers,
    challengeTemplates,

    // Setters
    setActiveTab,
    setShowCreateChallenge,
    setShowCreateQuest,
    setShowCreateTeam,
    setShowJoinTeam,
    setShowTeamCode,
    setSearchQuery,
    setSearchResults,
    setInviteEmail,
    setJoinCode,
    setGeneratedCode,
    setChallengeTitle,
    setChallengeDescription,
    setChallengeType,
    setTargetValue,
    setDuration,
    setReward,
    setQuestTitle,
    setQuestDescription,
    setQuestLocation,
    setQuestCategory,
    setQuestXP,
    setQuestDifficulty,
    setQuestDuration,
    setTeamName,
    setTeamDescription,
    setMaxMembers,

    // Functions
    loadData,
    selectTeam,
    onRefresh,
    createTeam,
    generateInviteCode,
    inviteByEmail,
    createChallenge,
    createQuest,
    resetTeamForm,
    resetChallengeForm,
    resetQuestForm,
    getActivityIcon,
    getActivityColor,
    formatTimestamp,
    formatActivityTimestamp,
  };
}
