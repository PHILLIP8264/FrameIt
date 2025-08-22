import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { Quest, CompletedQuest, TeamChallenge, Team } from "../types/database";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services";
import NotificationService from "../services/NotificationService";
import LocationService, { LocationCoords } from "../services/LocationService";

export interface QuestWithStatus extends Quest {
  completed: boolean;
  distance?: number;
  canAttempt?: boolean;
  eligibilityReason?: string;
  hasActiveAttempt?: boolean;
}

export const useHomeManagement = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [nearbyQuests, setNearbyQuests] = useState<QuestWithStatus[]>([]);
  const [activeQuests, setActiveQuests] = useState<QuestWithStatus[]>([]);
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);
  const [teamQuests, setTeamQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<QuestWithStatus | null>(
    null
  );
  const [userStats, setUserStats] = useState({
    streakCount: 0,
    completedCount: 0,
    activeCount: 0,
  });

  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const hasPermission = await LocationService.requestLocationPermission();
      if (hasPermission) {
        const location = await LocationService.getCurrentLocation();
        setUserLocation(location);
      } else {
        // Location permission denied, using default location
        setUserLocation({
          latitude: -25.7479,
          longitude: 28.2293,
        });
      }
    } catch (error) {
      // Error getting location, using default
      setUserLocation({
        latitude: -25.7479,
        longitude: 28.2293,
      });
    }
  };

  // Real-time listener for quests and user data
  useEffect(() => {
    if (!user?.uid) return;

    // Set up notification listener
    const unsubscribeNotifications =
      NotificationService.subscribeToUserNotifications(
        user.uid,
        (notification) => {
          console.log("New notification received:", notification);
        }
      );

    const loadData = async () => {
      setLoading(true);
      try {
        // Load completed quests first, then quests (which needs completed quests for filtering)
        await loadCompletedQuests();
        await loadQuests();
        await loadUserStats();
        await loadTeamData();
      } catch (error) {
        console.error("Error loading data:", error);
        // Error loading data - will show empty state
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Cleanup notification listener
    return () => {
      unsubscribeNotifications();
    };
  }, [user?.uid]);

  // Separate effect to reload quests when location changes
  useEffect(() => {
    if (user?.uid && userLocation && !loading) {
      loadQuests();
      loadTeamData();
    }
  }, [userLocation]);

  const loadQuests = async () => {
    if (!user?.uid) return;

    try {
      const allQuests = await FirestoreService.getQuests();

      // Get user's active quest attempts to properly determine active quests
      const activeAttempts = await FirestoreService.getUserActiveQuestAttempts(
        user.uid
      );

      // Get completed quests fresh each time
      const currentCompletedQuests = await FirestoreService.getCompletedQuests(
        user.uid
      );

      // Filter quests based on proximity and completion status
      const questsWithStatus = await Promise.all(
        allQuests.map(async (quest) => {
          const completed = currentCompletedQuests.some(
            (cq) => cq.questId === quest.questId
          );

          // Calculate distance if user location is available
          const distance = userLocation
            ? FirestoreService.calculateDistance(
                userLocation,
                quest.coordinates
              )
            : undefined;

          // Check if user can attempt this quest
          const canAttemptResult = await FirestoreService.canUserAttemptQuest(
            user.uid,
            quest.questId
          );

          // Check if this quest has an active attempt
          const hasActiveAttempt = activeAttempts.some(
            (attempt: any) => attempt.questId === quest.questId
          );

          return {
            ...quest,
            completed,
            distance,
            canAttempt: canAttemptResult.canAttempt,
            eligibilityReason: canAttemptResult.reason,
            hasActiveAttempt,
          } as QuestWithStatus & { hasActiveAttempt: boolean };
        })
      );

      // Split into nearby (within 50km) and active
      const nearby = questsWithStatus
        .filter((quest) => {
          const meetsDistance =
            !userLocation || (quest.distance && quest.distance <= 50); // 50km
          const notCompleted = !quest.completed;
          const canAttempt = quest.canAttempt;
          const noActiveAttempt = !quest.hasActiveAttempt;

          return notCompleted && meetsDistance && noActiveAttempt && canAttempt;
        })
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 8);

      // Active quests are ones with active attempts
      const active = questsWithStatus
        .filter((quest) => quest.hasActiveAttempt)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 5);

      setNearbyQuests(nearby);
      setActiveQuests(active);

      // Update completed quests state as well
      setCompletedQuests(currentCompletedQuests);
    } catch (error) {
      console.error("Failed to load quests:", error);
      // Failed to load quests - will show empty state
    }
  };

  const loadCompletedQuests = async () => {
    if (!user?.uid) return;

    try {
      const completed = await FirestoreService.getCompletedQuests(user.uid);
      setCompletedQuests(completed);
    } catch (error) {
      // Failed to load completed quests
    }
  };

  const loadUserStats = async () => {
    if (!user?.uid) return;

    try {
      const [userData, activeAttempts, completed] = await Promise.all([
        FirestoreService.getUser(user.uid),
        FirestoreService.getUserActiveQuestAttempts(user.uid),
        FirestoreService.getCompletedQuests(user.uid),
      ]);

      setUserStats({
        streakCount: userData?.streakCount || 0,
        completedCount: completed.length,
        activeCount: activeAttempts.length,
      });
    } catch (error) {
      // Failed to load user stats
    }
  };

  const loadTeamData = async () => {
    if (!user?.uid) return;

    try {
      // Get user's teams
      const teams = await FirestoreService.getUserTeams(user.uid);
      setUserTeams(teams);

      if (teams.length > 0) {
        // Get team challenges for all teams
        const allTeamChallenges = await Promise.all(
          teams.map((team) => FirestoreService.getTeamChallenges(team.teamId))
        );

        // Flatten and sort by creation date
        const challenges = allTeamChallenges
          .flat()
          .filter((challenge) => challenge.isActive)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        setTeamChallenges(challenges);

        // Get team quests
        const quests = await FirestoreService.getTeamQuests(user.uid, {
          limitCount: 5,
          userLocation: userLocation || undefined,
        });

        setTeamQuests(quests);
      } else {
        setTeamChallenges([]);
        setTeamQuests([]);
      }
    } catch (error) {
      console.error("Error loading team data:", error);
      // Failed to load team data
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Get location first, then load data in proper sequence
      await getUserLocation();
      await loadCompletedQuests();
      await loadQuests();
      await loadUserStats();
      await loadTeamData();
    } catch (error) {
      console.error("Error refreshing data:", error);
      // Error refreshing data
    } finally {
      setRefreshing(false);
    }
  };

  const startQuest = async (questId: string) => {
    if (!user?.uid || !userLocation) {
      Alert.alert("Error", "Location is required to start a quest");
      return;
    }

    try {
      const attemptResult =
        await FirestoreService.startQuestAttemptWithLimitCheck(
          user.uid,
          questId,
          userLocation
        );

      if (attemptResult.success) {
        const quest = [...nearbyQuests, ...activeQuests].find(
          (q) => q.questId === questId
        );
        if (quest && attemptResult.attemptId) {
          // Navigate to quest navigation page instead of modal
          router.push({
            pathname: "/quest-navigation",
            params: {
              quest: JSON.stringify(quest),
              attempt: JSON.stringify({ attemptId: attemptResult.attemptId }),
            },
          });
        }
      } else {
        Alert.alert(
          "Cannot Start Quest",
          attemptResult.error || "Unknown error"
        );
      }
    } catch (error) {
      // Error starting quest
      Alert.alert("Error", "Failed to start quest. Please try again.");
    }
  };

  const cancelQuest = async (questId: string) => {
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      // Get active quest attempt for this quest
      const activeAttempts = await FirestoreService.getUserActiveQuestAttempts(
        user.uid
      );

      const questAttempt = activeAttempts.find(
        (attempt: any) => attempt.questId === questId
      );

      if (questAttempt) {
        await FirestoreService.cancelQuestAttempt(questAttempt.attemptId);
        Alert.alert(
          "Quest Cancelled",
          "The quest has been cancelled successfully."
        );
        // Refresh the quest lists
        await loadQuests();
      } else {
        Alert.alert("Error", "No active attempt found for this quest.");
      }
    } catch (error) {
      // Error cancelling quest
      Alert.alert("Error", "Failed to cancel quest. Please try again.");
    }
  };

  const openQuestMap = (quest: QuestWithStatus) => {
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    // Get the active attempt for this quest and open navigation
    FirestoreService.getUserActiveQuestAttempts(user.uid)
      .then((activeAttempts: any) => {
        const questAttempt = activeAttempts.find(
          (attempt: any) => attempt.questId === quest.questId
        );
        if (questAttempt) {
          // Navigate to quest navigation page instead of modal
          router.push({
            pathname: "/quest-navigation",
            params: {
              quest: JSON.stringify(quest),
              attempt: JSON.stringify(questAttempt),
            },
          });
        } else {
          Alert.alert("Error", "No active attempt found for this quest.");
        }
      })
      .catch((error: any) => {
        // Error opening quest map
        Alert.alert("Error", "Failed to open quest map. Please try again.");
      });
  };

  const handleQuestPress = (quest: QuestWithStatus) => {
    setSelectedQuest(quest);
  };

  const handleQuestDetails = (questId: string) => {
    router.push({
      pathname: "/quest-details",
      params: {
        questId,
      },
    });
  };

  const handleTeamManagement = () => {
    router.push("/unified-team-management");
  };

  return {
    // State
    nearbyQuests,
    activeQuests,
    completedQuests,
    userTeams,
    teamChallenges,
    teamQuests,
    loading,
    refreshing,
    userLocation,
    selectedQuest,
    userStats,

    // Actions
    onRefresh,
    startQuest,
    cancelQuest,
    openQuestMap,
    handleQuestPress,
    handleQuestDetails,
    handleTeamManagement,
    setSelectedQuest,
  };
};
