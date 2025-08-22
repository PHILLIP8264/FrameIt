import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAdminManagement } from "../hooks/useAdminManagement";
import { StandardHeader } from "../components/shared/StandardHeader";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  commonStyles,
} from "../styles/commonStyles";

import TagManagement from "../components/admin/TagManagement";
import ModerationQueue from "../components/admin/ModerationQueue";
import { QuestManager } from "../components/admin/QuestManager";

import AdminDashboard from "../components/admin/AdminDashboard";
import AdminUserManagement from "../components/admin/AdminUserManagement";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import AdminCommunications from "../components/admin/AdminCommunications";
import AdminSecurity from "../components/admin/AdminSecurity";
import AdminSystemConfig from "../components/admin/AdminSystemConfig";
import CommunicationModal from "../components/admin/CommunicationModal";

const { width: screenWidth } = Dimensions.get("window");

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const adminData = useAdminManagement();

  const {
    loading,
    refreshing,
    onAdminRefresh,
    loadDashboardData,
    stats,
    adminAlerts,
    systemHealth,
    users,
    teams,
    tags,
    achievements,
    communicationModal,
    setCommunicationModal,
    configSettings,
    setConfigSettings,
    retentionMetrics,
    performanceMetrics,
    recentActivity,
    securityAlerts,
    communicationHistory,
    adminLogs,
    failedLogins,
    blockedIps,
    lockedAccounts,
  } = adminData;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const tabs = [
    { id: "dashboard", title: "Dashboard", icon: "home" },
    { id: "users", title: "Users", icon: "people" },
    { id: "analytics", title: "Analytics", icon: "analytics" },
    { id: "communications", title: "Communications", icon: "chatbubbles" },
    { id: "security", title: "Security", icon: "shield" },
    { id: "config", title: "Config", icon: "settings" },
    { id: "tags", title: "Tags", icon: "pricetag" },
    { id: "quests", title: "Quests", icon: "map" },
    { id: "moderation", title: "Moderation", icon: "checkmark-circle" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <AdminDashboard
            stats={stats}
            adminAlerts={adminAlerts}
            systemHealth={systemHealth}
            performanceMetrics={performanceMetrics}
            retentionMetrics={retentionMetrics}
            recentActivity={recentActivity}
            securityAlerts={securityAlerts}
            blockedIps={blockedIps}
            refreshing={refreshing}
            getAlertIcon={adminData.getAlertIcon}
            getAlertColor={adminData.getAlertColor}
            onRefresh={onAdminRefresh}
            onQuickAction={() => {}}
            onSetActiveTab={setActiveTab}
            onDismissAlert={adminData.dismissAlert}
          />
        );
      case "users":
        return (
          <AdminUserManagement
            users={users}
            searchQuery={adminData.searchQuery}
            selectedUsers={adminData.selectedUsers}
            onSearchChange={adminData.setSearchQuery}
            onUserSelect={(userId: string) => {
              const user = users.find((u) => u.userId === userId);
              if (user) adminData.setSelectedUser(user);
            }}
            onUserAction={adminData.handleUserAction}
            onBulkAction={adminData.handleBulkAction}
            onViewUserDetails={() => adminData.setUserModalVisible(true)}
            getRoleColor={adminData.getRoleColor}
          />
        );
      case "analytics":
        return (
          <AdminAnalytics stats={stats} retentionMetrics={retentionMetrics} />
        );
      case "communications":
        return (
          <AdminCommunications
            stats={stats}
            onOpenModal={() => setCommunicationModal(true)}
          />
        );
      case "security":
        return (
          <AdminSecurity
            stats={stats}
            adminLogs={adminLogs}
            securityAlerts={securityAlerts}
            failedLogins={failedLogins}
            blockedIps={blockedIps}
            lockedAccounts={lockedAccounts}
            onSecurityAction={() => {}}
            onPolicyConfiguration={() => {}}
            onSecurityManagement={() => {}}
            onHandleSecurityAlert={() => {}}
          />
        );
      case "config":
        return (
          <AdminSystemConfig
            configSettings={configSettings}
            onUpdateConfigSettings={setConfigSettings}
            onSaveConfiguration={() => {}}
            onResetConfiguration={() => {}}
          />
        );
      case "tags":
        return <TagManagement onClose={() => {}} />;
      case "quests":
        return <QuestManager />;
      case "moderation":
        return <ModerationQueue />;
      default:
        return (
          <AdminDashboard
            stats={stats}
            adminAlerts={adminAlerts}
            systemHealth={systemHealth}
            performanceMetrics={performanceMetrics}
            retentionMetrics={retentionMetrics}
            recentActivity={recentActivity}
            securityAlerts={securityAlerts}
            blockedIps={blockedIps}
            refreshing={refreshing}
            getAlertIcon={adminData.getAlertIcon}
            getAlertColor={adminData.getAlertColor}
            onRefresh={onAdminRefresh}
            onQuickAction={() => {}}
            onSetActiveTab={setActiveTab}
            onDismissAlert={adminData.dismissAlert}
          />
        );
    }
  };

  const getTabColor = (tabId: string) => {
    return activeTab === tabId ? colors.primary : colors.textSecondary;
  };

  const getTabBackgroundColor = (tabId: string) => {
    return activeTab === tabId ? colors.primaryLight + "20" : "transparent";
  };

  return (
    <SafeAreaView style={commonStyles.safeAreaContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <StandardHeader
        title="Admin Panel"
        subtitle="System Management"
        rightComponent={
          <TouchableOpacity
            style={[
              commonStyles.backButton,
              { backgroundColor: colors.primary },
            ]}
            onLongPress={onAdminRefresh}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={colors.surface}
              style={refreshing ? { opacity: 0.5 } : {}}
            />
          </TouchableOpacity>
        }
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                { backgroundColor: getTabBackgroundColor(tab.id) },
              ]}
              onLongPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={getTabColor(tab.id)}
              />
              <Text style={[styles.tabText, { color: getTabColor(tab.id) }]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Area */}
      <View style={commonStyles.flex1}>
        <ScrollView
          style={commonStyles.flex1}
          contentContainerStyle={commonStyles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onAdminRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
        </ScrollView>
      </View>

      {/* Communication Modal */}
      <CommunicationModal
        visible={communicationModal}
        onClose={() => setCommunicationModal(false)}
        messageTitle={adminData.messageTitle}
        messageContent={adminData.messageContent}
        targetAudience={adminData.targetAudience}
        communicationType={adminData.communicationType}
        scheduledDate={adminData.scheduledDate}
        stats={stats}
        onTitleChange={adminData.setMessageTitle}
        onContentChange={adminData.setMessageContent}
        onAudienceChange={(audience: string) =>
          adminData.setTargetAudience(
            audience as "teams" | "active" | "all" | "specific"
          )
        }
        onScheduleChange={adminData.setScheduledDate}
        onSend={async () => {
          const success = await adminData.sendCommunication(
            adminData.communicationType,
            adminData.messageTitle,
            adminData.messageContent,
            adminData.targetAudience,
            adminData.scheduledDate
          );
          if (success) {
            setCommunicationModal(false);
            adminData.setMessageTitle("");
            adminData.setMessageContent("");
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  tabScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    minWidth: 120,
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    ...typography.subtitle2,
    fontWeight: "600",
  },
});
