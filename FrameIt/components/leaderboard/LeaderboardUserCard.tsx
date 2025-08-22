import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { leaderboardStyles as styles } from "../../styles";
import { User } from "../../types/database";

interface ExplorerEntry extends User {
  questsCompleted: number;
  rank: number;
  title: string;
  badge: string;
  isCurrentUser?: boolean;
}

interface LeaderboardUserCardProps {
  user: ExplorerEntry;
  onLongPress: (user: ExplorerEntry) => void;
  onChallenge?: (user: ExplorerEntry) => void;
}

export default function LeaderboardUserCard({
  user,
  onLongPress,
  onChallenge,
}: LeaderboardUserCardProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return "#137CD8"; // Primary color
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "trophy";
      case 2:
        return "medal-outline";
      case 3:
        return "ribbon-outline";
      default:
        return "star-outline";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity
      style={[
        styles.leaderboardItem,
        user.isCurrentUser && styles.currentUserItem,
      ]}
      onLongPress={() => onLongPress(user)}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <View style={styles.rankContainer}>
        <Ionicons
          name={getRankIcon(user.rank) as any}
          size={24}
          color={getRankColor(user.rank)}
        />
        <Text style={[styles.rankText, { color: getRankColor(user.rank) }]}>
          #{user.rank}
        </Text>
        {user.isCurrentUser && (
          <View style={styles.currentUserBadge}>
            <Text style={styles.currentUserBadgeText}>YOU</Text>
          </View>
        )}
      </View>

      <View style={styles.explorerInfo}>
        <View style={styles.explorerHeader}>
          <View style={styles.profilePhotoContainer}>
            {user.profileImageUrl ? (
              <Image
                source={{ uri: user.profileImageUrl }}
                style={styles.profilePhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <Text style={styles.profilePhotoText}>
                  {getInitials(user.displayName || "User")}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.nameAndTitle}>
            <Text style={styles.explorerName}>{user.displayName}</Text>
            <Text style={styles.explorerTitle}>{user.tag || "explorer"}</Text>
          </View>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{user.level}</Text>
          </View>

          {!user.isCurrentUser && onChallenge && (
            <TouchableOpacity
              style={styles.challengeButton}
              onLongPress={() => onChallenge(user)}
            >
              <Ionicons name="flash" size={16} color="#D61A66" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={16} color="#FFD700" />
            <Text style={styles.statValue}>{user.xp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flag" size={16} color="#137CD8" />
            <Text style={styles.statValue}>{user.questsCompleted}</Text>
            <Text style={styles.statLabel}>Quests</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="location" size={16} color="#D61A66" />
            <Text style={styles.statValue}>{user.questsCompleted}</Text>
            <Text style={styles.statLabel}>Places</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
