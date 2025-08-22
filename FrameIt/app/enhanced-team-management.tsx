import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services";
import { User, Team } from "../types/database";
import { enhancedTeamStyles as styles } from "../styles";

const formatDate = (timestamp: Date | any): string => {
  // Handle Firestore timestamp objects
  let date: Date;
  if (timestamp && typeof timestamp.toDate === "function") {
    // Firestore timestamp
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    // JavaScript Date
    date = timestamp;
  } else if (timestamp && timestamp.seconds) {
    // Firestore timestamp object format
    date = new Date(timestamp.seconds * 1000);
  } else {
    // Fallback
    return "Unknown date";
  }

  try {
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

interface TeamMember extends User {
  joinedAt?: Date;
  isLeader?: boolean;
}

interface TeamInvite {
  id: string;
  email: string;
  status: "pending" | "accepted" | "expired";
  createdAt: Date;
}

export default function EnhancedTeamManagement() {
  const { user } = useAuth();
  const { width } = Dimensions.get("window");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<TeamInvite[]>([]);

  // Modal states
  const [showAddMember, setShowAddMember] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      const userData = await FirestoreService.getUser(user.uid);
      if (!userData || userData.role !== "team_leader") {
        Alert.alert(
          "Access Denied",
          "You must be a team leader to manage teams."
        );
        router.back();
        return;
      }

      setUserData(userData);

      const teams = await FirestoreService.getUserTeams(user.uid);
      setUserTeams(teams);

      if (teams.length > 0) {
        const firstTeam = teams[0];
        setSelectedTeam(firstTeam);
        await loadTeamData(firstTeam);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async (team: Team) => {
    try {
      const members = await FirestoreService.getTeamMembers(team.teamId);
      const enhancedMembers: TeamMember[] = members.map((member) => ({
        ...member,
        isLeader: member.userId === team.leaderId,
        joinedAt: new Date(), // Would come from actual join data
      }));

      setTeamMembers(enhancedMembers);

      // Load pending invites (sample data for now)
      setPendingInvites([
        {
          id: "1",
          email: "john@example.com",
          status: "pending",
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error loading team data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearchMembers = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Mock search - in real app would search Firestore
      const results: User[] = [
        {
          userId: "mock1",
          email: searchQuery,
          displayName: "John Doe",
          xp: 1500,
          level: 3,
          role: "basic",
        } as User,
      ];
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedTeam) return;

    try {
      await FirestoreService.addUserToTeam(
        selectedTeam.teamId,
        userId,
        user!.uid
      );
      Alert.alert("Success", "Member added to team successfully!");
      setShowAddMember(false);
      setSearchQuery("");
      setSearchResults([]);
      if (selectedTeam) {
        await loadTeamData(selectedTeam);
      }
    } catch (error) {
      console.error("Error adding member:", error);
      Alert.alert("Error", "Failed to add member to team");
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!selectedTeam) return;

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${memberName} from the team?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onLongPress: async () => {
            try {
              await FirestoreService.removeUserFromTeam(
                selectedTeam.teamId,
                userId,
                user!.uid
              );
              Alert.alert("Success", "Member removed from team");
              if (selectedTeam) {
                await loadTeamData(selectedTeam);
              }
            } catch (error) {
              console.error("Error removing member:", error);
              Alert.alert("Error", "Failed to remove member from team");
            }
          },
        },
      ]
    );
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;

    try {
      // Mock invite sending - in real app would send email/notification
      Alert.alert("Success", `Invite sent to ${inviteEmail}`);
      setInviteEmail("");

      // Add to pending invites
      const newInvite: TeamInvite = {
        id: Date.now().toString(),
        email: inviteEmail,
        status: "pending",
        createdAt: new Date(),
      };
      setPendingInvites((prev) => [...prev, newInvite]);
    } catch (error) {
      console.error("Error sending invite:", error);
      Alert.alert("Error", "Failed to send invite");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Team Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onLongPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Management</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onLongPress={() => setShowTeamSettings(true)}
        >
          <Ionicons name="settings" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Team Selector */}
        {userTeams.length > 1 && (
          <View style={styles.teamSelector}>
            <Text style={styles.sectionTitle}>Your Teams</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {userTeams.map((team) => (
                <TouchableOpacity
                  key={team.teamId}
                  style={[
                    styles.teamCard,
                    selectedTeam?.teamId === team.teamId &&
                      styles.selectedTeamCard,
                  ]}
                  onLongPress={() => {
                    setSelectedTeam(team);
                    loadTeamData(team);
                  }}
                >
                  <View style={styles.teamCardHeader}>
                    <Ionicons name="people" size={20} color="#007AFF" />
                    <Text style={styles.teamCardName}>{team.name}</Text>
                  </View>
                  <Text style={styles.teamCardInfo}>
                    {teamMembers.length} members • Active
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedTeam && (
          <>
            {/* Team Overview */}
            <View style={styles.overviewSection}>
              <View style={styles.teamHeader}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{selectedTeam.name}</Text>
                  <Text style={styles.teamDescription}>
                    {selectedTeam.description || "No description available"}
                  </Text>
                </View>
                <View style={styles.teamStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{teamMembers.length}</Text>
                    <Text style={styles.statLabel}>Members</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {teamMembers
                        .reduce((sum, m) => sum + (m.xp || 0), 0)
                        .toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Total XP</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onLongPress={() => setShowAddMember(true)}
              >
                <Ionicons name="person-add" size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Add Member</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryAction]}
                onLongPress={() => router.push("/create-team-challenge")}
              >
                <Ionicons name="trophy" size={20} color="#007AFF" />
                <Text
                  style={[styles.actionButtonText, styles.secondaryActionText]}
                >
                  Create Challenge
                </Text>
              </TouchableOpacity>
            </View>

            {/* Team Members */}
            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>
                Team Members ({teamMembers.length})
              </Text>

              {teamMembers.map((member) => (
                <View key={member.userId} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <View style={styles.avatarContainer}>
                      {member.profileImageUrl ? (
                        <Image
                          source={{ uri: member.profileImageUrl }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {member.displayName?.charAt(0).toUpperCase() || "U"}
                          </Text>
                        </View>
                      )}
                      {member.isLeader && (
                        <View style={styles.leaderBadge}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                        </View>
                      )}
                    </View>

                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>
                        {member.displayName}
                      </Text>
                      <Text style={styles.memberRole}>
                        {member.isLeader
                          ? "Team Leader"
                          : member.tag || "Member"}
                      </Text>
                      <View style={styles.memberStats}>
                        <View style={styles.memberStat}>
                          <Ionicons name="trophy" size={14} color="#FFD700" />
                          <Text style={styles.memberStatText}>
                            {member.xp?.toLocaleString()} XP
                          </Text>
                        </View>
                        <View style={styles.memberStat}>
                          <Ionicons name="shield" size={14} color="#007AFF" />
                          <Text style={styles.memberStatText}>
                            Lv. {member.level}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {!member.isLeader && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onLongPress={() =>
                        handleRemoveMember(
                          member.userId,
                          member.displayName || "Member"
                        )
                      }
                    >
                      <Ionicons
                        name="remove-circle"
                        size={24}
                        color="#FF4757"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <View style={styles.invitesSection}>
                <Text style={styles.sectionTitle}>
                  Pending Invites ({pendingInvites.length})
                </Text>

                {pendingInvites.map((invite) => (
                  <View key={invite.id} style={styles.inviteCard}>
                    <View style={styles.inviteInfo}>
                      <Ionicons name="mail" size={20} color="#666" />
                      <View style={styles.inviteDetails}>
                        <Text style={styles.inviteEmail}>{invite.email}</Text>
                        <Text style={styles.inviteStatus}>
                          Sent {formatDate(invite.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.inviteActions}>
                      <TouchableOpacity style={styles.resendButton}>
                        <Ionicons name="refresh" size={16} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelButton}>
                        <Ionicons name="close" size={16} color="#FF4757" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Member Modal */}
      {showAddMember && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Team Member</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onLongPress={() => {
                  setShowAddMember(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
              <Text style={styles.inputLabel}>Search by username or email</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Enter username or email"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onLongPress={handleSearchMembers}
                >
                  <Ionicons name="search" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.userId}
                    style={styles.searchResultItem}
                    onLongPress={() => handleAddMember(result.userId)}
                  >
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>
                        {result.displayName}
                      </Text>
                      <Text style={styles.resultEmail}>{result.email}</Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color="#007AFF" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.inviteSection}>
              <Text style={styles.inputLabel}>Or send invite by email</Text>
              <View style={styles.inviteContainer}>
                <TextInput
                  style={styles.inviteInput}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  placeholder="Enter email address"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={styles.inviteButton}
                  onLongPress={handleSendInvite}
                  disabled={!inviteEmail.trim()}
                >
                  <Ionicons name="send" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
