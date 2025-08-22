import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { challengesStyles as styles } from "../../styles";
import { Quest, CompletedQuest, QuestAnalytics } from "../../types/database";
import {
  getCategoryGradient,
  getDifficultyStyle,
  getQuestStatus,
} from "../../utils/questHelpers";
import SwipeButton from "../shared/SwipeButton";

interface QuestWithStatus extends Quest {
  completed: boolean;
  distance?: number;
  canAttempt?: boolean;
  eligibilityReason?: string;
  analytics?: QuestAnalytics | null;
  attempts?: number;
}

interface QuestCardProps {
  quest: QuestWithStatus;
  onOpenDetails: (quest: QuestWithStatus) => void;
  onToggleQuest: (questId: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onOpenDetails,
  onToggleQuest,
}) => {
  const questStatus = getQuestStatus(quest);
  const categoryGradient = getCategoryGradient(quest.category);

  const formatDistance = (distance?: number) => {
    if (!distance) return "";
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const getStatusBadgeStyle = (styleName: string) => {
    switch (styleName) {
      case "questCompletedBadge":
        return styles.questCompletedBadge;
      case "questAvailableBadge":
        return styles.questAvailableBadge;
      case "questLockedBadge":
        return styles.questLockedBadge;
      default:
        return styles.questAvailableBadge;
    }
  };

  return (
    <TouchableOpacity
      style={styles.questCard}
      onLongPress={() => onOpenDetails(quest)}
      activeOpacity={0.95}
    >
      {/* Header with gradient background */}
      <View style={styles.questImageHeader}>
        <LinearGradient
          colors={[categoryGradient[0], categoryGradient[1]]}
          style={styles.questHeaderGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.questHeaderContent}>
          {/* Top row with category and status */}
          <View style={styles.questHeaderTop}>
            <View style={styles.questCategoryBadge}>
              <Text style={styles.questCategoryText}>{quest.category}</Text>
            </View>

            <View
              style={[
                styles.questStatusBadge,
                getStatusBadgeStyle(questStatus.style),
              ]}
            >
              <Ionicons
                name={questStatus.icon as any}
                size={12}
                color="white"
              />
              <Text style={styles.questStatusText}>{questStatus.text}</Text>
            </View>
          </View>

          {/* Bottom row with title and location */}
          <View style={styles.questHeaderBottom}>
            <Text style={styles.questTitle} numberOfLines={2}>
              {quest.title}
            </Text>
            <View style={styles.questLocationHeader}>
              <Ionicons
                name="location"
                size={14}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.questLocationText}>
                {quest.location}
                {quest.distance && ` • ${formatDistance(quest.distance)}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quest body content */}
      <View style={styles.questBody}>
        {/* Description */}
        <Text style={styles.questDescription} numberOfLines={3}>
          {quest.description}
        </Text>

        {/* Info grid */}
        <View style={styles.questInfoGrid}>
          <View style={styles.questInfoItem}>
            <Ionicons name="camera" size={14} color="#64748b" />
            <Text style={styles.questInfoText}>
              {quest.photoRequirements.subjects[0]}
            </Text>
          </View>

          <View style={styles.questInfoItem}>
            <Ionicons name="time" size={14} color="#64748b" />
            <Text style={styles.questInfoText}>
              {quest.estimatedDuration}min
            </Text>
          </View>

          <View
            style={[styles.questInfoItem, getDifficultyStyle(quest.difficulty)]}
          >
            <Ionicons name="trending-up" size={14} color="white" />
            <Text
              style={[
                styles.questInfoText,
                { color: "white", fontWeight: "600" },
              ]}
            >
              {quest.difficulty}
            </Text>
          </View>

          {quest.photoRequirements.timeOfDay !== "any" && (
            <View style={styles.questInfoItem}>
              <Ionicons name="sunny" size={14} color="#64748b" />
              <Text style={styles.questInfoText}>
                {quest.photoRequirements.timeOfDay}
              </Text>
            </View>
          )}
        </View>

        {/* Analytics stats */}
        {quest.analytics && (
          <View style={styles.questStatsRow}>
            <View style={styles.questStat}>
              <Text style={styles.questStatValue}>
                {quest.analytics.totalCompletions > 0
                  ? `${Math.round(
                      (quest.analytics.totalCompletions /
                        quest.analytics.totalAttempts) *
                        100
                    )}%`
                  : "N/A"}
              </Text>
              <Text style={styles.questStatLabel}>Success</Text>
            </View>

            <View style={styles.questStat}>
              <Text style={styles.questStatValue}>
                {quest.analytics.averageCompletionTime}m
              </Text>
              <Text style={styles.questStatLabel}>Avg Time</Text>
            </View>

            <View style={styles.questStat}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={[styles.questStatValue, { marginLeft: 4 }]}>
                  {quest.analytics.averageRating.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.questStatLabel}>Rating</Text>
            </View>
          </View>
        )}

        {/* Footer with XP and SwipeButton */}
        <View style={styles.questFooter}>
          <View style={styles.questRewardContainer}>
            <Ionicons name="star" size={18} color="#d97706" />
            <Text style={styles.questXpText}>{quest.xpReward} XP</Text>
            {quest.rewards.bonusXP.firstTime > 0 && (
              <Text style={styles.questBonusText}>
                +{quest.rewards.bonusXP.firstTime}
              </Text>
            )}
          </View>
        </View>

        {/* Quest Action SwipeButton */}
        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <SwipeButton
            leftText="Details"
            rightText={
              quest.completed ? "View" : !quest.canAttempt ? "Locked" : "Start"
            }
            centerText={quest.completed ? "✓" : !quest.canAttempt ? "🔒" : "🎯"}
            onSwipeLeft={() => onOpenDetails(quest)}
            onSwipeRight={() => {
              if (quest.completed) {
                onOpenDetails(quest);
              } else if (quest.canAttempt) {
                onToggleQuest(quest.questId);
              }
            }}
            disabled={!quest.canAttempt && !quest.completed}
            instructionText={
              quest.completed
                ? "Swipe either direction to view quest details"
                : !quest.canAttempt
                ? quest.eligibilityReason ||
                  "Quest locked - swipe left for details"
                : "Swipe right to start quest, left for details"
            }
          />
        </View>

        {/* Eligibility warning */}
        {!quest.canAttempt && quest.eligibilityReason && (
          <View style={styles.questEligibilityWarning}>
            <Ionicons name="information-circle" size={16} color="#f59e0b" />
            <Text style={styles.questEligibilityText}>
              {quest.eligibilityReason}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default QuestCard;
