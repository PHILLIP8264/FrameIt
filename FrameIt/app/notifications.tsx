import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Linking,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { NotificationSettings } from "../types/database";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import * as Haptics from "expo-haptics";

// Enhanced Toggle Switch Component
interface NotificationToggleProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  color?: string;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  icon,
  title,
  description,
  value,
  onValueChange,
  color = "#007AFF",
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const blobTranslateX = useRef(new Animated.Value(0)).current;
  const blobScale = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        if (isDragging) {
          const maxTranslation = 80;
          const clampedTranslation = Math.max(
            0,
            Math.min(maxTranslation, event.nativeEvent.translationX)
          );
          blobTranslateX.setValue(clampedTranslation);

          const scaleValue = 1 + (clampedTranslation / maxTranslation) * 0.1;
          blobScale.setValue(scaleValue);
        }
      },
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
      Animated.spring(containerScale, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }).start();
    } else if (event.nativeEvent.state === State.END) {
      setIsDragging(false);
      const { translationX: tx, velocityX } = event.nativeEvent;

      if (tx > 50 || velocityX > 300) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Animated.parallel([
          Animated.timing(blobTranslateX, {
            toValue: 100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(blobScale, {
            toValue: 1.2,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Toggle the setting
          onValueChange(!value);

          // Reset animations
          Animated.parallel([
            Animated.spring(blobTranslateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }),
            Animated.spring(blobScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }),
            Animated.spring(containerScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }),
          ]).start();
        });
      } else {
        // Return to start
        Animated.parallel([
          Animated.spring(blobTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }),
          Animated.spring(blobScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }),
          Animated.spring(containerScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }),
        ]).start();
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 12,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.notificationItem,
          {
            transform: [{ translateX }, { scale: containerScale }],
          },
        ]}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationLeft}>
            <Ionicons name={icon as any} size={20} color={color} />
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>{title}</Text>
              <Text style={styles.notificationDescription}>{description}</Text>
            </View>
          </View>
          <View style={styles.toggleContainer}>
            <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={{ false: "#E5E5EA", true: `${color}40` }}
              thumbColor={value ? color : "#FFFFFF"}
              ios_backgroundColor="#E5E5EA"
            />
          </View>
        </View>

        {/* Sliding blob */}
        <Animated.View
          style={[
            styles.slideBlob,
            {
              backgroundColor: value ? color : "#E5E5EA",
              transform: [{ translateX: blobTranslateX }, { scale: blobScale }],
            },
          ]}
        >
          <Ionicons
            name={value ? "notifications" : "notifications-off"}
            size={20}
            color="#fff"
          />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default function NotificationsSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    newChallenges: true,
    friendActivity: true,
    achievements: true,
    weeklyDigest: false,
    locationReminders: true,
    challengeReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
    },
  });
  const [loading, setLoading] = useState(true);

  // Load notification settings from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          if (userData.notificationSettings) {
            setSettings(userData.notificationSettings);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notification settings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Request notification permissions
  useEffect(() => {
    // For now, just show an alert about notifications
    // TODO use expo-notifications properly configured
  }, []);

  const requestPermissions = async () => {
    try {
      Alert.alert(
        "Notification Permissions",
        "To receive notifications, please enable them in your device settings when prompted.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error with notification permissions:", error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    if (!user?.uid) return;

    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      await updateDoc(doc(db, "users", user.uid), {
        notificationSettings: newSettings,
        updatedAt: new Date(),
      });

      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error updating notification setting:", error);
      Alert.alert("Error", "Failed to update notification setting");
    }
  };

  const handleQuietHoursToggle = () => {
    const newQuietHours = {
      ...settings.quietHours,
      enabled: !settings.quietHours.enabled,
    };
    updateSetting("quietHours", newQuietHours);
  };

  const resetToDefaults = () => {
    Alert.alert(
      "Reset to Defaults",
      "Are you sure you want to reset all notification settings to default values?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            const defaultSettings: NotificationSettings = {
              pushNotifications: true,
              newChallenges: true,
              friendActivity: true,
              achievements: true,
              weeklyDigest: false,
              locationReminders: true,
              challengeReminders: true,
              soundEnabled: true,
              vibrationEnabled: true,
              quietHours: {
                enabled: false,
                startTime: "22:00",
                endTime: "08:00",
              },
            };
            updateSetting(
              "pushNotifications",
              defaultSettings.pushNotifications
            );
            updateSetting("newChallenges", defaultSettings.newChallenges);
            updateSetting("friendActivity", defaultSettings.friendActivity);
            updateSetting("achievements", defaultSettings.achievements);
            updateSetting("weeklyDigest", defaultSettings.weeklyDigest);
            updateSetting(
              "locationReminders",
              defaultSettings.locationReminders
            );
            updateSetting(
              "challengeReminders",
              defaultSettings.challengeReminders
            );
            updateSetting("soundEnabled", defaultSettings.soundEnabled);
            updateSetting("vibrationEnabled", defaultSettings.vibrationEnabled);
            updateSetting("quietHours", defaultSettings.quietHours);
          },
        },
      ]
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToDefaults}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Master Switch */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Push Notifications</Text>
              <NotificationToggle
                icon="notifications"
                title="Enable Notifications"
                description="Receive push notifications from FrameIt"
                value={settings.pushNotifications}
                onValueChange={(value) =>
                  updateSetting("pushNotifications", value)
                }
                color="#007AFF"
              />
            </View>

            {/* Challenge Notifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Challenges</Text>

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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Social</Text>

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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Digest</Text>

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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Style</Text>

              <NotificationToggle
                icon="volume-high"
                title="Sound"
                description="Play sound with notifications"
                value={settings.soundEnabled}
                onValueChange={(value) => updateSetting("soundEnabled", value)}
                color="#007AFF"
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quiet Hours</Text>

              <NotificationToggle
                icon="moon"
                title="Do Not Disturb"
                description={`Silence notifications from ${settings.quietHours.startTime} to ${settings.quietHours.endTime}`}
                value={settings.quietHours.enabled}
                onValueChange={handleQuietHoursToggle}
                color="#8E8E93"
              />

              {settings.quietHours.enabled && (
                <View style={styles.quietHoursInfo}>
                  <Text style={styles.quietHoursText}>
                    Notifications will be silenced from{" "}
                    {settings.quietHours.startTime} to{" "}
                    {settings.quietHours.endTime}
                  </Text>
                  <TouchableOpacity style={styles.editTimeButton}>
                    <Text style={styles.editTimeText}>Edit Times</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Device Settings Link */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.deviceSettingsButton}
                onPress={() => {
                  Alert.alert(
                    "Device Settings",
                    "To change system notification preferences:\n\n1. Go to your device Settings\n2. Find 'Apps' or 'Application Manager'\n3. Select 'FrameIt'\n4. Tap 'Notifications'\n5. Adjust your preferences",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Open Settings",
                        onPress: () => {
                          // Try to open device settings
                          Linking.openSettings().catch(() => {
                            Alert.alert(
                              "Error",
                              "Could not open device settings"
                            );
                          });
                        },
                      },
                    ]
                  );
                }}
              >
                <View style={styles.deviceSettingsLeft}>
                  <Ionicons name="settings" size={20} color="#007AFF" />
                  <Text style={styles.deviceSettingsText}>
                    Device Notification Settings
                  </Text>
                </View>
                <Ionicons name="open-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#007AFF",
  },
  resetButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 15,
  },
  notificationItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden" as const,
    position: "relative" as const,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  notificationContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 20,
    paddingLeft: 70,
    zIndex: 2,
  },
  notificationLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  notificationInfo: {
    marginLeft: 15,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  toggleContainer: {
    marginLeft: 10,
  },
  slideBlob: {
    position: "absolute" as const,
    left: 6,
    top: 6,
    bottom: 6,
    width: 56,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quietHoursInfo: {
    backgroundColor: "rgba(142, 142, 147, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  quietHoursText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center" as const,
  },
  editTimeButton: {
    marginTop: 10,
    alignSelf: "center" as const,
  },
  editTimeText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500" as const,
  },
  deviceSettingsButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
  },
  deviceSettingsLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  deviceSettingsText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#007AFF",
    marginLeft: 12,
  },
};
