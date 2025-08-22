import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TeamChallenge } from "../../types/database";

interface TeamChallengeCardProps {
  challenge: TeamChallenge;
  onLongPress: () => void;
}

export const TeamChallengeCard = ({
  challenge,
  onLongPress,
}: TeamChallengeCardProps) => {
  const formatDate = (timestamp: Date | any): string => {
    let date: Date;
    if (timestamp && typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      return "Unknown date";
    }

    try {
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "#4CAF50";
      case "intermediate":
        return "#FF9800";
      case "advanced":
        return "#f44336";
      case "expert":
        return "#9c27b0";
      default:
        return "#757575";
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "xp":
        return "#FF6B35";
      case "quests":
        return "#4CAF50";
      case "locations":
        return "#137CD8";
      case "time":
        return "#9C27B0";
      default:
        return "#757575";
    }
  };

  const typeColor = getChallengeTypeColor(challenge.type);
  const progressPercentage = Math.min(challenge.progress, 100);

  return (
    <TouchableOpacity style={styles.teamCard} onLongPress={onLongPress}>
      <View style={styles.teamCardContent}>
        <View style={styles.teamCardHeader}>
          <View style={styles.teamBadges}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.typeText}>
                {challenge.type.toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor: getDifficultyColor(
                    challenge.metadata.difficulty
                  ),
                },
              ]}
            >
              <Text style={styles.difficultyText}>
                {challenge.metadata.difficulty}
              </Text>
            </View>
          </View>
          <Text style={styles.participantCount}>
            {challenge.participants.length} members
          </Text>
        </View>

        <Text style={styles.teamCardTitle} numberOfLines={2}>
          {challenge.title}
        </Text>
        <Text style={styles.teamCardDescription} numberOfLines={2}>
          {challenge.description}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: typeColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {challenge.currentValue} / {challenge.targetValue} (
            {progressPercentage.toFixed(0)}%)
          </Text>
        </View>

        <View style={styles.teamCardFooter}>
          <View style={styles.challengeInfo}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.challengeDeadline}>
              Ends {formatDate(challenge.deadline)}
            </Text>
          </View>
          {challenge.reward && (
            <View style={styles.rewardInfo}>
              <Ionicons name="gift" size={16} color="#FF6B35" />
              <Text style={styles.rewardText}>{challenge.reward}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  teamCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  teamCardContent: {
    padding: 16,
  },
  teamCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  teamBadges: {
    flexDirection: "row",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
  },
  participantCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  teamCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  teamCardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  teamCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  challengeDeadline: {
    fontSize: 12,
    color: "#666",
  },
  rewardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "500",
  },
});
