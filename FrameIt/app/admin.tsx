import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import FirestoreService from "../services/FirestoreService";
import DatabaseService from "../services/DatabaseService";
import { User, Group, Team, Tag, Achievement } from "../types/database";
import { auth } from "../config/firebase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    teamLeaders: 0,
    totalTeams: 0,
    activeTeams: 0,
    basicUsers: 0,
    adminUsers: 0,
  });

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, tagsData, achievementsData, groupsData, teamsData] =
        await Promise.all([
          FirestoreService.getAllUsers(),
          DatabaseService.getTags(),
          FirestoreService.getAchievements(),
          FirestoreService.getGroups(),
          FirestoreService.getTeams(),
        ]);

      setUsers(usersData);
      setTags(tagsData);
      setAchievements(achievementsData);
      setGroups(groupsData);
      setTeams(teamsData);

      // Calculate stats
      const newStats = {
        totalUsers: usersData.length,
        teamLeaders: usersData.filter((u) => u.role === "team_leader").length,
        basicUsers: usersData.filter((u) => u.role === "basic").length,
        adminUsers: usersData.filter((u) => u.role === "admin").length,
        totalTeams: teamsData.length,
        activeTeams: teamsData.filter((t) => t.isActive).length,
      };
      setStats(newStats);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openModal = (action: string, data: any = {}) => {
    setCurrentAction(action);
    setFormData(data);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFormData({});
    setCurrentAction("");
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      !searchQuery ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const promoteToTeamLeader = async (userId: string) => {
    try {
      setLoading(true);
      await FirestoreService.updateUserRole(userId, "team_leader");
      Alert.alert("Success", "User promoted to Team Leader!");
      loadData();
    } catch (error) {
      console.error("Error promoting user:", error);
      Alert.alert("Error", "Failed to promote user");
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (
    userId: string,
    newRole: "basic" | "team_leader" | "admin"
  ) => {
    try {
      setLoading(true);
      await FirestoreService.updateUserRole(userId, newRole);
      Alert.alert("Success", `User role changed to ${newRole}!`);
      loadData();
    } catch (error) {
      console.error("Error changing user role:", error);
      Alert.alert("Error", "Failed to change user role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = (team: any) => {
    Alert.alert(
      "Delete Team",
      `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Get current user - admin can delete any team
              const currentUser = auth.currentUser;
              if (!currentUser) {
                Alert.alert("Error", "You must be logged in to delete teams");
                return;
              }
              await FirestoreService.deleteTeam(team.teamId, currentUser.uid);
              Alert.alert("Success", "Team deleted successfully!");
              loadData();
            } catch (error) {
              console.error("Error deleting team:", error);
              Alert.alert("Error", "Failed to delete team");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderDashboard = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.sectionTitle}>Admin Dashboard</Text>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
          <Ionicons name="people" size={24} color="#1976D2" />
          <Text style={[styles.statNumber, { color: "#1976D2" }]}>
            {stats.totalUsers}
          </Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#E8F5E8" }]}>
          <Ionicons name="shield-checkmark" size={24} color="#388E3C" />
          <Text style={[styles.statNumber, { color: "#388E3C" }]}>
            {stats.teamLeaders}
          </Text>
          <Text style={styles.statLabel}>Team Leaders</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
          <Ionicons name="people-circle" size={24} color="#F57C00" />
          <Text style={[styles.statNumber, { color: "#F57C00" }]}>
            {stats.totalTeams}
          </Text>
          <Text style={styles.statLabel}>Total Teams</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#FCE4EC" }]}>
          <Ionicons name="checkmark-circle" size={24} color="#C2185B" />
          <Text style={[styles.statNumber, { color: "#C2185B" }]}>
            {stats.activeTeams}
          </Text>
          <Text style={styles.statLabel}>Active Teams</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.subSectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: "#E3F2FD" }]}
            onPress={() => setActiveTab("users")}
          >
            <Ionicons name="person-add" size={28} color="#1976D2" />
            <Text style={[styles.quickActionText, { color: "#1976D2" }]}>
              Manage Users
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: "#E8F5E8" }]}
            onPress={() => openModal("createTeam")}
          >
            <Ionicons name="people-circle" size={28} color="#388E3C" />
            <Text style={[styles.quickActionText, { color: "#388E3C" }]}>
              Create Team
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: "#FFF3E0" }]}
            onPress={() => openModal("createTag")}
          >
            <Ionicons name="pricetag" size={28} color="#F57C00" />
            <Text style={[styles.quickActionText, { color: "#F57C00" }]}>
              Create Tag
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: "#FCE4EC" }]}
            onPress={() => openModal("createAchievement")}
          >
            <Ionicons name="trophy" size={28} color="#C2185B" />
            <Text style={[styles.quickActionText, { color: "#C2185B" }]}>
              Add Achievement
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>User Management</Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.userId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>
                  {item.displayName || item.email}
                </Text>
                <View style={[styles.roleBadge, styles[`${item.role}Badge`]]}>
                  <Text style={styles.roleBadgeText}>
                    {item.role.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{item.email}</Text>
              <View style={styles.userStats}>
                <Text style={styles.userStat}>Level: {item.level}</Text>
                <Text style={styles.userStat}>
                  XP: {item.xp?.toLocaleString() || 0}
                </Text>
                {item.teams && item.teams.length > 0 && (
                  <Text style={[styles.userStat, { color: "#34C759" }]}>
                    Teams: {item.teams.length}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.userActions}>
              {item.role === "basic" && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.promoteBtn]}
                  onPress={() => promoteToTeamLeader(item.userId)}
                >
                  <Ionicons name="arrow-up" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Promote</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => {
                  setSelectedUser(item);
                  openModal("changeRole");
                }}
              >
                <Ionicons name="settings" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Edit Role</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No users found</Text>
          </View>
        )}
      />
    </View>
  );

  const renderTeams = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Team Management</Text>
        <TouchableOpacity
          style={[styles.actionBtn, styles.createBtn]}
          onPress={() => openModal("createTeam")}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Create Team</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(item) => item.teamId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamName}>{item.name}</Text>
              <View style={styles.teamHeaderActions}>
                <View
                  style={[
                    styles.statusBadge,
                    item.isActive ? styles.activeBadge : styles.inactiveBadge,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {item.isActive ? "ACTIVE" : "INACTIVE"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteTeam(item)}
                >
                  <Ionicons name="trash" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.teamDescription}>{item.description}</Text>
            <View style={styles.teamStats}>
              <View style={styles.teamStat}>
                <Ionicons name="people" size={16} color="#666" />
                <Text style={styles.teamStatText}>
                  {item.members.length}/{item.maxMembers || 50} Members
                </Text>
              </View>
              <View style={styles.teamStat}>
                <Ionicons name="person-circle" size={16} color="#666" />
                <Text style={styles.teamStatText}>
                  Leader:{" "}
                  {users.find((u) => u.userId === item.leaderId)?.displayName ||
                    "Unknown"}
                </Text>
              </View>
              <Text style={styles.teamCreated}>
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="people-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No teams found</Text>
            <TouchableOpacity
              style={[styles.actionBtn, styles.createBtn, { marginTop: 15 }]}
              onPress={() => openModal("createTeam")}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Create First Team</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  const renderModalContent = () => {
    switch (currentAction) {
      case "createTeam":
        return (
          <View style={styles.modalForm}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Team Information</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="people" size={20} color="#007AFF" />
                </View>
                <TextInput
                  style={styles.modalInputWithIcon}
                  placeholder="Team Name"
                  placeholderTextColor="#8E8E93"
                  value={formData.teamName || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, teamName: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="document-text" size={20} color="#007AFF" />
                </View>
                <TextInput
                  style={[styles.modalInputWithIcon, styles.textAreaInput]}
                  placeholder="Team Description"
                  placeholderTextColor="#8E8E93"
                  value={formData.teamDescription || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, teamDescription: text })
                  }
                  multiline
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="person-add" size={20} color="#007AFF" />
                </View>
                <TextInput
                  style={styles.modalInputWithIcon}
                  placeholder="Max Members (default: 50)"
                  placeholderTextColor="#8E8E93"
                  value={formData.maxMembers || ""}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      maxMembers: parseInt(text) || 50,
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        );
      case "createTag":
        return (
          <View style={styles.modalForm}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Tag Details</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="barcode" size={20} color="#007AFF" />
                </View>
                <TextInput
                  style={styles.modalInputWithIcon}
                  placeholder="Tag ID"
                  placeholderTextColor="#8E8E93"
                  value={formData.id || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, id: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="pricetag" size={20} color="#007AFF" />
                </View>
                <TextInput
                  style={styles.modalInputWithIcon}
                  placeholder="Tag Name"
                  placeholderTextColor="#8E8E93"
                  value={formData.name || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="document-text" size={20} color="#007AFF" />
                </View>
                <TextInput
                  style={[styles.modalInputWithIcon, styles.textAreaInput]}
                  placeholder="Description"
                  placeholderTextColor="#8E8E93"
                  value={formData.description || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        );
      case "createAchievement":
        return (
          <View style={styles.modalForm}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Achievement Details</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="trophy" size={20} color="#007AFF" />
                </View>
                <TextInput
                  style={styles.modalInputWithIcon}
                  placeholder="Achievement Name"
                  placeholderTextColor="#8E8E93"
                  value={formData.name || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="document-text" size={20} color="#007AFF" />
                </View>
                <TextInput
                  style={[styles.modalInputWithIcon, styles.textAreaInput]}
                  placeholder="Description"
                  placeholderTextColor="#8E8E93"
                  value={formData.description || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="layers" size={20} color="#007AFF" />
                </View>
                <TextInput
                  style={styles.modalInputWithIcon}
                  placeholder="Type (quest/streak/vote)"
                  placeholderTextColor="#8E8E93"
                  value={formData.type || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, type: text })
                  }
                />
              </View>
            </View>
          </View>
        );
      case "changeRole":
        return (
          <View style={styles.modalForm}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>User Information</Text>
              <View style={styles.userInfoCard}>
                <View style={styles.userInfoRow}>
                  <Ionicons name="person-circle" size={20} color="#007AFF" />
                  <Text style={styles.userInfoLabel}>User:</Text>
                  <Text style={styles.userInfoValue}>
                    {selectedUser?.displayName || selectedUser?.email}
                  </Text>
                </View>
                <View style={styles.userInfoRow}>
                  <Ionicons name="shield-checkmark" size={20} color="#FF9500" />
                  <Text style={styles.userInfoLabel}>Current Role:</Text>
                  <Text style={styles.userInfoValue}>{selectedUser?.role}</Text>
                </View>
              </View>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Select New Role</Text>
              <View style={styles.roleOptionsContainer}>
                {(["basic", "team_leader", "admin"] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      formData.newRole === role && styles.selectedRoleOption,
                    ]}
                    onPress={() => setFormData({ ...formData, newRole: role })}
                  >
                    <View style={styles.roleOptionContent}>
                      <Ionicons
                        name={
                          role === "admin"
                            ? "shield-checkmark"
                            : role === "team_leader"
                            ? "people"
                            : "person"
                        }
                        size={20}
                        color={
                          formData.newRole === role ? "#FFFFFF" : "#007AFF"
                        }
                      />
                      <Text
                        style={[
                          styles.roleOptionText,
                          formData.newRole === role &&
                            styles.selectedRoleOptionText,
                        ]}
                      >
                        {role.charAt(0).toUpperCase() +
                          role.slice(1).replace("_", " ")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      switch (currentAction) {
        case "changeRole":
          if (selectedUser && formData.newRole) {
            await changeUserRole(selectedUser.userId, formData.newRole);
          }
          break;
        case "createTeam":
          if (formData.teamName && formData.teamDescription) {
            const currentUser = auth.currentUser;
            if (!currentUser) {
              Alert.alert("Error", "You must be logged in to create teams");
              return;
            }
            await FirestoreService.createTeam(
              {
                name: formData.teamName,
                description: formData.teamDescription,
                maxMembers: formData.maxMembers || 50,
              },
              currentUser.uid
            );
            Alert.alert("Success", "Team created successfully!");
          } else {
            Alert.alert("Error", "Please fill in all fields");
            return;
          }
          break;
        default:
          Alert.alert("Info", "Feature coming soon!");
          break;
      }
      closeModal();
      loadData();
    } catch (error) {
      console.error("Error saving:", error);
      Alert.alert("Error", "Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return renderUsers();
      case "teams":
        return renderTeams();
      default:
        return renderDashboard();
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/blank.png")}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadData}
            disabled={loading}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {[
            { key: "dashboard", label: "Dashboard", icon: "analytics" },
            { key: "users", label: "Users", icon: "people" },
            { key: "teams", label: "Teams", icon: "people-circle" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.key ? "#007AFF" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>{renderTabContent()}</View>

        {/* Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons
                      name={
                        currentAction === "createTeam"
                          ? "people-circle"
                          : currentAction === "createTag"
                          ? "pricetag"
                          : currentAction === "createAchievement"
                          ? "trophy"
                          : "add-circle"
                      }
                      size={24}
                      color="#007AFF"
                    />
                  </View>
                  <Text style={styles.modalTitle}>
                    {currentAction === "createTeam"
                      ? "Create New Team"
                      : currentAction === "createTag"
                      ? "Create New Tag"
                      : currentAction === "createAchievement"
                      ? "Create Achievement"
                      : "Create"}
                  </Text>
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.cancelButtonContainer}
                  >
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    style={[
                      styles.saveButtonContainer,
                      loading && styles.saveButtonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.saveButton,
                        loading && styles.saveButtonTextDisabled,
                      ]}
                    >
                      {loading ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {renderModalContent()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F3F8",
  },
  backgroundImage: {
    opacity: 0.1,
    resizeMode: "cover",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1D1D1F",
    letterSpacing: 0.5,
  },
  refreshButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "600",
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    backgroundColor: "#F2F3F8",
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1D1D1F",
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  subSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  // Dashboard Styles
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    width: "48%",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "800",
    marginVertical: 8,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  quickActionsSection: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: "48%",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  // User Styles
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1D1D1F",
    fontWeight: "500",
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  basicBadge: {
    backgroundColor: "#E8F5E8",
  },
  team_leaderBadge: {
    backgroundColor: "#FFF3E0",
  },
  adminBadge: {
    backgroundColor: "#FFEBEE",
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  userStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 15,
  },
  userStat: {
    fontSize: 12,
    color: "#999",
  },
  userActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  promoteBtn: {
    backgroundColor: "#34C759",
  },
  editBtn: {
    backgroundColor: "#007AFF",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  // Team Styles
  teamCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#E8F5E8",
  },
  inactiveBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
  },
  teamDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  teamStats: {
    gap: 8,
  },
  teamStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  teamStatText: {
    fontSize: 12,
    color: "#666",
  },
  teamCreated: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    minHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelButtonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButton: {
    color: "#8E8E93",
    fontSize: 17,
    fontWeight: "500",
  },
  saveButtonContainer: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: "#C7C7CC",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButton: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  saveButtonTextDisabled: {
    color: "#8E8E93",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    color: "#1A1A1A",
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Enhanced Modal Form Styles
  modalForm: {
    flex: 1,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  inputIconContainer: {
    position: "absolute",
    left: 16,
    top: 16,
    zIndex: 1,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  modalInputWithIcon: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingLeft: 52,
    paddingRight: 16,
    paddingVertical: 16,
    fontSize: 17,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    color: "#1A1A1A",
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 16,
  },
  // User Info Card Styles
  userInfoCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfoLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginLeft: 12,
    marginRight: 8,
    flex: 0,
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
  },
  // Enhanced Role Option Styles
  roleOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  roleOptionsContainer: {
    marginTop: 8,
  },
  roleOption: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedRoleOption: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  roleOptionText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
    marginLeft: 12,
  },
  selectedRoleOptionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Team Management Section Styles
  teamSearchSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  // Action Button Styles
  createBtn: {
    backgroundColor: "#28a745",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 40,
  },
  // Team Header Actions
  teamHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
