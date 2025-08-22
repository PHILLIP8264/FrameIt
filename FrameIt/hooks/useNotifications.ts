import { useState, useEffect } from "react";
import { Alert, Linking } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { NotificationSettings } from "../types/database";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import * as Haptics from "expo-haptics";
import NotificationService from "../services/NotificationService";
import { defaultNotificationSettings } from "../constants/notificationData";

export const useNotifications = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(
    defaultNotificationSettings
  );
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize real-time notifications
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = NotificationService.subscribeToUserNotifications(
      user.uid,
      (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      }
    );

    // Request notification permissions
    NotificationService.requestPermissions();

    return unsubscribe;
  }, [user?.uid]);

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
      "Reset Settings",
      "Are you sure you want to reset all notification settings to defaults?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setSettings(defaultNotificationSettings);
            updateSetting(
              "pushNotifications",
              defaultNotificationSettings.pushNotifications
            );
            updateSetting(
              "newChallenges",
              defaultNotificationSettings.newChallenges
            );
            updateSetting(
              "friendActivity",
              defaultNotificationSettings.friendActivity
            );
            updateSetting(
              "achievements",
              defaultNotificationSettings.achievements
            );
            updateSetting(
              "weeklyDigest",
              defaultNotificationSettings.weeklyDigest
            );
            updateSetting(
              "locationReminders",
              defaultNotificationSettings.locationReminders
            );
            updateSetting(
              "challengeReminders",
              defaultNotificationSettings.challengeReminders
            );
            updateSetting(
              "soundEnabled",
              defaultNotificationSettings.soundEnabled
            );
            updateSetting(
              "vibrationEnabled",
              defaultNotificationSettings.vibrationEnabled
            );
            updateSetting("quietHours", defaultNotificationSettings.quietHours);
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    await NotificationService.markAllAsRead(user.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const openDeviceSettings = () => {
    Alert.alert(
      "Device Settings",
      "To change system notification preferences:\n\n1. Go to your device Settings\n2. Find 'Apps' or 'Application Manager'\n3. Select 'FrameIt'\n4. Tap 'Notifications'\n5. Adjust your preferences",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            Linking.openSettings().catch(() => {
              Alert.alert("Error", "Could not open device settings");
            });
          },
        },
      ]
    );
  };

  return {
    // State
    settings,
    loading,
    notifications,
    refreshing,

    // Actions
    updateSetting,
    handleQuietHoursToggle,
    resetToDefaults,
    onRefresh,
    markAllAsRead,
    markAsRead,
    openDeviceSettings,
    requestPermissions,
  };
};
