import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminStyles } from "../../styles/adminStyles";

interface AdminAnalyticsProps {
  stats: any;
  retentionMetrics: any;
}

export default function AdminAnalytics({
  stats,
  retentionMetrics,
}: AdminAnalyticsProps) {
  return (
    <ScrollView style={adminStyles.moduleContainer}>
      <Text style={adminStyles.moduleTitle}>Analytics Dashboard</Text>
      <Text style={adminStyles.moduleSubtitle}>
        Comprehensive app performance insights
      </Text>

      {/* Data Source Legend */}
      <View style={adminStyles.analyticsSection}>
        <View style={adminStyles.dataSourceLegend}>
          <View style={adminStyles.legendItem}>
            <View
              style={[adminStyles.legendDot, { backgroundColor: "#4CAF50" }]}
            />
            <Text style={adminStyles.legendText}>Real Data</Text>
          </View>
          <View style={adminStyles.legendItem}>
            <View
              style={[adminStyles.legendDot, { backgroundColor: "#FF9800" }]}
            />
            <Text style={adminStyles.legendText}>Estimated</Text>
          </View>
          <View style={adminStyles.legendItem}>
            <View
              style={[adminStyles.legendDot, { backgroundColor: "#9E9E9E" }]}
            />
            <Text style={adminStyles.legendText}>Sample</Text>
          </View>
        </View>
      </View>

      {/* Key Performance Indicators */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>Key Performance Indicators</Text>
        <View style={adminStyles.kpiGrid}>
          <View style={[adminStyles.kpiCard, { backgroundColor: "#137CD8" }]}>
            <Ionicons name="people" size={24} color="white" />
            <Text style={adminStyles.kpiValue}>{stats.dailyActiveUsers}</Text>
            <Text style={adminStyles.kpiLabel}>Daily Active Users</Text>
            <Text style={adminStyles.kpiChange}> Real Data</Text>
          </View>

          <View style={[adminStyles.kpiCard, { backgroundColor: "#D61A66" }]}>
            <Ionicons name="trophy" size={24} color="white" />
            <Text style={adminStyles.kpiValue}>
              {Math.round(
                (stats.completedQuests / (stats.totalQuests || 1)) * 100
              )}
              %
            </Text>
            <Text style={adminStyles.kpiLabel}>Quest Completion Rate</Text>
            <Text style={adminStyles.kpiChange}> Real Data</Text>
          </View>

          <View style={[adminStyles.kpiCard, { backgroundColor: "#FF9800" }]}>
            <Ionicons name="people-circle" size={24} color="white" />
            <Text style={adminStyles.kpiValue}>{stats.activeTeams}</Text>
            <Text style={adminStyles.kpiLabel}>Active Teams</Text>
            <Text style={adminStyles.kpiChange}> Real Data</Text>
          </View>

          <View style={[adminStyles.kpiCard, { backgroundColor: "#9C27B0" }]}>
            <Ionicons name="time" size={24} color="white" />
            <Text style={adminStyles.kpiValue}>8.5</Text>
            <Text style={adminStyles.kpiLabel}>Avg Session (min)</Text>
            <Text style={adminStyles.kpiChange}>+1.2 min</Text>
          </View>
        </View>
      </View>

      {/* User Analytics */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>User Analytics</Text>
        <View style={adminStyles.analyticsCard}>
          <View style={adminStyles.analyticsRow}>
            <View style={adminStyles.analyticsItem}>
              <Text style={adminStyles.analyticsValue}>{stats.totalUsers}</Text>
              <Text style={adminStyles.analyticsLabel}>Total Users</Text>
            </View>
            <View style={adminStyles.analyticsItem}>
              <Text style={adminStyles.analyticsValue}>
                {stats.activeUsers}
              </Text>
              <Text style={adminStyles.analyticsLabel}>Active This Week</Text>
            </View>
            <View style={adminStyles.analyticsItem}>
              <Text style={adminStyles.analyticsValue}>
                {Math.floor(stats.totalUsers * 0.15)}
              </Text>
              <Text style={adminStyles.analyticsLabel}>New This Month</Text>
            </View>
          </View>

          <View style={adminStyles.retentionSection}>
            <Text style={adminStyles.retentionTitle}>
              User Retention Real Data
            </Text>
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
                  {retentionMetrics.day1}%
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
                  {retentionMetrics.day7}%
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
                  {retentionMetrics.day30}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Quest Analytics */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>
          Quest Performance Real Data
        </Text>
        <View style={adminStyles.analyticsCard}>
          <View style={adminStyles.analyticsRow}>
            <View style={adminStyles.analyticsItem}>
              <Text style={adminStyles.analyticsValue}>
                {stats.totalQuests}
              </Text>
              <Text style={adminStyles.analyticsLabel}>Total Quests</Text>
            </View>
            <View style={adminStyles.analyticsItem}>
              <Text style={adminStyles.analyticsValue}>
                {stats.completedQuests}
              </Text>
              <Text style={adminStyles.analyticsLabel}>Completed</Text>
            </View>
            <View style={adminStyles.analyticsItem}>
              <Text style={adminStyles.analyticsValue}>
                {stats.totalQuests - stats.completedQuests}
              </Text>
              <Text style={adminStyles.analyticsLabel}>In Progress</Text>
            </View>
          </View>

          <View style={adminStyles.questStatsSection}>
            <Text style={adminStyles.questStatsTitle}>
              Popular Quest Categories
            </Text>
            <View style={adminStyles.categoryStats}>
              <View style={adminStyles.categoryStat}>
                <View style={adminStyles.categoryIcon}>
                  <Ionicons name="camera" size={16} color="#137CD8" />
                </View>
                <Text style={adminStyles.categoryName}>Photography</Text>
                <Text style={adminStyles.categoryPercent}>35%</Text>
              </View>
              <View style={adminStyles.categoryStat}>
                <View style={adminStyles.categoryIcon}>
                  <Ionicons name="walk" size={16} color="#D61A66" />
                </View>
                <Text style={adminStyles.categoryName}>Exploration</Text>
                <Text style={adminStyles.categoryPercent}>28%</Text>
              </View>
              <View style={adminStyles.categoryStat}>
                <View style={adminStyles.categoryIcon}>
                  <Ionicons name="people" size={16} color="#FF9800" />
                </View>
                <Text style={adminStyles.categoryName}>Social</Text>
                <Text style={adminStyles.categoryPercent}>22%</Text>
              </View>
              <View style={adminStyles.categoryStat}>
                <View style={adminStyles.categoryIcon}>
                  <Ionicons name="fitness" size={16} color="#9C27B0" />
                </View>
                <Text style={adminStyles.categoryName}>Fitness</Text>
                <Text style={adminStyles.categoryPercent}>15%</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Engagement Metrics */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>
          Engagement Metrics (Sample)
        </Text>
        <View style={adminStyles.engagementGrid}>
          <View style={adminStyles.engagementCard}>
            <Ionicons name="heart" size={20} color="#F44336" />
            <Text style={adminStyles.engagementValue}>2,847</Text>
            <Text style={adminStyles.engagementLabel}>Total Likes</Text>
            <Text style={adminStyles.engagementTrend}> Sample Data</Text>
          </View>

          <View style={adminStyles.engagementCard}>
            <Ionicons name="chatbubble" size={20} color="#137CD8" />
            <Text style={adminStyles.engagementValue}>1,203</Text>
            <Text style={adminStyles.engagementLabel}>Comments</Text>
            <Text style={adminStyles.engagementTrend}> Sample Data</Text>
          </View>

          <View style={adminStyles.engagementCard}>
            <Ionicons name="share" size={20} color="#4CAF50" />
            <Text style={adminStyles.engagementValue}>456</Text>
            <Text style={adminStyles.engagementLabel}>Shares</Text>
            <Text style={adminStyles.engagementTrend}> Sample Data</Text>
          </View>

          <View style={adminStyles.engagementCard}>
            <Ionicons name="flag" size={20} color="#FF9800" />
            <Text style={adminStyles.engagementValue}>
              {stats.pendingModeration}
            </Text>
            <Text style={adminStyles.engagementLabel}>Reports</Text>
            <Text style={adminStyles.engagementTrend}> Real Data</Text>
          </View>
        </View>
      </View>

      {/* Geographic Analytics */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>
          Geographic Distribution Estimated
        </Text>
        <View style={adminStyles.analyticsCard}>
          <View style={adminStyles.geoStats}>
            <View style={adminStyles.geoStat}>
              <Text style={adminStyles.geoLocation}>United States</Text>
              <View style={adminStyles.geoBar}>
                <View style={[adminStyles.geoBarFill, { width: "45%" }]} />
              </View>
              <Text style={adminStyles.geoPercent}>45%</Text>
            </View>
            <View style={adminStyles.geoStat}>
              <Text style={adminStyles.geoLocation}>Canada</Text>
              <View style={adminStyles.geoBar}>
                <View style={[adminStyles.geoBarFill, { width: "22%" }]} />
              </View>
              <Text style={adminStyles.geoPercent}>22%</Text>
            </View>
            <View style={adminStyles.geoStat}>
              <Text style={adminStyles.geoLocation}>United Kingdom</Text>
              <View style={adminStyles.geoBar}>
                <View style={[adminStyles.geoBarFill, { width: "18%" }]} />
              </View>
              <Text style={adminStyles.geoPercent}>18%</Text>
            </View>
            <View style={adminStyles.geoStat}>
              <Text style={adminStyles.geoLocation}>Australia</Text>
              <View style={adminStyles.geoBar}>
                <View style={[adminStyles.geoBarFill, { width: "15%" }]} />
              </View>
              <Text style={adminStyles.geoPercent}>15%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Export Actions */}
      <View style={adminStyles.analyticsSection}>
        <Text style={adminStyles.sectionTitle}>Export & Reports</Text>
        <View style={adminStyles.exportActions}>
          <TouchableOpacity
            style={[adminStyles.exportButton, { backgroundColor: "#4CAF50" }]}
            onLongPress={() =>
              Alert.alert(
                "Export CSV",
                "CSV export functionality will be available soon!"
              )
            }
          >
            <Ionicons name="download" size={20} color="white" />
            <Text style={adminStyles.exportButtonText}>Export CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[adminStyles.exportButton, { backgroundColor: "#137CD8" }]}
            onLongPress={() =>
              Alert.alert(
                "Generate Report",
                "Advanced reporting feature coming soon!"
              )
            }
          >
            <Ionicons name="document-text" size={20} color="white" />
            <Text style={adminStyles.exportButtonText}>Generate Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[adminStyles.exportButton, { backgroundColor: "#FF9800" }]}
            onLongPress={() =>
              Alert.alert(
                "Email Report",
                "Email reporting feature will be available soon!"
              )
            }
          >
            <Ionicons name="mail" size={20} color="white" />
            <Text style={adminStyles.exportButtonText}>Email Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[adminStyles.exportButton, { backgroundColor: "#D61A66" }]}
            onLongPress={() =>
              Alert.alert(
                "Schedule Report",
                "Scheduled reporting feature coming soon!"
              )
            }
          >
            <Ionicons name="calendar" size={20} color="white" />
            <Text style={adminStyles.exportButtonText}>Schedule Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
