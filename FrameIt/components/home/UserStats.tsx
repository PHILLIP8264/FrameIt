import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles } from "../../styles";

interface UserStatsProps {
  stats: {
    streakCount: number;
    completedCount: number;
    activeCount: number;
  };
}

export const UserStats = ({ stats }: UserStatsProps) => {
  return (
    <View style={homeStyles.statsContainer}>
      <View style={[homeStyles.statCard, { backgroundColor: "#FF6B35" }]}>
        <View style={homeStyles.statIconContainer}>
          <Ionicons name="flame" size={24} color="#FFF" />
        </View>
        <Text style={homeStyles.statNumber}>{stats.streakCount}</Text>
        <Text style={homeStyles.statLabel}>Day Streak</Text>
      </View>
      <View style={[homeStyles.statCard, { backgroundColor: "#4CAF50" }]}>
        <View style={homeStyles.statIconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
        </View>
        <Text style={homeStyles.statNumber}>{stats.completedCount}</Text>
        <Text style={homeStyles.statLabel}>Completed</Text>
      </View>
      <View style={[homeStyles.statCard, { backgroundColor: "#137CD8" }]}>
        <View style={homeStyles.statIconContainer}>
          <Ionicons name="play-circle" size={24} color="#FFF" />
        </View>
        <Text style={homeStyles.statNumber}>{stats.activeCount}</Text>
        <Text style={homeStyles.statLabel}>Active</Text>
      </View>
    </View>
  );
};
