import React from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles as importedHomeStyles } from "../../styles";
import { useHomeManagement } from "../../hooks/useHomeManagement";
import {
  UserStats,
  SectionHeader,
  QuestCard,
  TeamChallengeCard,
} from "../../components/home";
import DailyChallengeCard from "../../components/shared/DailyChallengeCard";
import NotificationSection from "../../components/shared/NotificationSection";
import XpLevel from "@/components/cards/XpLevel";

export default function HomeScreen() {
  const {
    nearbyQuests,
    activeQuests,
    userTeams,
    teamChallenges,
    teamQuests,
    loading,
    refreshing,
    userStats,
    onRefresh,
    cancelQuest,
    openQuestMap,
    handleQuestDetails,
    handleTeamManagement,
  } = useHomeManagement();

  const handleSwipeLeft = (questId: string) => {
    Alert.alert(
      "Cancel Quest",
      "Are you sure you want to cancel this active quest?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => cancelQuest(questId),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#137CD8" />
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <XpLevel xp={0} userId={""} />

      {/* Notification Section */}
      <NotificationSection maxHeight={250} />

      {/* Stats Cards */}
      <UserStats stats={userStats} />

      {/* Active Quests Section */}
      {activeQuests.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Active Quests" linkHref="/challenges" />
          <View style={styles.questListVertical}>
            {activeQuests.map((quest) => (
              <QuestCard
                key={quest.questId}
                quest={quest}
                type="swipeable"
                onLongPress={() => handleQuestDetails(quest.questId)}
                onSwipeLeft={() => handleSwipeLeft(quest.questId)}
                onSwipeRight={() => openQuestMap(quest)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Team Challenges Section */}
      {teamChallenges.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Team Challenges"
            onLongPress={handleTeamManagement}
          />
          <View style={styles.questListVertical}>
            {teamChallenges.map((challenge) => (
              <TeamChallengeCard
                key={challenge.challengeId}
                challenge={challenge}
                onLongPress={handleTeamManagement}
              />
            ))}
          </View>
        </View>
      )}

      {/* Team Quests Section */}
      {teamQuests.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Team Quests"
            onLongPress={handleTeamManagement}
          />
          <View style={styles.questListVertical}>
            {teamQuests.map((quest) => (
              <QuestCard
                key={quest.questId}
                quest={{ ...quest, completed: false, canAttempt: true }}
                type="team"
                onLongPress={() => handleQuestDetails(quest.questId)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Nearby Quests Section */}
      {nearbyQuests.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title={`Nearby Quests (${nearbyQuests.length})`} />
          <View style={styles.questListVertical}>
            {nearbyQuests.map((quest) => (
              <QuestCard
                key={quest.questId}
                quest={quest}
                type="nearby"
                onLongPress={() => handleQuestDetails(quest.questId)}
                onSwipeRight={() => handleQuestDetails(quest.questId)}
              />
            ))}
          </View>
        </View>
      )}

      {nearbyQuests.length === 0 && (
        <View style={styles.section}>
          <Text style={importedHomeStyles.sectionTitle}>
            No Nearby Quests Available
          </Text>
          <Text style={{ color: "#666", marginTop: 10 }}>
            Check console for filtering details
          </Text>
        </View>
      )}

      {/* No Content Available */}
      {nearbyQuests.length === 0 &&
        activeQuests.length === 0 &&
        teamChallenges.length === 0 &&
        teamQuests.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="map" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Activities Available</Text>
            <Text style={styles.emptySubtitle}>
              {userTeams.length === 0
                ? "Join a team or check back later for new adventures"
                : "Check back later for new adventures"}
            </Text>
          </View>
        )}
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  section: {
    marginBottom: 20,
  },
  questListVertical: {
    paddingHorizontal: 0,
  },
  emptyContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center" as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
};
