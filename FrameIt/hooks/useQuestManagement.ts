import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { Quest, CompletedQuest, QuestAnalytics } from "../types/database";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services";
import LocationService, { LocationCoords } from "../services/LocationService";

interface QuestWithStatus extends Quest {
  completed: boolean;
  distance?: number;
  canAttempt?: boolean;
  eligibilityReason?: string;
  analytics?: QuestAnalytics | null;
  attempts?: number;
}

interface FilterState {
  category?: string;
  difficulty?: string;
  sort: "distance" | "xp" | "difficulty" | "alphabetical";
  showCompleted: boolean;
  maxDistance?: number;
  minXp?: number;
  maxXp?: number;
}

export const useQuestManagement = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [quests, setQuests] = useState<QuestWithStatus[]>([]);
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [dailyQuestCount, setDailyQuestCount] = useState({
    attemptsToday: 0,
    maxDailyQuests: 3,
    canStartQuest: true,
    resetTime: new Date(),
  });

  // Initialize location
  const initializeLocation = async () => {
    try {
      const hasPermission = await LocationService.requestLocationPermission();
      if (hasPermission) {
        const location = await LocationService.getCurrentLocation();
        setUserLocation(location);
      } else {
        setUserLocation({ latitude: -25.7479, longitude: 28.2293 });
      }
    } catch (error) {
      console.error("Location initialization error:", error);
      setUserLocation({ latitude: -25.7479, longitude: 28.2293 });
    }
  };

  // Load daily quest count
  const loadDailyQuestCount = async () => {
    if (!user?.uid) return;
    try {
      const dailyCount = await FirestoreService.getDailyQuestCount(user.uid);
      setDailyQuestCount(dailyCount);
    } catch (error) {
      console.error("Error loading daily quest count:", error);
    }
  };

  // Load quests with filters
  const loadQuests = async (filter: FilterState, searchText: string) => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      const questsData = await FirestoreService.getQuests({
        category: filter.category,
        difficulty: filter.difficulty,
        userLocation: userLocation || undefined,
        limitCount: 50,
      });

      const completed = await FirestoreService.getCompletedQuests(user.uid);
      setCompletedQuests(completed);

      const enhancedQuests = await Promise.all(
        questsData.map(async (quest) => {
          const [analytics, eligibility] = await Promise.all([
            FirestoreService.getQuestAnalytics(quest.questId),
            FirestoreService.canUserAttemptQuest(user.uid, quest.questId),
          ]);

          const isCompleted = completed.some(
            (c) => c.questId === quest.questId
          );
          const distance = userLocation
            ? FirestoreService.calculateDistance(
                userLocation,
                quest.coordinates
              )
            : undefined;

          return {
            ...quest,
            completed: isCompleted,
            distance,
            canAttempt: eligibility.canAttempt,
            eligibilityReason: eligibility.reason,
            analytics,
          };
        })
      );

      // Apply sorting and filtering
      let filteredQuests = enhancedQuests.sort((a, b) => {
        switch (filter.sort) {
          case "distance":
            if (!a.distance || !b.distance) return 0;
            return a.distance - b.distance;
          case "xp":
            return b.xpReward - a.xpReward;
          case "difficulty":
            const difficultyOrder = {
              beginner: 1,
              intermediate: 2,
              advanced: 3,
              expert: 4,
            };
            return (
              (difficultyOrder[a.difficulty] || 0) -
              (difficultyOrder[b.difficulty] || 0)
            );
          case "alphabetical":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });

      // Apply filters
      if (searchText.trim()) {
        filteredQuests = filteredQuests.filter(
          (quest) =>
            quest.title.toLowerCase().includes(searchText.toLowerCase()) ||
            quest.description
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            quest.category.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      if (!filter.showCompleted) {
        filteredQuests = filteredQuests.filter((quest) => !quest.completed);
      }

      if (filter.maxDistance) {
        filteredQuests = filteredQuests.filter(
          (quest) => !quest.distance || quest.distance <= filter.maxDistance!
        );
      }

      if (filter.minXp) {
        filteredQuests = filteredQuests.filter(
          (quest) => quest.xpReward >= filter.minXp!
        );
      }

      if (filter.maxXp) {
        filteredQuests = filteredQuests.filter(
          (quest) => quest.xpReward <= filter.maxXp!
        );
      }

      setQuests(filteredQuests);
      setLoading(false);
    } catch (error) {
      console.error("Error loading quests:", error);
      setLoading(false);
    }
  };

  // Refresh function
  const onRefresh = async (filter: FilterState, searchText: string) => {
    setRefreshing(true);
    await loadQuests(filter, searchText);
    setRefreshing(false);
  };

  // Toggle quest (start/complete)
  const toggleQuest = async (questId: string) => {
    if (!user?.uid) return;

    const quest = quests.find((q) => q.questId === questId);
    if (!quest) return;

    try {
      if (
        quest.completed ||
        !dailyQuestCount.canStartQuest ||
        !quest.canAttempt
      ) {
        return;
      }

      const result = await FirestoreService.startQuestAttemptWithLimitCheck(
        user.uid,
        questId,
        userLocation || undefined
      );

      if (!result.success) return;

      if (result.attemptId) {
        const attempts = await FirestoreService.getUserQuestAttempts(user.uid);
        const activeAttempt = attempts.find(
          (a) => a.attemptId === result.attemptId && a.status === "in-progress"
        );

        if (activeAttempt) {
          router.push({
            pathname: "/quest-navigation",
            params: {
              quest: JSON.stringify(quest),
              attempt: JSON.stringify(activeAttempt),
            },
          });
        }
      }

      loadDailyQuestCount();
    } catch (error) {
      console.error("Error toggling quest:", error);
    }
  };

  // Open quest details
  const openQuestDetails = (quest: QuestWithStatus) => {
    if (!user?.uid) return;
    router.push({
      pathname: "/quest-details",
      params: { questId: quest.questId },
    });
  };

  // Initialize on mount
  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadDailyQuestCount();
    }
  }, [user?.uid]);

  return {
    quests,
    loading,
    refreshing,
    userLocation,
    dailyQuestCount,
    loadQuests,
    onRefresh,
    toggleQuest,
    openQuestDetails,
  };
};
