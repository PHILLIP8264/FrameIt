import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import QuestNavigationSimple from "../components/quest/QuestNavigationSimple";
import { Quest, QuestAttempt } from "../types/database";

export default function QuestNavigationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the quest and attempt data from params
  const quest: Quest = params.quest ? JSON.parse(params.quest as string) : null;
  const attempt: QuestAttempt = params.attempt
    ? JSON.parse(params.attempt as string)
    : null;

  useEffect(() => {
    // If no quest data, go back
    if (!quest || !attempt) {
      router.back();
    }
  }, [quest, attempt, router]);

  const handleQuestComplete = () => {
    // Navigate back and the home screen will refresh automatically
    router.back();
  };

  const handleQuestCancel = () => {
    router.back();
  };

  const handleExitMap = () => {
    router.back();
  };

  if (!quest || !attempt) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
          contentStyle: { backgroundColor: "transparent" },
          animation: "none",
        }}
      />
      <View style={styles.container} pointerEvents="box-none">
        <QuestNavigationSimple
          quest={quest}
          attempt={attempt}
          onQuestComplete={handleQuestComplete}
          onQuestCancel={handleQuestCancel}
          onExitMap={handleExitMap}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
});
