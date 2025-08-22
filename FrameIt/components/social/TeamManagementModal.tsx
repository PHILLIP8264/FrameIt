import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FirestoreService } from "../../services";
import { User as DatabaseUser, Team } from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";

interface TeamManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onTeamUpdate?: () => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  visible,
  onClose,
  onTeamUpdate,
}) => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<DatabaseUser | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<DatabaseUser[]>([]);
  const [activeTab, setActiveTab] = useState<"teams" | "create" | "manage">(
    "teams"
  );

  // Create team state
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState("50");

  // Add member state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DatabaseUser[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState<{
    totalXp: number;
    completedQuests: number;
    averageLevel: number;
    activeMembers: number;
  } | null>(null);

  useEffect(() => {
    if (visible && authUser) {
      loadUserAndTeamData();
    }
  }, [visible, authUser]);

  const loadUserAndTeamData = async () => {
    if (!authUser) return;

    setLoading(true);
    try {
      // Get full user data from Firestore
      const userData = await FirestoreService.getUser(authUser.uid);
      setUser(userData);

      if (userData && userData.role === "team_leader") {
        // Get all teams for this user
        const teams = await FirestoreService.getUserTeams(authUser.uid);
        setUserTeams(teams);

        if (teams.length > 0) {
          setActiveTab("teams");
          // Load the first team by default
          await loadTeamData(teams[0]);
        } else {
          setActiveTab("create");
        }
      }
    } catch (error) {
      console.error("Error loading user and team data:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async (team: Team) => {
    setSelectedTeam(team);
    setLoading(true);
    try {
      const [members, invites, stats] = await Promise.all([
        FirestoreService.getTeamMembers(team.teamId),
        FirestoreService.getTeamInvites(team.teamId),
        calculateTeamStats(team.teamId),
      ]);

      setTeamMembers(members);
      setPendingInvites(invites);
      setTeamStats(stats);
    } catch (error) {
      console.error("Error loading team data:", error);
      Alert.alert("Error", "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamStats = async (teamId: string) => {
    try {
      const members = await FirestoreService.getTeamMembers(teamId);

      const totalXp = members.reduce(
        (sum, member) => sum + (member.xp || 0),
        0
      );
      const averageLevel =
        members.length > 0
          ? members.reduce((sum, member) => sum + (member.level || 1), 0) /
            members.length
          : 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activeMembers = members.length;

      const completedQuests = await FirestoreService.getTeamQuestCompletions(
        teamId
      );

      return {
        totalXp,
        completedQuests: completedQuests.length,
        averageLevel: Math.round(averageLevel * 10) / 10,
        activeMembers,
      };
    } catch (error) {
      console.error("Error calculating team stats:", error);
      return {
        totalXp: 0,
        completedQuests: 0,
        averageLevel: 0,
        activeMembers: 0,
      };
    }
  };

  const handleCreateTeam = async () => {
    if (!authUser || !user || !teamName.trim()) {
      Alert.alert("Error", "Please enter a team name");
      return;
    }

    if (user.role !== "team_leader") {
      Alert.alert("Error", "Only team leaders can create teams");
      return;
    }

    setLoading(true);
    try {
      const teamId = await FirestoreService.createTeam(
        {
          name: teamName.trim(),
          description: teamDescription.trim() || undefined,
          maxMembers: parseInt(maxMembers) || 50,
        },
        authUser.uid
      );

      // Generate invite code for the new team
      const inviteCode = await FirestoreService.generateTeamCode(teamId);

      Alert.alert(
        "Success",
        `Team created successfully!\n\nInvite Code: ${inviteCode}\n\nShare this code with others to let them join your team.`,
        [
          {
            text: "OK",
            onPress: () => {
              loadUserAndTeamData();
              onTeamUpdate?.();
            },
          },
        ]
      );

      // Reset form
      setTeamName("");
      setTeamDescription("");
      setMaxMembers("50");
      setActiveTab("teams");
    } catch (error: any) {
      console.error("Error creating team:", error);
      Alert.alert("Error", error.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!authUser) return;

    Alert.alert(
      "Delete Team",
      `Are you sure you want to delete "${team.name}"? This action cannot be undone and all members will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await FirestoreService.deleteTeam(team.teamId, authUser.uid);
              Alert.alert("Success", "Team deleted successfully!");
              loadUserAndTeamData();
              onTeamUpdate?.(); // Notify parent component
            } catch (error: any) {
              console.error("Error deleting team:", error);
              Alert.alert("Error", error.message || "Failed to delete team");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2 || !authUser) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await FirestoreService.searchUsers(query, authUser.uid);
      // Filter out users who are already members of this team
      const availableUsers = results.filter(
        (u: DatabaseUser) => !selectedTeam?.members.includes(u.userId)
      );
      setSearchResults(availableUsers);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!authUser || !selectedTeam) return;

    setLoading(true);
    try {
      await FirestoreService.addUserToTeam(
        selectedTeam.teamId,
        userId,
        authUser.uid
      );
      Alert.alert("Success", "Member added successfully!");
      setSearchQuery("");
      setSearchResults([]);
      setShowAddMember(false);
      loadTeamData(selectedTeam);
      onTeamUpdate?.(); // Notify parent component
    } catch (error: any) {
      console.error("Error adding member:", error);
      Alert.alert("Error", error.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!authUser || !selectedTeam) return;

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${userName} from the team?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await FirestoreService.removeUserFromTeam(
                selectedTeam.teamId,
                userId,
                authUser.uid
              );
              Alert.alert("Success", "Member removed successfully!");
              loadTeamData(selectedTeam);
              onTeamUpdate?.(); // Notify parent component
            } catch (error: any) {
              console.error("Error removing member:", error);
              Alert.alert("Error", error.message || "Failed to remove member");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleGenerateCode = async () => {
    if (!selectedTeam) return;

    setLoading(true);
    try {
      const code = await FirestoreService.generateTeamCode(selectedTeam.teamId);
      Alert.alert(
        "Team Invite Code Generated",
        `New invite code: ${code}\n\nThis code will expire in 24 hours.`,
        [{ text: "OK" }]
      );
      // Refresh team data to get the new code
      const updatedTeam = await FirestoreService.getTeam(selectedTeam.teamId);
      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
      }
    } catch (error: any) {
      console.error("Error generating team code:", error);
      Alert.alert("Error", error.message || "Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  const renderTeamsTab = () => (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <View style={{ padding: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#212529",
            }}
          >
            My Teams ({userTeams.length})
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#137CD8",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
            onLongPress={() => setActiveTab("create")}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text
              style={{
                color: "white",
                marginLeft: 4,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Create
            </Text>
          </TouchableOpacity>
        </View>

        {userTeams.map((team) => (
          <TouchableOpacity
            key={team.teamId}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              marginBottom: 16,
              padding: 20,
              borderWidth: selectedTeam?.teamId === team.teamId ? 2 : 0,
              borderColor:
                selectedTeam?.teamId === team.teamId
                  ? "#137CD8"
                  : "transparent",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onLongPress={() => {
              loadTeamData(team);
              setActiveTab("manage");
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#212529",
                  flex: 1,
                }}
              >
                {team.name}
              </Text>
              <TouchableOpacity
                onLongPress={() => handleDeleteTeam(team)}
                style={{
                  padding: 8,
                  marginLeft: 12,
                }}
              >
                <Ionicons name="trash" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>

            {team.description && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#6c757d",
                  marginBottom: 12,
                  lineHeight: 20,
                }}
              >
                {team.description}
              </Text>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#6c757d",
                }}
              >
                {team.members.length} / {team.maxMembers || 50} members
              </Text>
              <View
                style={{
                  backgroundColor: team.isActive ? "#28a745" : "#dc3545",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {team.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>

            {team.inviteCode && (
              <View
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#e9ecef",
                  borderStyle: "dashed",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#137CD8",
                    textAlign: "center",
                    fontWeight: "600",
                    letterSpacing: 1,
                  }}
                >
                  Code: {team.inviteCode}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {userTeams.length === 0 && (
          <View
            style={{
              alignItems: "center",
              marginTop: 60,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 32,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="people-circle-outline" size={64} color="#adb5bd" />
            <Text
              style={{
                fontSize: 18,
                color: "#212529",
                marginTop: 16,
                fontWeight: "600",
              }}
            >
              No teams yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6c757d",
                textAlign: "center",
                marginTop: 8,
                lineHeight: 20,
              }}
            >
              Create your first team to start collaborating!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderCreateTeamTab = () => (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <View style={{ padding: 20 }}>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#212529",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Create New Team
          </Text>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#212529",
                marginBottom: 8,
              }}
            >
              Team Name *
            </Text>
            <TextInput
              style={{
                borderWidth: 2,
                borderColor: "#e9ecef",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                backgroundColor: "#f8f9fa",
                color: "#212529",
              }}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Enter team name"
              placeholderTextColor="#6c757d"
              maxLength={50}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#212529",
                marginBottom: 8,
              }}
            >
              Description
            </Text>
            <TextInput
              style={{
                borderWidth: 2,
                borderColor: "#e9ecef",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                backgroundColor: "#f8f9fa",
                height: 100,
                textAlignVertical: "top",
                color: "#212529",
              }}
              value={teamDescription}
              onChangeText={setTeamDescription}
              placeholder="Enter team description (optional)"
              placeholderTextColor="#6c757d"
              multiline
              maxLength={200}
            />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#212529",
                marginBottom: 8,
              }}
            >
              Maximum Members
            </Text>
            <TextInput
              style={{
                borderWidth: 2,
                borderColor: "#e9ecef",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                backgroundColor: "#f8f9fa",
                color: "#212529",
              }}
              value={maxMembers}
              onChangeText={setMaxMembers}
              placeholder="50"
              placeholderTextColor="#6c757d"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "#137CD8",
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 12,
              alignItems: "center",
              opacity: loading || !teamName.trim() ? 0.6 : 1,
            }}
            onLongPress={handleCreateTeam}
            disabled={loading || !teamName.trim()}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Create Team
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: 20,
            backgroundColor: "white",
            borderRadius: 12,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: "#6c757d",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            ℹ️{" "}
            <Text style={{ fontWeight: "600", color: "#212529" }}>
              Team Benefits:
            </Text>
            {"\n"}• Collaborate on quests together
            {"\n"}• Share achievements and progress
            {"\n"}• Compete in team challenges
            {"\n"}• Access exclusive team content
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderManageTeamTab = () => (
    <View style={{ flex: 1, padding: 20 }}>
      {selectedTeam && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>
              {selectedTeam.name}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#34C759",
                padding: 8,
                borderRadius: 6,
                flexDirection: "row",
                alignItems: "center",
              }}
              onLongPress={handleGenerateCode}
            >
              <Ionicons name="refresh" size={16} color="white" />
              <Text
                style={{ color: "white", marginLeft: 4, fontWeight: "600" }}
              >
                Code
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
              Members ({teamMembers.length})
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#007AFF",
                padding: 8,
                borderRadius: 6,
                flexDirection: "row",
                alignItems: "center",
              }}
              onLongPress={() => setShowAddMember(true)}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text
                style={{ color: "white", marginLeft: 4, fontWeight: "600" }}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>

          {showAddMember && (
            <View
              style={{
                marginBottom: 20,
                padding: 15,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#333",
                    flex: 1,
                  }}
                >
                  Add Member
                </Text>
                <TouchableOpacity onLongPress={() => setShowAddMember(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 6,
                  padding: 10,
                  fontSize: 16,
                  marginBottom: 10,
                }}
                value={searchQuery}
                onChangeText={handleSearchUsers}
                placeholder="Search users by name or email..."
              />

              {searchResults.map((searchUser) => (
                <TouchableOpacity
                  key={searchUser.userId}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                  onLongPress={() => handleAddMember(searchUser.userId)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontSize: 16, fontWeight: "600", color: "#333" }}
                    >
                      {searchUser.displayName || searchUser.email}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#666" }}>
                      {searchUser.email}
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#007AFF" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ScrollView style={{ flex: 1 }}>
            {teamMembers.map((member) => (
              <View
                key={member.userId}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 15,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", color: "#333" }}
                  >
                    {member.displayName || member.email}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#666" }}>
                    {member.email}
                  </Text>
                  {member.userId === selectedTeam.leaderId && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#007AFF",
                        fontWeight: "600",
                      }}
                    >
                      Team Leader
                    </Text>
                  )}
                </View>
                {member.userId !== selectedTeam.leaderId &&
                  member.userId !== authUser?.uid && (
                    <TouchableOpacity
                      onLongPress={() =>
                        handleRemoveMember(
                          member.userId,
                          member.displayName || member.email
                        )
                      }
                      style={{ padding: 5 }}
                    >
                      <Ionicons
                        name="remove-circle"
                        size={24}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  )}
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );

  if (!authUser) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            width: "100%",
            maxWidth: 420,
            height: "80%",
            minHeight: 500,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 12,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: "#007AFF",
              paddingVertical: 20,
              paddingHorizontal: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#FFFFFF",
                letterSpacing: 0.5,
              }}
            >
              Team Management
            </Text>
            <TouchableOpacity
              onLongPress={onClose}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 20,
                padding: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
            {loading && userTeams.length === 0 && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10, fontSize: 16, color: "#6c757d" }}>
                  Loading...
                </Text>
              </View>
            )}

            {!loading && user && user.role !== "team_leader" && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 20,
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: 32,
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="lock-closed" size={64} color="#6c757d" />
                  <Text
                    style={{
                      fontSize: 18,
                      color: "#212529",
                      textAlign: "center",
                      marginTop: 20,
                      fontWeight: "600",
                    }}
                  >
                    Team management is only available for team leaders.
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#6c757d",
                      textAlign: "center",
                      marginTop: 8,
                    }}
                  >
                    Contact your team leader for team-related actions.
                  </Text>
                </View>
              </View>
            )}

            {!loading && user && user.role === "team_leader" && (
              <>
                {/* Tabs */}
                <View
                  style={{
                    backgroundColor: "white",
                    borderBottomWidth: 1,
                    borderBottomColor: "#e9ecef",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        alignItems: "center",
                        borderBottomWidth: activeTab === "teams" ? 2 : 0,
                        borderBottomColor: "#137CD8",
                      }}
                      onLongPress={() => setActiveTab("teams")}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: activeTab === "teams" ? "#137CD8" : "#6c757d",
                        }}
                      >
                        Teams
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        alignItems: "center",
                        borderBottomWidth: activeTab === "create" ? 2 : 0,
                        borderBottomColor: "#137CD8",
                      }}
                      onLongPress={() => setActiveTab("create")}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: activeTab === "create" ? "#137CD8" : "#6c757d",
                        }}
                      >
                        Create
                      </Text>
                    </TouchableOpacity>
                    {selectedTeam && (
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          paddingVertical: 16,
                          alignItems: "center",
                          borderBottomWidth: activeTab === "manage" ? 2 : 0,
                          borderBottomColor: "#137CD8",
                        }}
                        onLongPress={() => setActiveTab("manage")}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color:
                              activeTab === "manage" ? "#137CD8" : "#6c757d",
                          }}
                        >
                          Manage
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  {activeTab === "teams" && renderTeamsTab()}
                  {activeTab === "create" && renderCreateTeamTab()}
                  {activeTab === "manage" && renderManageTeamTab()}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
