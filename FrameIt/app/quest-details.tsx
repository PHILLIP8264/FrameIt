import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";
import QuestDetailsModal from "../components/quest/QuestDetailsModal";
import { FirestoreService } from "../services";
import { Quest } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export default function QuestDetailsPage() {
  const { questId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);

  const handleStartQuest = async (questId: string) => {
    if (!user?.uid || !quest) return;

    try {
      // Start the quest attempt
      const result = await FirestoreService.startQuestAttemptWithLimitCheck(
        user.uid,
        questId
      );

      if (!result.success) {
        console.error("Failed to start quest:", result.error);
        return;
      }

      // Get the created attempt
      if (result.attemptId) {
        const attempts = await FirestoreService.getUserQuestAttempts(user.uid);
        const activeAttempt = attempts.find(
          (a) => a.attemptId === result.attemptId && a.status === "in-progress"
        );

        if (activeAttempt) {
          // Navigate to quest navigation page
          router.push({
            pathname: "/quest-navigation",
            params: {
              quest: JSON.stringify(quest),
              attempt: JSON.stringify(activeAttempt),
            },
          });
        }
      }
    } catch (error) {
      console.error("Error starting quest:", error);
    }
  };

  useEffect(() => {
    async function fetchQuest() {
      let id: string | undefined;
      if (typeof questId === "string") {
        id = questId;
      } else if (Array.isArray(questId)) {
        id = questId[0];
      }
      if (!id) return;
      setLoading(true);
      try {
        const questData = await FirestoreService.getQuestById(id);
        setQuest(questData);
      } catch (error) {
        // Error fetching quest data
        setQuest(null);
      } finally {
        setLoading(false);
      }
    }
    fetchQuest();
  }, [questId]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Text>Loading quest details...</Text>
      </View>
    );
  }

  if (!quest) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Text>Quest not found.</Text>
      </View>
    );
  }

  return (
    <QuestDetailsModal
      quest={quest}
      onClose={() => router.back()}
      onStartQuest={handleStartQuest}
      userLocation={undefined}
      asPage={true}
    />
  );
}
