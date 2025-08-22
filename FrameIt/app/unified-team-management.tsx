import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useTeamManagement } from "../hooks/useTeamManagement";

export default function UnifiedTeamManagement() {
  const teamData = useTeamManagement();

  const {
    loading,
    refreshing,
    userTeams,
    selectedTeam,
    teamMembers,
    teamChallenges,
    teamQuests,
    teamActivities,
    activeTab,
    setActiveTab,
    onRefresh,
    selectTeam,
  } = teamData;

  const tabs = [
    { id: "overview", title: "Overview", icon: "home" },
    { id: "members", title: "Members", icon: "people" },
    { id: "challenges", title: "Challenges", icon: "trophy" },
    { id: "quests", title: "Quests", icon: "map" },
    { id: "create", title: "Create", icon: "add-circle" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ScrollView style={styles.container}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Team Overview</Text>
              {selectedTeam ? (
                <View style={styles.card}>
                  <Text style={styles.teamName}>{selectedTeam.name}</Text>
                  {selectedTeam.description && (
                    <Text style={styles.teamDescription}>
                      {selectedTeam.description}
                    </Text>
                  )}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{teamMembers.length}</Text>
                      <Text style={styles.statLabel}>Members</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {teamChallenges.length}
                      </Text>
                      <Text style={styles.statLabel}>Challenges</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{teamQuests.length}</Text>
                      <Text style={styles.statLabel}>Quests</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No team selected</Text>
                </View>
              )}
            </View>
          </ScrollView>
        );

      case "members":
        return (
          <ScrollView style={styles.container}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Team Members</Text>
              {teamMembers.length > 0 ? (
                teamMembers.map((member, index) => (
                  <View key={index} style={styles.memberCard}>
                    <View>
                      <Text style={styles.memberName}>
                        {member.displayName || member.email}
                      </Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                    {member.isLeader && (
                      <View style={styles.leaderBadge}>
                        <Text style={styles.leaderText}>Leader</Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No members found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        );

      case "challenges":
        return (
          <ScrollView style={styles.container}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Team Challenges</Text>
              {teamChallenges.length > 0 ? (
                teamChallenges.map((challenge) => (
                  <View key={challenge.id} style={styles.challengeCard}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDescription}>
                      {challenge.description}
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{challenge.status}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="trophy-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No challenges found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        );

      case "quests":
        return (
          <ScrollView style={styles.container}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Team Quests</Text>
              {teamQuests.length > 0 ? (
                teamQuests.map((quest, index) => (
                  <View key={index} style={styles.questCard}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <Text style={styles.questDescription}>
                      {quest.description}
                    </Text>
                    <Text style={styles.questLocation}>{quest.location}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="map-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No quests found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        );

      case "create":
        return (
          <ScrollView style={styles.container}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Create Content</Text>

              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: "#137CD8" }]}
                onLongPress={() =>
                  Alert.alert("Info", "Create team feature coming soon")
                }
              >
                <Ionicons name="people" size={24} color="white" />
                <Text style={styles.createButtonText}>Create Team</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: "#D61A66" }]}
                onLongPress={() =>
                  Alert.alert("Info", "Create challenge feature coming soon")
                }
              >
                <Ionicons name="trophy" size={24} color="white" />
                <Text style={styles.createButtonText}>Create Challenge</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: "#28A745" }]}
                onLongPress={() =>
                  Alert.alert("Info", "Create quest feature coming soon")
                }
              >
                <Ionicons name="map" size={24} color="white" />
                <Text style={styles.createButtonText}>Create Quest</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      default:
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Select a tab to view content</Text>
          </View>
        );
    }
  };

  if (loading && userTeams.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#137CD8" />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#137CD8" />

      {/* Header */}
      <LinearGradient colors={["#137CD8", "#0F5BA8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onLongPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Team Management</Text>
            {selectedTeam && (
              <Text style={styles.headerSubtitle}>{selectedTeam.name}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onLongPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={24}
              color="white"
              style={refreshing ? { opacity: 0.5 } : {}}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Team Selector */}
      {userTeams.length > 1 && (
        <View style={styles.teamSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {userTeams.map((team) => (
              <TouchableOpacity
                key={team.teamId}
                style={[
                  styles.teamSelectorItem,
                  selectedTeam?.teamId === team.teamId && styles.selectedTeam,
                ]}
                onLongPress={() => selectTeam(team)}
              >
                <Text
                  style={[
                    styles.teamSelectorText,
                    selectedTeam?.teamId === team.teamId &&
                      styles.selectedTeamText,
                  ]}
                >
                  {team.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onLongPress={() => setActiveTab(tab.id as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? "#137CD8" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.id ? "#137CD8" : "#666" },
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Area */}
      <View style={styles.content}>{renderTabContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  teamSelector: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  teamSelectorItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  selectedTeam: {
    backgroundColor: "#137CD8",
  },
  teamSelectorText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectedTeamText: {
    color: "white",
  },
  tabContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "rgba(19, 124, 216, 0.1)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#137CD8",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  memberCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  memberEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  leaderBadge: {
    backgroundColor: "#137CD8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leaderText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  challengeCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#28A745",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  questCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  questDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  questLocation: {
    fontSize: 14,
    color: "#137CD8",
    fontWeight: "500",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
});
