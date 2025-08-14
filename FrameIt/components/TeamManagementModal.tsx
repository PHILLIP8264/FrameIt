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
import FirestoreService from "../services/FirestoreService";
import { User as DatabaseUser, Team } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

interface TeamManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onTeamUpdate?: () => void; // Callback to refresh parent component
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
      const members = await FirestoreService.getTeamMembers(team.teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error("Error loading team data:", error);
      Alert.alert("Error", "Failed to load team data");
    } finally {
      setLoading(false);
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

      Alert.alert("Success", "Team created successfully!", [
        {
          text: "OK",
          onPress: () => {
            loadUserAndTeamData();
            onTeamUpdate?.(); // Notify parent component
          },
        },
      ]);

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
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>
          My Teams ({userTeams.length})
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 8,
            borderRadius: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => setActiveTab("create")}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={{ color: "white", marginLeft: 4, fontWeight: "600" }}>
            Create
          </Text>
        </TouchableOpacity>
      </View>

      {userTeams.map((team) => (
        <TouchableOpacity
          key={team.teamId}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 8,
            marginBottom: 15,
            padding: 15,
            borderWidth: selectedTeam?.teamId === team.teamId ? 2 : 1,
            borderColor:
              selectedTeam?.teamId === team.teamId ? "#007AFF" : "#eee",
          }}
          onPress={() => {
            loadTeamData(team);
            setActiveTab("manage");
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
              {team.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteTeam(team)}
              style={{ padding: 5 }}
            >
              <Ionicons name="trash" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          {team.description && (
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 10 }}>
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
            <Text style={{ fontSize: 14, color: "#666" }}>
              {team.members.length} / {team.maxMembers || 50} members
            </Text>
            <View
              style={{
                backgroundColor: team.isActive ? "#34C759" : "#FF3B30",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                {team.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {team.inviteCode && (
            <View
              style={{
                marginTop: 10,
                padding: 8,
                backgroundColor: "rgba(0, 122, 255, 0.1)",
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "#007AFF",
                borderStyle: "dashed",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#007AFF",
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
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Ionicons name="people-circle-outline" size={64} color="#ccc" />
          <Text style={{ fontSize: 18, color: "#666", marginTop: 10 }}>
            No teams yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#999",
              textAlign: "center",
              marginTop: 5,
            }}
          >
            Create your first team to start collaborating!
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderCreateTeamTab = () => (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 20,
        }}
      >
        Create New Team
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Team Name *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
          value={teamName}
          onChangeText={setTeamName}
          placeholder="Enter team name"
          maxLength={50}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Description
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            height: 100,
          }}
          value={teamDescription}
          onChangeText={setTeamDescription}
          placeholder="Enter team description (optional)"
          multiline
          textAlignVertical="top"
          maxLength={200}
        />
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Maximum Members
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
          value={maxMembers}
          onChangeText={setMaxMembers}
          placeholder="50"
          keyboardType="numeric"
          maxLength={3}
        />
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "#007AFF",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
          opacity: loading ? 0.6 : 1,
        }}
        onPress={handleCreateTeam}
        disabled={loading || !teamName.trim()}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
            Create Team
          </Text>
        )}
      </TouchableOpacity>
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
              onPress={handleGenerateCode}
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
              onPress={() => setShowAddMember(true)}
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
                <TouchableOpacity onPress={() => setShowAddMember(false)}>
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
                  onPress={() => handleAddMember(searchUser.userId)}
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
                      onPress={() =>
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
      presentationStyle="pageSheet"
    >
      <ImageBackground
        source={require("../assets/images/blank.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <TouchableOpacity onPress={onClose} style={{ marginRight: 15 }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#333",
                  flex: 1,
                }}
              >
                Team Management
              </Text>
            </View>

            {loading && userTeams.length === 0 && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10, fontSize: 16, color: "#666" }}>
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
                <Ionicons name="lock-closed" size={64} color="#666" />
                <Text
                  style={{
                    fontSize: 18,
                    color: "#666",
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  Team management is only available for team leaders.
                </Text>
              </View>
            )}

            {!loading && user && user.role === "team_leader" && (
              <>
                {/* Tabs */}
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 15,
                      alignItems: "center",
                      borderBottomWidth: activeTab === "teams" ? 2 : 0,
                      borderBottomColor: "#007AFF",
                    }}
                    onPress={() => setActiveTab("teams")}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: activeTab === "teams" ? "bold" : "normal",
                        color: activeTab === "teams" ? "#007AFF" : "#666",
                      }}
                    >
                      Teams
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 15,
                      alignItems: "center",
                      borderBottomWidth: activeTab === "create" ? 2 : 0,
                      borderBottomColor: "#007AFF",
                    }}
                    onPress={() => setActiveTab("create")}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: activeTab === "create" ? "bold" : "normal",
                        color: activeTab === "create" ? "#007AFF" : "#666",
                      }}
                    >
                      Create
                    </Text>
                  </TouchableOpacity>
                  {selectedTeam && (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        padding: 15,
                        alignItems: "center",
                        borderBottomWidth: activeTab === "manage" ? 2 : 0,
                        borderBottomColor: "#007AFF",
                      }}
                      onPress={() => setActiveTab("manage")}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight:
                            activeTab === "manage" ? "bold" : "normal",
                          color: activeTab === "manage" ? "#007AFF" : "#666",
                        }}
                      >
                        Manage
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Content */}
                {activeTab === "teams" && renderTeamsTab()}
                {activeTab === "create" && renderCreateTeamTab()}
                {activeTab === "manage" && renderManageTeamTab()}
              </>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </Modal>
  );
};
