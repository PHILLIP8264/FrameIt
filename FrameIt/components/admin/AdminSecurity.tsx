import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminStyles } from "../../styles/adminStyles";

interface AdminSecurityProps {
  stats: any;
  securityAlerts: any[];
  blockedIps: any[];
  failedLogins: any[];
  lockedAccounts: any[];
  adminLogs: any[];
  onSecurityAction: (action: string) => void;
  onPolicyConfiguration: (type: string) => void;
  onSecurityManagement: (type: string) => void;
  onHandleSecurityAlert: (alertId: string, action: string) => void;
}

export default function AdminSecurity({
  stats,
  securityAlerts,
  blockedIps,
  failedLogins,
  lockedAccounts,
  adminLogs,
  onSecurityAction,
  onPolicyConfiguration,
  onSecurityManagement,
  onHandleSecurityAlert,
}: AdminSecurityProps) {
  return (
    <ScrollView style={adminStyles.moduleContainer}>
      <Text style={adminStyles.moduleTitle}>Security & Audit</Text>
      <Text style={adminStyles.moduleSubtitle}>
        Monitor system security, audit logs, and manage security policies
      </Text>

      {/* Security Status */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}>🛡️ Security Status</Text>

        <View style={adminStyles.securityStatusGrid}>
          <View style={adminStyles.securityStatusCard}>
            <Ionicons name="shield-checkmark" size={30} color="#4CAF50" />
            <Text style={adminStyles.securityStatusTitle}>System Status</Text>
            <Text style={adminStyles.securityStatusValue}>Secure</Text>
          </View>

          <View style={adminStyles.securityStatusCard}>
            <Ionicons name="time" size={30} color="#FF9500" />
            <Text style={adminStyles.securityStatusTitle}>Failed Logins</Text>
            <Text style={adminStyles.securityStatusValue}>
              {failedLogins.length} Today
            </Text>
          </View>

          <View style={adminStyles.securityStatusCard}>
            <Ionicons name="people" size={30} color="#137CD8" />
            <Text style={adminStyles.securityStatusTitle}>Active Sessions</Text>
            <Text style={adminStyles.securityStatusValue}>
              {stats.activeUsers}
            </Text>
          </View>

          <View style={adminStyles.securityStatusCard}>
            <Ionicons name="warning" size={30} color="#F44336" />
            <Text style={adminStyles.securityStatusTitle}>Threats Blocked</Text>
            <Text style={adminStyles.securityStatusValue}>
              {blockedIps.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Security Alerts */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}>🚨 Security Alerts</Text>

        <View style={adminStyles.alertsList}>
          {securityAlerts.map((alert) => (
            <View key={alert.id} style={adminStyles.securityAlertCard}>
              <View style={adminStyles.securityAlertIcon}>
                <Ionicons
                  name={
                    alert.severity === "high"
                      ? "warning"
                      : alert.severity === "medium"
                      ? "alert"
                      : "shield-checkmark"
                  }
                  size={20}
                  color={
                    alert.severity === "high"
                      ? "#F44336"
                      : alert.severity === "medium"
                      ? "#FF9500"
                      : "#4CAF50"
                  }
                />
              </View>
              <View style={adminStyles.alertContent}>
                <Text style={adminStyles.securityAlertTitle}>
                  {alert.title}
                </Text>
                <Text style={adminStyles.alertDescription}>
                  {alert.description}
                </Text>
                <Text style={adminStyles.securityAlertTime}>
                  {new Date(alert.timestamp.seconds * 1000).toLocaleString()}
                </Text>
              </View>
              {alert.severity !== "low" && (
                <TouchableOpacity
                  style={adminStyles.alertAction}
                  onLongPress={() =>
                    onHandleSecurityAlert(alert.id, "investigate")
                  }
                >
                  <Text style={adminStyles.alertActionText}>Investigate</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {securityAlerts.length === 0 && (
            <View style={adminStyles.securityAlertCard}>
              <View style={adminStyles.securityAlertIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
              </View>
              <View style={adminStyles.alertContent}>
                <Text style={adminStyles.securityAlertTitle}>
                  System Normal
                </Text>
                <Text style={adminStyles.alertDescription}>
                  No security threats detected in the last 24 hours
                </Text>
                <Text style={adminStyles.securityAlertTime}>
                  Last checked: {new Date().toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Security Policies */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}> Security Policies</Text>

        <View style={adminStyles.policyGrid}>
          <View style={adminStyles.policyCard}>
            <Text style={adminStyles.policyTitle}>Password Policy</Text>
            <Text style={adminStyles.policyStatus}>✓ Enabled</Text>
            <Text style={adminStyles.policyDescription}>
              Min 8 chars, special chars required
            </Text>
            <TouchableOpacity
              style={adminStyles.policyButton}
              onLongPress={() => onPolicyConfiguration("password")}
            >
              <Text style={adminStyles.policyButtonText}>Configure</Text>
            </TouchableOpacity>
          </View>

          <View style={adminStyles.policyCard}>
            <Text style={adminStyles.policyTitle}>Account Lockout</Text>
            <Text style={adminStyles.policyStatus}>✓ Enabled</Text>
            <Text style={adminStyles.policyDescription}>
              Lock after 5 failed attempts
            </Text>
            <TouchableOpacity
              style={adminStyles.policyButton}
              onLongPress={() => onPolicyConfiguration("lockout")}
            >
              <Text style={adminStyles.policyButtonText}>Configure</Text>
            </TouchableOpacity>
          </View>

          <View style={adminStyles.policyCard}>
            <Text style={adminStyles.policyTitle}>Session Timeout</Text>
            <Text style={adminStyles.policyStatus}>✓ Enabled</Text>
            <Text style={adminStyles.policyDescription}>
              Auto logout after 30 minutes
            </Text>
            <TouchableOpacity
              style={adminStyles.policyButton}
              onLongPress={() => onPolicyConfiguration("session")}
            >
              <Text style={adminStyles.policyButtonText}>Configure</Text>
            </TouchableOpacity>
          </View>

          <View style={adminStyles.policyCard}>
            <Text style={adminStyles.policyTitle}>IP Whitelist</Text>
            <Text style={[adminStyles.policyStatus, { color: "#FF9500" }]}>
              Disabled
            </Text>
            <Text style={adminStyles.policyDescription}>
              Allow admin access from specific IPs
            </Text>
            <TouchableOpacity
              style={adminStyles.policyButton}
              onLongPress={() => onPolicyConfiguration("ip-whitelist")}
            >
              <Text style={adminStyles.policyButtonText}>Enable</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* User Security Management */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}> User Security</Text>

        <View style={adminStyles.userSecurityActions}>
          <TouchableOpacity
            style={adminStyles.securityManagementButton}
            onLongPress={() => onSecurityManagement("locked-accounts")}
          >
            <Ionicons name="lock-closed" size={20} color="#137CD8" />
            <Text style={adminStyles.securityManagementText}>
              View Locked Accounts
            </Text>
            <Text style={adminStyles.securityBadge}>
              {lockedAccounts.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={adminStyles.securityManagementButton}
            onLongPress={() => onSecurityManagement("suspicious-activity")}
          >
            <Ionicons name="eye" size={20} color="#137CD8" />
            <Text style={adminStyles.securityManagementText}>
              Suspicious Activity
            </Text>
            <Text style={adminStyles.securityBadge}>
              {
                securityAlerts.filter((alert) => alert.severity === "high")
                  .length
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={adminStyles.securityManagementButton}
            onLongPress={() => onSecurityManagement("2fa")}
          >
            <Ionicons name="shield" size={20} color="#137CD8" />
            <Text style={adminStyles.securityManagementText}>
              2FA Management
            </Text>
            <Text style={adminStyles.securityBadge}>
              {Math.round(stats.totalUsers * 0.7)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={adminStyles.securityManagementButton}
            onLongPress={() => onSecurityManagement("blocked-ips")}
          >
            <Ionicons name="ban" size={20} color="#137CD8" />
            <Text style={adminStyles.securityManagementText}>Blocked IPs</Text>
            <Text style={adminStyles.securityBadge}>{blockedIps.length}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Actions Log */}
      <View style={adminStyles.configSection}>
        <View style={adminStyles.logHeader}>
          <Text style={adminStyles.configSectionTitle}>Admin Activity Log</Text>
          <View style={adminStyles.logControls}>
            <TouchableOpacity style={adminStyles.logFilterButton}>
              <Ionicons name="filter" size={16} color="#137CD8" />
              <Text style={adminStyles.logFilterText}>Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={adminStyles.refreshButton}>
              <Ionicons name="refresh" size={20} color="#137CD8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={adminStyles.logContainer}>
          {adminLogs.length > 0 ? (
            adminLogs.slice(0, 10).map((log, index) => (
              <View key={index} style={adminStyles.logEntry}>
                <View style={adminStyles.logInfo}>
                  <Text style={adminStyles.logAction}>{log.action}</Text>
                  <Text style={adminStyles.logDetails}>
                    {log.details
                      ? JSON.stringify(log.details).substring(0, 50) + "..."
                      : "No details"}
                  </Text>
                  <Text style={adminStyles.logTimestamp}>
                    {log.timestamp
                      ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                      : "Recent"}
                  </Text>
                </View>
                <View style={adminStyles.logStatus}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
              </View>
            ))
          ) : (
            <View style={adminStyles.emptyLogState}>
              <Ionicons name="document-text" size={40} color="#666" />
              <Text style={adminStyles.emptyLogText}>
                No admin actions logged yet
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* System Health */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}> System Health</Text>

        <View style={adminStyles.healthMetrics}>
          <View style={adminStyles.healthMetric}>
            <Text style={adminStyles.healthLabel}>Uptime</Text>
            <Text style={adminStyles.healthValue}>99.9%</Text>
          </View>
          <View style={adminStyles.healthMetric}>
            <Text style={adminStyles.healthLabel}>Response Time</Text>
            <Text style={adminStyles.healthValue}>120ms</Text>
          </View>
          <View style={adminStyles.healthMetric}>
            <Text style={adminStyles.healthLabel}>Error Rate</Text>
            <Text style={adminStyles.healthValue}>0.1%</Text>
          </View>
          <View style={adminStyles.healthMetric}>
            <Text style={adminStyles.healthLabel}>Active Connections</Text>
            <Text style={adminStyles.healthValue}>1,250</Text>
          </View>
          <View style={adminStyles.healthMetric}>
            <Text style={adminStyles.healthLabel}>Database Health</Text>
            <Text style={[adminStyles.healthValue, { color: "#4CAF50" }]}>
              Optimal
            </Text>
          </View>
          <View style={adminStyles.healthMetric}>
            <Text style={adminStyles.healthLabel}>Storage Usage</Text>
            <Text style={adminStyles.healthValue}>78%</Text>
          </View>
        </View>
      </View>

      {/* Emergency Security Actions */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}>🚨 Emergency Actions</Text>

        <View style={adminStyles.emergencyActionsGrid}>
          <TouchableOpacity
            style={[
              adminStyles.securityActionButton,
              { backgroundColor: "#D61A66" },
            ]}
            onLongPress={() => onSecurityAction("force-logout")}
          >
            <Ionicons name="log-out" size={20} color="white" />
            <Text style={adminStyles.securityActionText}>
              Force Global Logout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              adminStyles.securityActionButton,
              { backgroundColor: "#9C27B0" },
            ]}
            onLongPress={() => onSecurityAction("maintenance-mode")}
          >
            <Ionicons name="construct" size={20} color="white" />
            <Text style={adminStyles.securityActionText}>Maintenance Mode</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Export and Compliance */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}>
          Compliance & Reporting
        </Text>

        <View style={adminStyles.complianceActions}>
          <TouchableOpacity
            style={adminStyles.securityActionButton}
            onLongPress={() => onSecurityAction("export-audit")}
          >
            <Ionicons name="download" size={20} color="white" />
            <Text style={adminStyles.securityActionText}>
              Export Audit Logs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              adminStyles.securityActionButton,
              { backgroundColor: "#4CAF50" },
            ]}
            onLongPress={() => onSecurityAction("security-report")}
          >
            <Ionicons name="document-text" size={20} color="white" />
            <Text style={adminStyles.securityActionText}>Security Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
