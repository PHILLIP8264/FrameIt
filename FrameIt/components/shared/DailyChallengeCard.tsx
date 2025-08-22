import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Quest } from "../../types/database";

interface QuestCardProps {
  quest: Quest;
  onLongPress: () => void;
  completed?: boolean;
  distance?: number;
  showAnalytics?: boolean;
}

export default function QuestCard({
  quest,
  onLongPress,
  completed = false,
  distance,
  showAnalytics = false,
}: QuestCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "#4CAF50";
      case "intermediate":
        return "#FF9800";
      case "advanced":
        return "#F44336";
      case "expert":
        return "#9C27B0";
      default:
        return "#757575";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "urban":
        return "business-outline";
      case "nature":
        return "leaf-outline";
      case "architecture":
        return "library-outline";
      case "street":
        return "walk-outline";
      case "creative":
        return "color-palette-outline";
      default:
        return "camera-outline";
    }
  };

  const formatDistance = (dist?: number) => {
    if (!dist) return "";
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  const formatAvailableHours = () => {
    if (!quest.availableHours) return "Available anytime";
    return `${quest.availableHours.start} - ${quest.availableHours.end}`;
  };

  return (
    <TouchableOpacity style={styles.container} onLongPress={onLongPress}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons
            name={getCategoryIcon(quest.category) as any}
            size={24}
            color="#007AFF"
            style={styles.categoryIcon}
          />
          <Text style={styles.title} numberOfLines={1}>
            {quest.title}
          </Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(quest.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{quest.difficulty}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {quest.description}
      </Text>

      {/* Location */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.locationText}>
          {quest.location}
          {distance && ` • ${formatDistance(distance)} away`}
        </Text>
      </View>

      {/* Photo Requirements */}
      <View style={styles.requirementsRow}>
        <Ionicons name="camera-outline" size={16} color="#666" />
        <Text style={styles.requirementsText}>
          {quest.photoRequirements.subjects.slice(0, 2).join(", ")}
          {quest.photoRequirements.subjects.length > 2 && "..."}
        </Text>
      </View>

      {/* Availability */}
      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.timeText}>{formatAvailableHours()}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.rewardSection}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.xpText}>{quest.xpReward} XP</Text>
          {quest.rewards.bonusXP.firstTime > 0 && (
            <Text style={styles.bonusText}>
              +{quest.rewards.bonusXP.firstTime}
            </Text>
          )}
        </View>

        <View style={styles.statusSection}>
          {completed ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          ) : (
            <View style={styles.actionBadge}>
              <Ionicons name="play-circle-outline" size={16} color="#007AFF" />
              <Text style={styles.actionText}>Start Quest</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
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
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  requirementsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
    fontStyle: "italic",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  xpText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
    marginLeft: 5,
  },
  bonusText: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "bold",
    marginLeft: 4,
  },
  actionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "bold",
    marginLeft: 4,
  },
});
