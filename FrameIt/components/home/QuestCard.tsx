import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Quest } from "../../types/database";

export interface QuestWithStatus extends Quest {
  completed: boolean;
  distance?: number;
  canAttempt?: boolean;
  eligibilityReason?: string;
  hasActiveAttempt?: boolean;
}

interface QuestCardProps {
  quest: QuestWithStatus;
  onLongPress: () => void;
  type?: "basic" | "nearby" | "swipeable" | "team";
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const QuestCard = ({
  quest,
  onLongPress,
  type = "basic",
  onSwipeLeft,
  onSwipeRight,
}: QuestCardProps) => {
  const gradientColors = getCategoryGradient(quest.category);
  const translateX = new Animated.Value(0);

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
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

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;

      if (translationX > 100 && onSwipeRight) {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start(() => {
          onSwipeRight();
        });
      } else if (translationX < -100 && onSwipeLeft) {
        onSwipeLeft();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const renderContent = () => (
    <LinearGradient
      colors={[gradientColors[0], gradientColors[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.questCardGradient}
    >
      <View style={styles.questCardContent}>
        <View style={styles.questCardHeader}>
          <View style={styles.questBadges}>
            {type === "team" && (
              <View style={styles.teamQuestBadge}>
                <Ionicons name="people" size={12} color="white" />
                <Text style={styles.teamQuestText}>TEAM</Text>
              </View>
            )}
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(quest.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>{quest.difficulty}</Text>
            </View>
            {quest.completed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={12} color="white" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </View>
          <Text style={styles.xpReward}>{quest.xpReward} XP</Text>
        </View>

        <Text style={styles.questTitle} numberOfLines={2}>
          {quest.title}
        </Text>
        <Text style={styles.questLocation} numberOfLines={1}>
          {quest.location}
        </Text>

        {quest.distance && (
          <Text style={styles.questDistance}>
            {formatDistance(quest.distance)}
          </Text>
        )}

        {/* Type-specific indicators */}
        {type === "nearby" && (
          <View style={styles.nearbyIndicator}>
            <Text style={styles.nearbyText}>→ Swipe right for details</Text>
          </View>
        )}

        {type === "swipeable" && (
          <View style={styles.swipeIndicators}>
            <Text style={styles.swipeHint}>← Cancel | Map →</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  if (type === "nearby" || type === "swipeable") {
    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-10, 10]}
      >
        <Animated.View
          style={[styles.questCard, { transform: [{ translateX }] }]}
        >
          <TouchableOpacity
            style={styles.questCardTouchable}
            onLongPress={onLongPress}
          >
            {renderContent()}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  }

  return (
    <TouchableOpacity style={styles.questCard} onLongPress={onLongPress}>
      {renderContent()}
    </TouchableOpacity>
  );
};

const getCategoryGradient = (category: string) => {
  switch (category.toLowerCase()) {
    case "urban":
      return ["#667eea", "#764ba2"];
    case "nature":
      return ["#11998e", "#38ef7d"];
    case "historical":
      return ["#f093fb", "#f5576c"];
    case "cultural":
      return ["#4facfe", "#00f2fe"];
    case "creative":
      return ["#fa709a", "#fee140"];
    default:
      return ["#667eea", "#764ba2"];
  }
};

const styles = StyleSheet.create({
  questCard: {
    width: "100%",
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  questCardTouchable: {
    flex: 1,
  },
  questCardGradient: {
    flex: 1,
    padding: 20,
  },
  questCardContent: {
    flex: 1,
  },
  questCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  questBadges: {
    flexDirection: "row",
    gap: 8,
  },
  teamQuestBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(19, 124, 216, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  teamQuestText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
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
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  xpReward: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  questLocation: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  questDistance: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  swipeIndicators: {
    marginTop: 8,
    alignItems: "center",
  },
  swipeHint: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontStyle: "italic",
  },
  nearbyIndicator: {
    marginTop: 8,
    alignItems: "center",
  },
  nearbyText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontStyle: "italic",
  },
});
