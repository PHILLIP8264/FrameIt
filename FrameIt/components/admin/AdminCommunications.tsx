import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminStyles } from "../../styles/adminStyles";

interface AdminCommunicationsProps {
  stats: any;
  onOpenModal: (type: string) => void;
}

export default function AdminCommunications({
  stats,
  onOpenModal,
}: AdminCommunicationsProps) {
  return (
    <ScrollView style={adminStyles.moduleContainer}>
      <Text style={adminStyles.moduleTitle}>Communications Center</Text>
      <Text style={adminStyles.moduleSubtitle}>
        Manage announcements, push notifications, email campaigns, and system
        alerts
      </Text>

      {/* Quick Actions */}
      <View style={adminStyles.commActionsGrid}>
        <TouchableOpacity
          style={[adminStyles.commActionCard, { backgroundColor: "#4CAF50" }]}
          onLongPress={() => onOpenModal("announcement")}
        >
          <Ionicons name="megaphone" size={30} color="white" />
          <Text style={adminStyles.commActionText}>Send Announcement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[adminStyles.commActionCard, { backgroundColor: "#137CD8" }]}
          onLongPress={() => onOpenModal("notification")}
        >
          <Ionicons name="notifications" size={30} color="white" />
          <Text style={adminStyles.commActionText}>Push Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[adminStyles.commActionCard, { backgroundColor: "#FF9800" }]}
          onLongPress={() => onOpenModal("email")}
        >
          <Ionicons name="mail" size={30} color="white" />
          <Text style={adminStyles.commActionText}>Email Campaign</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[adminStyles.commActionCard, { backgroundColor: "#D61A66" }]}
          onLongPress={() => onOpenModal("alert")}
        >
          <Ionicons name="warning" size={30} color="white" />
          <Text style={adminStyles.commActionText}>System Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Communication Stats */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>Communication Statistics</Text>
        <View style={adminStyles.statsGrid}>
          <View style={adminStyles.statCard}>
            <Ionicons name="send" size={24} color="#4CAF50" />
            <Text style={adminStyles.statValue}>127</Text>
            <Text style={adminStyles.statLabel}>Messages Sent</Text>
            <Text style={adminStyles.statTrend}>This Month</Text>
          </View>

          <View style={adminStyles.statCard}>
            <Ionicons name="eye" size={24} color="#137CD8" />
            <Text style={adminStyles.statValue}>94%</Text>
            <Text style={adminStyles.statLabel}>Open Rate</Text>
            <Text style={adminStyles.statTrend}>Avg 30 days</Text>
          </View>

          <View style={adminStyles.statCard}>
            <Ionicons name="finger-print" size={24} color="#FF9800" />
            <Text style={adminStyles.statValue}>78%</Text>
            <Text style={adminStyles.statLabel}>Click Rate</Text>
            <Text style={adminStyles.statTrend}>Avg 30 days</Text>
          </View>

          <View style={adminStyles.statCard}>
            <Ionicons name="people" size={24} color="#D61A66" />
            <Text style={adminStyles.statValue}>{stats.totalUsers}</Text>
            <Text style={adminStyles.statLabel}>Total Reach</Text>
            <Text style={adminStyles.statTrend}>Active Users</Text>
          </View>
        </View>
      </View>

      {/* Recent Communications */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>Recent Communications</Text>
        <View style={adminStyles.communicationHistory}>
          <View style={adminStyles.historyItem}>
            <View
              style={[adminStyles.historyIcon, { backgroundColor: "#4CAF50" }]}
            >
              <Ionicons name="megaphone" size={16} color="white" />
            </View>
            <View style={adminStyles.historyContent}>
              <Text style={adminStyles.historyTitle}>New Quest Alert</Text>
              <Text style={adminStyles.historySubtitle}>
                Sent to 156 active users • 2 hours ago
              </Text>
              <Text style={adminStyles.historyStats}>
                92% opened, 67% clicked
              </Text>
            </View>
            <TouchableOpacity style={adminStyles.historyAction}>
              <Ionicons name="analytics" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={adminStyles.historyItem}>
            <View
              style={[adminStyles.historyIcon, { backgroundColor: "#137CD8" }]}
            >
              <Ionicons name="notifications" size={16} color="white" />
            </View>
            <View style={adminStyles.historyContent}>
              <Text style={adminStyles.historyTitle}>
                Weekly Challenge Reminder
              </Text>
              <Text style={adminStyles.historySubtitle}>
                Sent to 203 users • 1 day ago
              </Text>
              <Text style={adminStyles.historyStats}>
                88% opened, 54% clicked
              </Text>
            </View>
            <TouchableOpacity style={adminStyles.historyAction}>
              <Ionicons name="analytics" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={adminStyles.historyItem}>
            <View
              style={[adminStyles.historyIcon, { backgroundColor: "#FF9800" }]}
            >
              <Ionicons name="mail" size={16} color="white" />
            </View>
            <View style={adminStyles.historyContent}>
              <Text style={adminStyles.historyTitle}>Monthly Newsletter</Text>
              <Text style={adminStyles.historySubtitle}>
                Sent to 248 subscribers • 3 days ago
              </Text>
              <Text style={adminStyles.historyStats}>
                76% opened, 43% clicked
              </Text>
            </View>
            <TouchableOpacity style={adminStyles.historyAction}>
              <Ionicons name="analytics" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Template Library */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>Message Templates</Text>
        <View style={adminStyles.templateGrid}>
          <TouchableOpacity style={adminStyles.templateCard}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={adminStyles.templateTitle}>Achievement Unlock</Text>
            <Text style={adminStyles.templateSubtitle}>
              Congratulate users on milestones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={adminStyles.templateCard}>
            <Ionicons name="map" size={24} color="#4CAF50" />
            <Text style={adminStyles.templateTitle}>New Quest Available</Text>
            <Text style={adminStyles.templateSubtitle}>
              Alert users about new quests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={adminStyles.templateCard}>
            <Ionicons name="people" size={24} color="#137CD8" />
            <Text style={adminStyles.templateTitle}>Team Invitation</Text>
            <Text style={adminStyles.templateSubtitle}>
              Invite users to join teams
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={adminStyles.templateCard}>
            <Ionicons name="time" size={24} color="#FF9800" />
            <Text style={adminStyles.templateTitle}>Event Reminder</Text>
            <Text style={adminStyles.templateSubtitle}>
              Remind about upcoming events
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
