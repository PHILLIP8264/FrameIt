import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { NotificationToggle } from "../components/notifications/NotificationToggle";
import { NotificationItem } from "../components/notifications/NotificationItem";
import { useNotifications } from "../hooks/useNotifications";
import { notificationStyles } from "../styles/notificationStyles";

export default function NotificationsSettings() {
  const {
    settings,
    loading,
    notifications,
    updateSetting,
    handleQuietHoursToggle,
    resetToDefaults,
    markAsRead,
    openDeviceSettings,
  } = useNotifications();

  if (loading) {
    return (
      <View style={notificationStyles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={notificationStyles.container}>
        {/* Header */}
        <View style={notificationStyles.header}>
          <TouchableOpacity
            style={notificationStyles.backButton}
            onLongPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#137CD8" />
          </TouchableOpacity>
          <Text style={notificationStyles.headerTitle}>Notifications</Text>
          <TouchableOpacity
            style={notificationStyles.resetButton}
            onLongPress={resetToDefaults}
          >
            <Ionicons name="refresh" size={20} color="#137CD8" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={notificationStyles.scrollContainer}
          contentContainerStyle={notificationStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={notificationStyles.content}>
            {/* Master Switch */}
            <View style={notificationStyles.section}>
              <Text style={notificationStyles.sectionTitle}>Push Notifications</Text>
              <NotificationToggle
                icon="notifications"
                title="Enable Notifications"
                description="Receive push notifications from FrameIt"
                value={settings.pushNotifications}
                onValueChange={(value) =>
                  updateSetting("pushNotifications", value)
                }
                color="#137CD8"
              />
            </View>

            {/* Challenge Notifications */}
            <View style={notificationStyles.section}>
              <Text style={notificationStyles.sectionTitle}>Challenges</Text>

              <NotificationToggle
                icon="flag"
                title="New Challenges"
                description="Get notified when new challenges are available"
                value={settings.newChallenges && settings.pushNotifications}
                onValueChange={(value) => updateSetting("newChallenges", value)}
                color="#34C759"
              />

              <NotificationToggle
                icon="alarm"
                title="Challenge Reminders"
                description="Reminders for ongoing challenges"
                value={
                  settings.challengeReminders && settings.pushNotifications
                }
                onValueChange={(value) =>
                  updateSetting("challengeReminders", value)
                }
                color="#FF9500"
              />

              <NotificationToggle
                icon="location"
                title="Location Reminders"
                description="Notify when near challenge locations"
                value={settings.locationReminders && settings.pushNotifications}
                onValueChange={(value) =>
                  updateSetting("locationReminders", value)
                }
                color="#FF3B30"
              />
            </View>

            {/* Social Notifications */}
            <View style={notificationStyles.section}>
              <Text style={notificationStyles.sectionTitle}>Social</Text>

              <NotificationToggle
                icon="people"
                title="Friend Activity"
                description="When friends complete challenges or activities"
                value={settings.friendActivity && settings.pushNotifications}
                onValueChange={(value) =>
                  updateSetting("friendActivity", value)
                }
                color="#AF52DE"
              />

              <NotificationToggle
                icon="trophy"
                title="Achievements"
                description="When you or friends unlock achievements"
                value={settings.achievements && settings.pushNotifications}
                onValueChange={(value) => updateSetting("achievements", value)}
                color="#FFD60A"
              />
            </View>

            {/* Digest Notifications */}
            <View style={notificationStyles.section}>
              <Text style={notificationStyles.sectionTitle}>Digest</Text>

              <NotificationToggle
                icon="mail"
                title="Weekly Digest"
                description="Weekly summary of activities and new content"
                value={settings.weeklyDigest && settings.pushNotifications}
                onValueChange={(value) => updateSetting("weeklyDigest", value)}
                color="#32D74B"
              />
            </View>

            {/* Notification Style */}
            <View style={notificationStyles.section}>
              <Text style={notificationStyles.sectionTitle}>Notification Style</Text>

              <NotificationToggle
                icon="volume-high"
                title="Sound"
                description="Play sound with notifications"
                value={settings.soundEnabled}
                onValueChange={(value) => updateSetting("soundEnabled", value)}
                color="#137CD8"
              />

              <NotificationToggle
                icon="phone-portrait"
                title="Vibration"
                description="Vibrate for notifications"
                value={settings.vibrationEnabled}
                onValueChange={(value) =>
                  updateSetting("vibrationEnabled", value)
                }
                color="#5856D6"
              />
            </View>

            {/* Quiet Hours */}
            <View style={notificationStyles.section}>
              <Text style={notificationStyles.sectionTitle}>Quiet Hours</Text>

              <NotificationToggle
                icon="moon"
                title="Do Not Disturb"
                description={`Silence notifications from ${settings.quietHours.startTime} to ${settings.quietHours.endTime}`}
                value={settings.quietHours.enabled}
                onValueChange={handleQuietHoursToggle}
                color="#8E8E93"
              />

              {settings.quietHours.enabled && (
                <View style={notificationStyles.quietHoursInfo}>
                  <Text style={notificationStyles.quietHoursText}>
                    Notifications will be silenced from{" "}
                    {settings.quietHours.startTime} to{" "}
                    {settings.quietHours.endTime}
                  </Text>
                  <TouchableOpacity style={notificationStyles.editTimeButton}>
                    <Text style={notificationStyles.editTimeText}>Edit Times</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Device Settings Link */}
            <View style={notificationStyles.section}>
              <TouchableOpacity
                style={notificationStyles.deviceSettingsButton}
                onLongPress={openDeviceSettings}
              >
                <View style={notificationStyles.deviceSettingsLeft}>
                  <Ionicons name="settings" size={20} color="#137CD8" />
                  <Text style={notificationStyles.deviceSettingsText}>
                    Device Notification Settings
                  </Text>
                </View>
                <Ionicons name="open-outline" size={20} color="#137CD8" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
