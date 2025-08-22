import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminStyles } from "../../styles/adminStyles";

interface AdminSystemConfigProps {
  configSettings: any;
  onUpdateConfigSettings: (settings: any) => void;
  onSaveConfiguration: () => void;
  onResetConfiguration: () => void;
}

export default function AdminSystemConfig({
  configSettings,
  onUpdateConfigSettings,
  onSaveConfiguration,
  onResetConfiguration,
}: AdminSystemConfigProps) {
  const handleToggle = (key: string) => {
    onUpdateConfigSettings({
      ...configSettings,
      [key]: !configSettings[key],
    });
  };

  const handleValueChange = (key: string, value: number) => {
    onUpdateConfigSettings({
      ...configSettings,
      [key]: value,
    });
  };

  return (
    <ScrollView style={adminStyles.moduleContainer}>
      <Text style={adminStyles.moduleTitle}>System Configuration</Text>
      <Text style={adminStyles.moduleSubtitle}>
        Manage app settings, features, and system parameters
      </Text>

      {/* Core Settings */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}>🔧 Core Settings</Text>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Maintenance Mode</Text>
            <Text style={adminStyles.configDescription}>
              Temporarily disable app for maintenance
            </Text>
          </View>
          <TouchableOpacity
            style={[
              adminStyles.configToggle,
              configSettings.maintenanceMode && adminStyles.configToggleActive,
            ]}
            onLongPress={() => handleToggle("maintenanceMode")}
          >
            <Text
              style={[
                adminStyles.configToggleText,
                configSettings.maintenanceMode &&
                  adminStyles.configToggleTextActive,
              ]}
            >
              {configSettings.maintenanceMode ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>New User Registration</Text>
            <Text style={adminStyles.configDescription}>
              Allow new users to create accounts
            </Text>
          </View>
          <TouchableOpacity
            style={[
              adminStyles.configToggle,
              configSettings.newUserRegistration &&
                adminStyles.configToggleActive,
            ]}
            onLongPress={() => handleToggle("newUserRegistration")}
          >
            <Text
              style={[
                adminStyles.configToggleText,
                configSettings.newUserRegistration &&
                  adminStyles.configToggleTextActive,
              ]}
            >
              {configSettings.newUserRegistration ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>
              Email Verification Required
            </Text>
            <Text style={adminStyles.configDescription}>
              Require email verification for new accounts
            </Text>
          </View>
          <TouchableOpacity
            style={[
              adminStyles.configToggle,
              configSettings.requireEmailVerification &&
                adminStyles.configToggleActive,
            ]}
            onLongPress={() => handleToggle("requireEmailVerification")}
          >
            <Text
              style={[
                adminStyles.configToggleText,
                configSettings.requireEmailVerification &&
                  adminStyles.configToggleTextActive,
              ]}
            >
              {configSettings.requireEmailVerification ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feature Toggles */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}> Feature Toggles</Text>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Quest Submissions</Text>
            <Text style={adminStyles.configDescription}>
              Allow users to submit quest completions
            </Text>
          </View>
          <TouchableOpacity
            style={[
              adminStyles.configToggle,
              configSettings.questSubmission && adminStyles.configToggleActive,
            ]}
            onLongPress={() => handleToggle("questSubmission")}
          >
            <Text
              style={[
                adminStyles.configToggleText,
                configSettings.questSubmission &&
                  adminStyles.configToggleTextActive,
              ]}
            >
              {configSettings.questSubmission ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Team Creation</Text>
            <Text style={adminStyles.configDescription}>
              Allow users to create and join teams
            </Text>
          </View>
          <TouchableOpacity
            style={[
              adminStyles.configToggle,
              configSettings.teamCreation && adminStyles.configToggleActive,
            ]}
            onLongPress={() => handleToggle("teamCreation")}
          >
            <Text
              style={[
                adminStyles.configToggleText,
                configSettings.teamCreation &&
                  adminStyles.configToggleTextActive,
              ]}
            >
              {configSettings.teamCreation ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Public Profiles</Text>
            <Text style={adminStyles.configDescription}>
              Allow users to view public profiles
            </Text>
          </View>
          <TouchableOpacity
            style={[
              adminStyles.configToggle,
              configSettings.publicProfiles && adminStyles.configToggleActive,
            ]}
            onLongPress={() => handleToggle("publicProfiles")}
          >
            <Text
              style={[
                adminStyles.configToggleText,
                configSettings.publicProfiles &&
                  adminStyles.configToggleTextActive,
              ]}
            >
              {configSettings.publicProfiles ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Location Services</Text>
            <Text style={adminStyles.configDescription}>
              Enable GPS and location-based features
            </Text>
          </View>
          <TouchableOpacity
            style={[
              adminStyles.configToggle,
              configSettings.geoLocation && adminStyles.configToggleActive,
            ]}
            onLongPress={() => handleToggle("geoLocation")}
          >
            <Text
              style={[
                adminStyles.configToggleText,
                configSettings.geoLocation &&
                  adminStyles.configToggleTextActive,
              ]}
            >
              {configSettings.geoLocation ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}>
          Notification Settings
        </Text>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Push Notifications</Text>
            <Text style={adminStyles.configDescription}>
              Send push notifications to mobile devices
            </Text>
          </View>
          <TouchableOpacity
            style={[
              adminStyles.configToggle,
              configSettings.pushNotifications &&
                adminStyles.configToggleActive,
            ]}
            onLongPress={() => handleToggle("pushNotifications")}
          >
            <Text
              style={[
                adminStyles.configToggleText,
                configSettings.pushNotifications &&
                  adminStyles.configToggleTextActive,
              ]}
            >
              {configSettings.pushNotifications ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Email Notifications</Text>
            <Text style={adminStyles.configDescription}>
              Send email notifications to users
            </Text>
          </View>
          <TouchableOpacity
            style={[
              adminStyles.configToggle,
              configSettings.emailNotifications &&
                adminStyles.configToggleActive,
            ]}
            onLongPress={() => handleToggle("emailNotifications")}
          >
            <Text
              style={[
                adminStyles.configToggleText,
                configSettings.emailNotifications &&
                  adminStyles.configToggleTextActive,
              ]}
            >
              {configSettings.emailNotifications ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Game Parameters */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}>🎯 Game Parameters</Text>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Max Team Size</Text>
            <Text style={adminStyles.configDescription}>
              Maximum members per team
            </Text>
          </View>
          <View style={adminStyles.configValueContainer}>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "maxTeamSize",
                  Math.max(1, configSettings.maxTeamSize - 1)
                )
              }
            >
              <Ionicons name="remove" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={adminStyles.configValue}>
              {configSettings.maxTeamSize}
            </Text>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "maxTeamSize",
                  Math.min(50, configSettings.maxTeamSize + 1)
                )
              }
            >
              <Ionicons name="add" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Daily Quest Limit</Text>
            <Text style={adminStyles.configDescription}>
              Maximum quests per user per day
            </Text>
          </View>
          <View style={adminStyles.configValueContainer}>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "dailyQuestLimit",
                  Math.max(1, configSettings.dailyQuestLimit - 1)
                )
              }
            >
              <Ionicons name="remove" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={adminStyles.configValue}>
              {configSettings.dailyQuestLimit}
            </Text>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "dailyQuestLimit",
                  Math.min(20, configSettings.dailyQuestLimit + 1)
                )
              }
            >
              <Ionicons name="add" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>XP Multiplier</Text>
            <Text style={adminStyles.configDescription}>
              Global experience point multiplier
            </Text>
          </View>
          <View style={adminStyles.configValueContainer}>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "xpMultiplier",
                  Math.max(0.1, configSettings.xpMultiplier - 0.1)
                )
              }
            >
              <Ionicons name="remove" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={adminStyles.configValue}>
              {configSettings.xpMultiplier.toFixed(1)}x
            </Text>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "xpMultiplier",
                  Math.min(5.0, configSettings.xpMultiplier + 0.1)
                )
              }
            >
              <Ionicons name="add" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* System Limits */}
      <View style={adminStyles.configSection}>
        <Text style={adminStyles.configSectionTitle}>⚙️ System Limits</Text>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Max File Size</Text>
            <Text style={adminStyles.configDescription}>
              Maximum upload size per file (MB)
            </Text>
          </View>
          <View style={adminStyles.configValueContainer}>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "maxFileSize",
                  Math.max(1, configSettings.maxFileSize - 1)
                )
              }
            >
              <Ionicons name="remove" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={adminStyles.configValue}>
              {configSettings.maxFileSize}MB
            </Text>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "maxFileSize",
                  Math.min(100, configSettings.maxFileSize + 1)
                )
              }
            >
              <Ionicons name="add" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={adminStyles.configItem}>
          <View style={adminStyles.configInfo}>
            <Text style={adminStyles.configLabel}>Session Timeout</Text>
            <Text style={adminStyles.configDescription}>
              User session timeout (minutes)
            </Text>
          </View>
          <View style={adminStyles.configValueContainer}>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "sessionTimeout",
                  Math.max(5, configSettings.sessionTimeout - 5)
                )
              }
            >
              <Ionicons name="remove" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={adminStyles.configValue}>
              {configSettings.sessionTimeout}min
            </Text>
            <TouchableOpacity
              style={adminStyles.configButton}
              onLongPress={() =>
                handleValueChange(
                  "sessionTimeout",
                  Math.min(180, configSettings.sessionTimeout + 5)
                )
              }
            >
              <Ionicons name="add" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Save Configuration */}
      <View style={adminStyles.configSection}>
        <TouchableOpacity
          style={adminStyles.saveConfigButton}
          onLongPress={onSaveConfiguration}
        >
          <Ionicons name="save" size={20} color="white" />
          <Text style={adminStyles.saveConfigButtonText}>
            Save Configuration
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminStyles.resetConfigButton}
          onLongPress={onResetConfiguration}
        >
          <Ionicons name="refresh" size={20} color="#D61A66" />
          <Text style={adminStyles.resetConfigButtonText}>
            Reset to Defaults
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
