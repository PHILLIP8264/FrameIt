import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { adminStyles } from "../../styles";

interface AdminDashboardProps {
  stats: any;
  adminAlerts: any[];
  systemHealth: any;
  performanceMetrics: any;
  retentionMetrics: any;
  recentActivity: any[];
  securityAlerts: any[];
  blockedIps: any[];
  refreshing: boolean;
  onRefresh: () => void;
  onQuickAction: (action: string) => void;
  onSetActiveTab: (tab: string) => void;
  onDismissAlert: (alertId: string) => void;
  getAlertIcon: (type: string) => string;
  getAlertColor: (type: string) => string;
}

export default function AdminDashboard({
  stats,
  adminAlerts,
  systemHealth,
  performanceMetrics,
  retentionMetrics,
  recentActivity,
  securityAlerts,
  blockedIps,
  refreshing,
  onRefresh,
  onQuickAction,
  onSetActiveTab,
  onDismissAlert,
  getAlertIcon,
  getAlertColor,
}: AdminDashboardProps) {
  return (
    <ScrollView
      style={adminStyles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* System Alerts */}
      {adminAlerts.length > 0 && (
        <View style={adminStyles.alertsSection}>
          <Text style={adminStyles.sectionTitle}>System Alerts</Text>
          {adminAlerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                adminStyles.alertCard,
                { borderLeftColor: getAlertColor(alert.type) },
              ]}
            >
              <View style={adminStyles.alertHeader}>
                <View style={adminStyles.alertTitleRow}>
                  <Ionicons
                    name={getAlertIcon(alert.type) as any}
                    size={20}
                    color={getAlertColor(alert.type)}
                  />
                  <Text
                    style={[
                      adminStyles.alertTitle,
                      { color: getAlertColor(alert.type) },
                    ]}
                  >
                    {alert.title}
                  </Text>
                </View>
                <TouchableOpacity onLongPress={() => onDismissAlert(alert.id)}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={adminStyles.alertMessage}>{alert.message}</Text>
              <Text style={adminStyles.alertTime}>
                {alert.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Key Metrics */}
      <View style={adminStyles.metricsSection}>
        <Text style={adminStyles.sectionTitle}>Key Metrics</Text>
        <View style={adminStyles.metricsGrid}>
          <LinearGradient
            colors={["#137CD8", "#1160b8"]}
            style={adminStyles.metricCard}
          >
            <Text style={adminStyles.metricValue}>{stats.totalUsers}</Text>
            <Text style={adminStyles.metricLabel}>Total Users</Text>
          </LinearGradient>
          <LinearGradient
            colors={["#D61A66", "#b8154e"]}
            style={adminStyles.metricCard}
          >
            <Text style={adminStyles.metricValue}>{stats.activeUsers}</Text>
            <Text style={adminStyles.metricLabel}>Active Users</Text>
          </LinearGradient>
          <LinearGradient
            colors={["#FF9800", "#F57C00"]}
            style={adminStyles.metricCard}
          >
            <Text style={adminStyles.metricValue}>{stats.totalQuests}</Text>
            <Text style={adminStyles.metricLabel}>Total Quests</Text>
          </LinearGradient>
          <LinearGradient
            colors={["#9C27B0", "#7B1FA2"]}
            style={adminStyles.metricCard}
          >
            <Text style={adminStyles.metricValue}>{stats.totalTeams}</Text>
            <Text style={adminStyles.metricLabel}>Teams</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Engagement Analytics */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>Engagement Analytics</Text>
        <View style={adminStyles.analyticsCard}>
          <View style={adminStyles.analyticsItem}>
            <Text style={adminStyles.analyticsValue}>
              {stats.dailyActiveUsers}
            </Text>
            <Text style={adminStyles.analyticsLabel}>Daily Active Users</Text>
          </View>
          <View style={adminStyles.analyticsItem}>
            <Text style={adminStyles.analyticsValue}>
              {stats.weeklyActiveUsers}
            </Text>
            <Text style={adminStyles.analyticsLabel}>Weekly Active Users</Text>
          </View>
          <View style={adminStyles.analyticsItem}>
            <Text style={adminStyles.analyticsValue}>
              {stats.pendingModeration}
            </Text>
            <Text style={adminStyles.analyticsLabel}>Pending Moderation</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={adminStyles.quickActionsSection}>
        <Text style={adminStyles.sectionTitle}>Quick Actions</Text>
        <View style={adminStyles.quickActionsGrid}>
          <TouchableOpacity
            style={[
              adminStyles.quickActionButton,
              { backgroundColor: "#137CD8" },
            ]}
            onLongPress={() => onSetActiveTab("users")}
          >
            <Ionicons name="people" size={24} color="white" />
            <Text style={adminStyles.quickActionText}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              adminStyles.quickActionButton,
              { backgroundColor: "#D61A66" },
            ]}
            onLongPress={() => onSetActiveTab("moderation")}
          >
            <Ionicons name="shield-checkmark" size={24} color="white" />
            <Text style={adminStyles.quickActionText}>Moderation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              adminStyles.quickActionButton,
              { backgroundColor: "#FF9800" },
            ]}
            onLongPress={() => onSetActiveTab("quests")}
          >
            <Ionicons name="map" size={24} color="white" />
            <Text style={adminStyles.quickActionText}>Quest Manager</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              adminStyles.quickActionButton,
              { backgroundColor: "#9C27B0" },
            ]}
            onLongPress={() => onSetActiveTab("analytics")}
          >
            <Ionicons name="analytics" size={24} color="white" />
            <Text style={adminStyles.quickActionText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={adminStyles.recentActivitySection}>
        <Text style={adminStyles.sectionTitle}>Recent Activity</Text>
        <View style={adminStyles.activityCard}>
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((activity, index) => (
              <View key={index} style={adminStyles.activityItem}>
                <Ionicons
                  name={
                    activity.action.includes("user")
                      ? "person"
                      : activity.action.includes("quest")
                      ? "map"
                      : "settings"
                  }
                  size={20}
                  color="#137CD8"
                />
                <View style={adminStyles.activityContent}>
                  <Text style={adminStyles.activityText}>
                    {activity.action}
                  </Text>
                  <Text style={adminStyles.activityTime}>
                    {new Date(
                      activity.timestamp?.seconds * 1000
                    ).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <>
              <View style={adminStyles.activityItem}>
                <Ionicons name="person-add" size={20} color="#137CD8" />
                <View style={adminStyles.activityContent}>
                  <Text style={adminStyles.activityText}>
                    New user registered
                  </Text>
                  <Text style={adminStyles.activityTime}>2 minutes ago</Text>
                </View>
              </View>
              <View style={adminStyles.activityItem}>
                <Ionicons name="trophy" size={20} color="#D61A66" />
                <View style={adminStyles.activityContent}>
                  <Text style={adminStyles.activityText}>
                    Quest "City Explorer" completed
                  </Text>
                  <Text style={adminStyles.activityTime}>15 minutes ago</Text>
                </View>
              </View>
              <View style={adminStyles.activityItem}>
                <Ionicons name="flag" size={20} color="#F44336" />
                <View style={adminStyles.activityContent}>
                  <Text style={adminStyles.activityText}>
                    {stats.pendingModeration} items need moderation
                  </Text>
                  <Text style={adminStyles.activityTime}>1 hour ago</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* System Health Monitor */}
      <View style={adminStyles.systemHealthSection}>
        <View style={adminStyles.sectionHeader}>
          <Text style={adminStyles.sectionTitle}>System Health</Text>
          <TouchableOpacity
            style={adminStyles.viewAllButton}
            onLongPress={() => onQuickAction("view-health")}
          >
            <Text style={adminStyles.viewAllText}>Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#137CD8" />
          </TouchableOpacity>
        </View>
        <View style={adminStyles.healthCard}>
          <TouchableOpacity style={adminStyles.healthItem}>
            <View
              style={[
                adminStyles.healthIndicator,
                {
                  backgroundColor:
                    systemHealth.status === "healthy" ? "#4CAF50" : "#F44336",
                },
              ]}
            />
            <Text style={adminStyles.healthLabel}>Status</Text>
            <Text style={adminStyles.healthValue}>
              {systemHealth.status || "loading"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.healthItem}>
            <View
              style={[
                adminStyles.healthIndicator,
                {
                  backgroundColor:
                    systemHealth.uptime > 99 ? "#4CAF50" : "#FF9800",
                },
              ]}
            />
            <Text style={adminStyles.healthLabel}>Uptime</Text>
            <Text style={adminStyles.healthValue}>
              {systemHealth.uptime.toFixed(1)}%
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.healthItem}>
            <View
              style={[
                adminStyles.healthIndicator,
                {
                  backgroundColor:
                    systemHealth.responseTime < 500 ? "#4CAF50" : "#F44336",
                },
              ]}
            />
            <Text style={adminStyles.healthLabel}>Response</Text>
            <Text style={adminStyles.healthValue}>
              {systemHealth.responseTime}ms
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.healthItem}>
            <View
              style={[
                adminStyles.healthIndicator,
                {
                  backgroundColor:
                    systemHealth.errorRate < 1 ? "#4CAF50" : "#F44336",
                },
              ]}
            />
            <Text style={adminStyles.healthLabel}>Error Rate</Text>
            <Text style={adminStyles.healthValue}>
              {systemHealth.errorRate.toFixed(1)}%
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={adminStyles.performanceSection}>
        <View style={adminStyles.sectionHeader}>
          <Text style={adminStyles.sectionTitle}>Performance Metrics</Text>
          <TouchableOpacity
            style={adminStyles.viewAllButton}
            onLongPress={() => onQuickAction("performance-details")}
          >
            <Text style={adminStyles.viewAllText}>Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#137CD8" />
          </TouchableOpacity>
        </View>
        <View style={adminStyles.performanceGrid}>
          <TouchableOpacity style={adminStyles.performanceCard}>
            <Ionicons name="eye" size={24} color="#137CD8" />
            <Text style={adminStyles.performanceValue}>
              {performanceMetrics.pageViews.toLocaleString()}
            </Text>
            <Text style={adminStyles.performanceLabel}>Page Views</Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.performanceCard}>
            <Ionicons name="people" size={24} color="#4CAF50" />
            <Text style={adminStyles.performanceValue}>
              {performanceMetrics.uniqueVisitors.toLocaleString()}
            </Text>
            <Text style={adminStyles.performanceLabel}>Unique Visitors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.performanceCard}>
            <Ionicons name="trending-down" size={24} color="#FF9800" />
            <Text style={adminStyles.performanceValue}>
              {performanceMetrics.bounceRate.toFixed(1)}%
            </Text>
            <Text style={adminStyles.performanceLabel}>Bounce Rate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.performanceCard}>
            <Ionicons name="time" size={24} color="#9C27B0" />
            <Text style={adminStyles.performanceValue}>
              {performanceMetrics.avgSessionDuration.toFixed(1)}m
            </Text>
            <Text style={adminStyles.performanceLabel}>Avg Session</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Retention Metrics */}
      <View style={adminStyles.retentionSection}>
        <Text style={adminStyles.sectionTitle}>User Retention</Text>
        <View style={adminStyles.retentionBars}>
          <View style={adminStyles.retentionBar}>
            <Text style={adminStyles.retentionLabel}>Day 1</Text>
            <View style={adminStyles.retentionBarContainer}>
              <View
                style={[
                  adminStyles.retentionBarFill,
                  { width: `${retentionMetrics.day1}%` },
                ]}
              />
            </View>
            <Text style={adminStyles.retentionPercent}>
              {retentionMetrics.day1.toFixed(1)}%
            </Text>
          </View>
          <View style={adminStyles.retentionBar}>
            <Text style={adminStyles.retentionLabel}>Day 7</Text>
            <View style={adminStyles.retentionBarContainer}>
              <View
                style={[
                  adminStyles.retentionBarFill,
                  { width: `${retentionMetrics.day7}%` },
                ]}
              />
            </View>
            <Text style={adminStyles.retentionPercent}>
              {retentionMetrics.day7.toFixed(1)}%
            </Text>
          </View>
          <View style={adminStyles.retentionBar}>
            <Text style={adminStyles.retentionLabel}>Day 30</Text>
            <View style={adminStyles.retentionBarContainer}>
              <View
                style={[
                  adminStyles.retentionBarFill,
                  { width: `${retentionMetrics.day30}%` },
                ]}
              />
            </View>
            <Text style={adminStyles.retentionPercent}>
              {retentionMetrics.day30.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Security Overview */}
      <View style={adminStyles.securityOverviewSection}>
        <View style={adminStyles.sectionHeader}>
          <Text style={adminStyles.sectionTitle}>Security Overview</Text>
          <TouchableOpacity
            style={adminStyles.viewAllButton}
            onLongPress={() => onSetActiveTab("security")}
          >
            <Text style={adminStyles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={16} color="#137CD8" />
          </TouchableOpacity>
        </View>
        <View style={adminStyles.securityGrid}>
          <View style={adminStyles.securityCard}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={adminStyles.securityValue}>
              {
                securityAlerts.filter((alert) => alert.severity === "low")
                  .length
              }
            </Text>
            <Text style={adminStyles.securityLabel}>Low Alerts</Text>
          </View>
          <View style={adminStyles.securityCard}>
            <Ionicons name="warning" size={20} color="#FF9800" />
            <Text style={adminStyles.securityValue}>
              {
                securityAlerts.filter((alert) => alert.severity === "medium")
                  .length
              }
            </Text>
            <Text style={adminStyles.securityLabel}>Medium Alerts</Text>
          </View>
          <View style={adminStyles.securityCard}>
            <Ionicons name="alert" size={20} color="#F44336" />
            <Text style={adminStyles.securityValue}>
              {
                securityAlerts.filter((alert) => alert.severity === "high")
                  .length
              }
            </Text>
            <Text style={adminStyles.securityLabel}>High Alerts</Text>
          </View>
          <View style={adminStyles.securityCard}>
            <Ionicons name="ban" size={20} color="#666" />
            <Text style={adminStyles.securityValue}>{blockedIps.length}</Text>
            <Text style={adminStyles.securityLabel}>Blocked IPs</Text>
          </View>
        </View>
      </View>

      {/* Quick Dashboard Actions */}
      <View style={adminStyles.dashboardActionsSection}>
        <Text style={adminStyles.sectionTitle}>Quick Actions</Text>
        <View style={adminStyles.dashboardActionsGrid}>
          <TouchableOpacity
            style={[
              adminStyles.dashboardActionButton,
              { backgroundColor: "#4CAF50" },
            ]}
            onLongPress={() => onQuickAction("refresh-data")}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={adminStyles.dashboardActionText}>Refresh Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              adminStyles.dashboardActionButton,
              { backgroundColor: "#137CD8" },
            ]}
            onLongPress={() => onQuickAction("export-data")}
          >
            <Ionicons name="download" size={20} color="white" />
            <Text style={adminStyles.dashboardActionText}>Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              adminStyles.dashboardActionButton,
              { backgroundColor: "#FF9800" },
            ]}
            onLongPress={() => onSetActiveTab("analytics")}
          >
            <Ionicons name="analytics" size={20} color="white" />
            <Text style={adminStyles.dashboardActionText}>View Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              adminStyles.dashboardActionButton,
              { backgroundColor: "#D61A66" },
            ]}
            onLongPress={() => onSetActiveTab("security")}
          >
            <Ionicons name="shield" size={20} color="white" />
            <Text style={adminStyles.dashboardActionText}>Security Center</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Real-time Status Indicator */}
      <View style={adminStyles.statusIndicator}>
        <View style={adminStyles.statusDot} />
        <Text style={adminStyles.statusText}>
          Live data • Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>
    </ScrollView>
  );
}
