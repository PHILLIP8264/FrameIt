import { useState, useEffect } from "react";
import { Alert, Linking } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { PrivacySettings } from "../types/database";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import * as Haptics from "expo-haptics";
import { defaultPrivacySettings } from "../constants/privacyData";

export const usePrivacy = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>(
    defaultPrivacySettings
  );
  const [loading, setLoading] = useState(true);

  // Load privacy settings from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          if (userData.privacySettings) {
            setSettings(userData.privacySettings);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching privacy settings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!user?.uid) return;

    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      await updateDoc(doc(db, "users", user.uid), {
        privacySettings: newSettings,
        updatedAt: new Date(),
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error updating privacy setting:", error);
      Alert.alert("Error", "Failed to update privacy setting");
    }
  };

  const updateNestedSetting = async (
    parentKey: "dataCollection" | "marketing",
    childKey: string,
    value: boolean
  ) => {
    if (!user?.uid) return;

    try {
      const newSettings = {
        ...settings,
        [parentKey]: {
          ...settings[parentKey],
          [childKey]: value,
        },
      };
      setSettings(newSettings);

      await updateDoc(doc(db, "users", user.uid), {
        privacySettings: newSettings,
        updatedAt: new Date(),
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error updating privacy setting:", error);
      Alert.alert("Error", "Failed to update privacy setting");
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      "Reset Privacy Settings",
      "Are you sure you want to reset all privacy settings to recommended defaults?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            if (user?.uid) {
              try {
                await updateDoc(doc(db, "users", user.uid), {
                  privacySettings: defaultPrivacySettings,
                  updatedAt: new Date(),
                });
                setSettings(defaultPrivacySettings);
              } catch (error) {
                console.error("Error resetting privacy settings:", error);
                Alert.alert("Error", "Failed to reset privacy settings");
              }
            }
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Alert.alert(
      "Privacy Policy",
      "View our complete privacy policy and terms of service.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open",
          onPress: () => {
            Linking.openURL("https://your-app.com/privacy").catch(() => {
              Alert.alert("Error", "Could not open privacy policy");
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

    // Actions
    updateSetting,
    updateNestedSetting,
    resetToDefaults,
    openPrivacyPolicy,
  };
};
