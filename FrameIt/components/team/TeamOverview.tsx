import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { unifiedTeamStyles as styles } from "../../styles";

interface TeamOverviewProps {
  selectedTeam: any;
  teamMembers: any[];
  teamChallenges: any[];
  teamQuests: any[];
  teamActivities: any[];
  refreshing: boolean;
  onRefresh: () => void;
  setActiveTab: (tab: string) => void;
  formatTimestamp: (timestamp: any) => string;
  formatActivityTimestamp: (timestamp: any) => string;
  getActivityIcon: (type: string) => string;
  getActivityColor: (type: string) => string;
}

export default function TeamOverview({
  selectedTeam,
  teamMembers,
  teamChallenges,
  teamQuests,
  teamActivities,
  refreshing,
  onRefresh,
  setActiveTab,
  formatTimestamp,
  formatActivityTimestamp,
  getActivityIcon,
  getActivityColor,
}: TeamOverviewProps) {
  if (!selectedTeam) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No team selected</Text>
          <Text style={styles.emptyStateSubtext}>
            Select a team to view its overview
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#137CD8"]}
          tintColor="#137CD8"
        />
      }
    >
      {/* Team Header */}
      <LinearGradient colors={["#137CD8", "#0F5BA8"]} style={styles.teamHeader}>
        <View style={styles.teamHeaderContent}>
          <Text style={styles.teamName}>{selectedTeam.name}</Text>
          {selectedTeam.description && (
            <Text style={styles.teamDescription}>
              {selectedTeam.description}
            </Text>
          )}
          <View style={styles.teamStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teamMembers.length}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teamChallenges.length}</Text>
              <Text style={styles.statLabel}>Challenges</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teamQuests.length}</Text>
              <Text style={styles.statLabel}>Quests</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: "#137CD8" }]}
            onLongPress={() => setActiveTab("members")}
          >
            <Ionicons name="people" size={24} color="white" />
            <Text style={styles.quickActionText}>Manage Members</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: "#D61A66" }]}
            onLongPress={() => setActiveTab("challenges")}
          >
            <Ionicons name="trophy" size={24} color="white" />
            <Text style={styles.quickActionText}>View Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: "#28A745" }]}
            onLongPress={() => setActiveTab("create")}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.quickActionText}>Create Content</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Challenges */}
      {teamChallenges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.teamSectionHeader}>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            <TouchableOpacity onLongPress={() => setActiveTab("challenges")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {teamChallenges.slice(0, 3).map((challenge) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <View
                  style={[
                    styles.challengeStatus,
                    {
                      backgroundColor:
                        challenge.status === "active"
                          ? "#28A745"
                          : challenge.status === "completed"
                          ? "#137CD8"
                          : "#FF9500",
                    },
                  ]}
                >
                  <Text style={styles.challengeStatusText}>
                    {challenge.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.challengeDescription}>
                {challenge.description}
              </Text>
              <View style={styles.challengeProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          (challenge.currentValue / challenge.targetValue) *
                            100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {challenge.currentValue} / {challenge.targetValue}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {teamActivities.length > 0 ? (
          teamActivities.slice(0, 5).map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: getActivityColor(activity.type) },
                ]}
              >
                <Ionicons
                  name={getActivityIcon(activity.type) as any}
                  size={16}
                  color="white"
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityDescription}>
                  {activity.description}
                </Text>
                <Text style={styles.activityTime}>
                  {formatActivityTimestamp(activity.timestamp)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={32} color="#ccc" />
            <Text style={styles.emptyStateText}>No recent activity</Text>
          </View>
        )}
      </View>

      {/* Team Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {formatTimestamp(selectedTeam.createdAt)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Max Members</Text>
            <Text style={styles.infoValue}>
              {selectedTeam.maxMembers || 50}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color: selectedTeam.isActive ? "#28A745" : "#FF3B30",
                },
              ]}
            >
              {selectedTeam.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
          {selectedTeam.inviteCode && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Invite Code</Text>
              <Text style={[styles.infoValue, { fontFamily: "monospace" }]}>
                {selectedTeam.inviteCode}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
