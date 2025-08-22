import React from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { leaderboardStyles as styles } from "../../styles";
import { User } from "../../types/database";
import LeaderboardUserCard from "./LeaderboardUserCard";

interface ExplorerEntry extends User {
  questsCompleted: number;
  rank: number;
  title: string;
  badge: string;
  isCurrentUser?: boolean;
}

interface TeamLeaderboardData {
  teamId: string;
  teamName: string;
  members: ExplorerEntry[];
}

interface LeaderboardTabContentProps {
  period: "globally" | "team" | "friends";
  screenWidth: number;
  explorerData: ExplorerEntry[];
  friendsData: ExplorerEntry[];
  teamData: TeamLeaderboardData[];
  loading: boolean;
  friendsLoading: boolean;
  teamLoading: boolean;
  onUserPress: (user: ExplorerEntry) => void;
  onChallenge?: (user: ExplorerEntry) => void;
}

export default function LeaderboardTabContent({
  period,
  screenWidth,
  explorerData,
  friendsData,
  teamData,
  loading,
  friendsLoading,
  teamLoading,
  onUserPress,
  onChallenge,
}: LeaderboardTabContentProps) {
  const getEmptyMessage = () => {
    switch (period) {
      case "team":
        return "No team rankings available";
      case "friends":
        return "No friends to compare with";
      default:
        return "No data available";
    }
  };

  const getEmptySubtitle = () => {
    switch (period) {
      case "team":
        return "Join a team to compete with your teammates";
      case "friends":
        return "Add friends in your profile to see their rankings here";
      default:
        return "Check back later for rankings";
    }
  };

  // Select appropriate data source and loading state
  const getDataAndLoading = () => {
    switch (period) {
      case "globally":
        return { data: explorerData, isLoading: loading, isTeamData: false };
      case "friends":
        return {
          data: friendsData,
          isLoading: friendsLoading,
          isTeamData: false,
        };
      case "team":
        return { data: teamData, isLoading: teamLoading, isTeamData: true };
      default:
        return { data: [], isLoading: false, isTeamData: false };
    }
  };

  const { data: dataToShow, isLoading, isTeamData } = getDataAndLoading();

  return (
    <ScrollView
      style={{ width: screenWidth }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#137CD8" />
          <Text style={styles.loadingText}>
            {period === "friends"
              ? "Loading friends..."
              : period === "team"
              ? "Loading team..."
              : "Loading leaderboard..."}
          </Text>
        </View>
      ) : dataToShow.length > 0 ? (
        <View>
          {isTeamData
            ? // Render team data grouped by teams
              (dataToShow as TeamLeaderboardData[]).map((teamDataItem) => (
                <View key={teamDataItem.teamId} style={{ marginBottom: 20 }}>
                  {/* Team Header */}
                  <View style={styles.teamHeader}>
                    <Ionicons name="people" size={20} color="#137CD8" />
                    <Text style={styles.teamName}>{teamDataItem.teamName}</Text>
                    <Text style={styles.teamMemberCount}>
                      {teamDataItem.members.length} members
                    </Text>
                  </View>

                  {/* Team Members */}
                  {teamDataItem.members.map((member) => (
                    <LeaderboardUserCard
                      key={`${teamDataItem.teamId}_${member.userId}`}
                      user={member}
                      onLongPress={onUserPress}
                      onChallenge={onChallenge}
                    />
                  ))}
                </View>
              ))
            : // Render regular data (global/friends)
              (dataToShow as ExplorerEntry[]).map((user) => (
                <LeaderboardUserCard
                  key={user.userId}
                  user={user}
                  onLongPress={onUserPress}
                  onChallenge={onChallenge}
                />
              ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>{getEmptyMessage()}</Text>
          <Text style={styles.emptyStateSubtitle}>{getEmptySubtitle()}</Text>
        </View>
      )}
    </ScrollView>
  );
}
