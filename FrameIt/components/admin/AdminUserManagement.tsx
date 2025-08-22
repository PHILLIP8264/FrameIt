import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminStyles } from "../../styles/adminStyles";
import { User } from "../../types/database";

interface AdminUserManagementProps {
  users: User[];
  searchQuery: string;
  selectedUsers: string[];
  onSearchChange: (query: string) => void;
  onUserSelect: (userId: string) => void;
  onUserAction: (action: string, user: User) => void;
  onBulkAction: () => void;
  onViewUserDetails: (user: User) => void;
  getRoleColor: (role: string) => string;
}

export default function AdminUserManagement({
  users,
  searchQuery,
  selectedUsers,
  onSearchChange,
  onUserSelect,
  onUserAction,
  onBulkAction,
  onViewUserDetails,
  getRoleColor,
}: AdminUserManagementProps) {
  const filteredUsers = users.filter(
    (user) =>
      !searchQuery ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={adminStyles.moduleContainer}>
      {/* Search and Bulk Actions */}
      <View style={adminStyles.userManagementHeader}>
        <TextInput
          style={adminStyles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={onSearchChange}
        />

        {selectedUsers.length > 0 && (
          <View style={adminStyles.bulkActionsContainer}>
            <Text style={adminStyles.bulkActionsText}>
              {selectedUsers.length} selected
            </Text>
            <TouchableOpacity
              style={adminStyles.bulkActionButton}
              onLongPress={() => {
                Alert.alert(
                  "Bulk Actions",
                  "Choose action for selected users:",
                  [
                    {
                      text: "Promote to Admin",
                      onPress: () => onBulkAction(),
                    },
                    {
                      text: "Promote to Leader",
                      onPress: () => onBulkAction(),
                    },
                    {
                      text: "Demote to Basic",
                      onPress: () => onBulkAction(),
                    },
                    { text: "Cancel", style: "cancel" },
                  ]
                );
              }}
            >
              <Text style={adminStyles.bulkActionButtonText}>Bulk Actions</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Users List */}
      <ScrollView style={adminStyles.usersList}>
        {filteredUsers.map((user: User) => (
          <View key={user.userId} style={adminStyles.userCard}>
            <TouchableOpacity
              style={adminStyles.userCheckbox}
              onLongPress={() => onUserSelect(user.userId)}
            >
              <Ionicons
                name={
                  selectedUsers.includes(user.userId)
                    ? "checkbox"
                    : "square-outline"
                }
                size={20}
                color="#137CD8"
              />
            </TouchableOpacity>

            <View style={adminStyles.userInfo}>
              <Text style={adminStyles.userName}>{user.displayName}</Text>
              <Text style={adminStyles.userEmail}>{user.email}</Text>
              <View style={adminStyles.userMetrics}>
                <Text style={adminStyles.userMetric}>Level {user.level}</Text>
                <Text style={adminStyles.userMetric}>{user.xp} XP</Text>
                <View
                  style={[
                    adminStyles.roleBadge,
                    { backgroundColor: getRoleColor(user.role) },
                  ]}
                >
                  <Text style={adminStyles.roleBadgeText}>{user.role}</Text>
                </View>
              </View>
            </View>

            <View style={adminStyles.userActions}>
              <TouchableOpacity
                style={adminStyles.userActionButton}
                onLongPress={() => onViewUserDetails(user)}
              >
                <Ionicons name="person-circle" size={24} color="#137CD8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={adminStyles.userActionButton}
                onLongPress={() => {
                  Alert.alert("User Actions", `Manage ${user.displayName}:`, [
                    ...(user.role !== "admin"
                      ? [
                          {
                            text: "Promote to Admin",
                            onPress: () => onUserAction("promote_admin", user),
                          },
                        ]
                      : []),
                    ...(user.role === "basic"
                      ? [
                          {
                            text: "Promote to Leader",
                            onPress: () => onUserAction("promote_leader", user),
                          },
                        ]
                      : []),
                    ...(user.role !== "basic"
                      ? [
                          {
                            text: "Demote to Basic",
                            onPress: () => onUserAction("demote_basic", user),
                          },
                        ]
                      : []),
                    {
                      text: "Suspend User",
                      onPress: () => onUserAction("suspend", user),
                    },
                    { text: "Cancel", style: "cancel" },
                  ]);
                }}
              >
                <Ionicons name="settings" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
