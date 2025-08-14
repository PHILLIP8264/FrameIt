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
import { PrivacySettings } from "../types/database";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import * as Haptics from "expo-haptics";

// Enhanced Privacy Toggle Component
interface PrivacyToggleProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  color?: string;
  isRecommended?: boolean;
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  icon,
  title,
  description,
  value,
  onValueChange,
  color = "#007AFF",
  isRecommended = false,
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
          onValueChange(!value);

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
          styles.privacyItem,
          isRecommended && styles.recommendedItem,
          {
            transform: [{ translateX }, { scale: containerScale }],
          },
        ]}
      >
        <View style={styles.privacyContent}>
          <View style={styles.privacyLeft}>
            <Ionicons name={icon as any} size={20} color={color} />
            <View style={styles.privacyInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.privacyTitle}>{title}</Text>
                {isRecommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}
              </View>
              <Text style={styles.privacyDescription}>{description}</Text>
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
            name={value ? "shield-checkmark" : "shield-outline"}
            size={20}
            color="#fff"
          />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

// Privacy Option Selector Component
interface PrivacyOptionProps {
  icon: string;
  title: string;
  description: string;
  currentValue: string;
  options: Array<{ value: string; label: string; description: string }>;
  onValueChange: (value: string) => void;
}

const PrivacyOption: React.FC<PrivacyOptionProps> = ({
  icon,
  title,
  description,
  currentValue,
  options,
  onValueChange,
}) => {
  const showOptions = () => {
    Alert.alert(title, description, [
      ...options.map((option) => ({
        text: `${option.label}${currentValue === option.value ? " ✓" : ""}`,
        onPress: () => onValueChange(option.value),
        style: currentValue === option.value ? "default" : ("default" as any),
      })),
      { text: "Cancel", style: "cancel" as any },
    ]);
  };

  const getCurrentLabel = () => {
    return (
      options.find((opt) => opt.value === currentValue)?.label || currentValue
    );
  };

  return (
    <TouchableOpacity style={styles.optionItem} onPress={showOptions}>
      <View style={styles.optionLeft}>
        <Ionicons name={icon as any} size={20} color="#007AFF" />
        <View style={styles.optionInfo}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionValue}>{getCurrentLabel()}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );
};

export default function Privacy() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "friends",
    showLocation: false,
    showActivity: true,
    showAchievements: true,
    allowFriendRequests: true,
    showOnLeaderboard: true,
    shareCompletedChallenges: true,
    allowTagging: true,
    showEmail: "private",
    showDisplayName: true,
    dataCollection: {
      analytics: true,
      performance: true,
      crashReports: true,
    },
    marketing: {
      emailMarketing: false,
      pushMarketing: false,
      thirdPartySharing: false,
    },
  });
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
            const defaultSettings: PrivacySettings = {
              profileVisibility: "friends",
              showLocation: false,
              showActivity: true,
              showAchievements: true,
              allowFriendRequests: true,
              showOnLeaderboard: true,
              shareCompletedChallenges: true,
              allowTagging: true,
              showEmail: "private",
              showDisplayName: true,
              dataCollection: {
                analytics: true,
                performance: true,
                crashReports: true,
              },
              marketing: {
                emailMarketing: false,
                pushMarketing: false,
                thirdPartySharing: false,
              },
            };

            if (user?.uid) {
              try {
                await updateDoc(doc(db, "users", user.uid), {
                  privacySettings: defaultSettings,
                  updatedAt: new Date(),
                });
                setSettings(defaultSettings);
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
          <Text style={styles.headerTitle}>Privacy & Security</Text>
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
            {/* Profile Visibility */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Visibility</Text>

              <PrivacyOption
                icon="person-circle"
                title="Profile Visibility"
                description="Choose who can see your profile information"
                currentValue={settings.profileVisibility}
                options={[
                  {
                    value: "public",
                    label: "Public",
                    description: "Anyone can see your profile",
                  },
                  {
                    value: "friends",
                    label: "Friends Only",
                    description: "Only friends can see your profile",
                  },
                  {
                    value: "private",
                    label: "Private",
                    description: "Only you can see your profile",
                  },
                ]}
                onValueChange={(value) =>
                  updateSetting("profileVisibility", value)
                }
              />

              <PrivacyOption
                icon="mail"
                title="Email Visibility"
                description="Choose who can see your email address"
                currentValue={settings.showEmail}
                options={[
                  {
                    value: "public",
                    label: "Public",
                    description: "Anyone can see your email",
                  },
                  {
                    value: "friends",
                    label: "Friends Only",
                    description: "Only friends can see your email",
                  },
                  {
                    value: "private",
                    label: "Private",
                    description: "Email is hidden from everyone",
                  },
                ]}
                onValueChange={(value) => updateSetting("showEmail", value)}
              />
            </View>

            {/* Activity & Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity & Location</Text>

              <PrivacyToggle
                icon="location"
                title="Share Location"
                description="Allow others to see your location in challenges"
                value={settings.showLocation}
                onValueChange={(value) => updateSetting("showLocation", value)}
                color="#FF3B30"
                isRecommended={false}
              />

              <PrivacyToggle
                icon="pulse"
                title="Show Activity"
                description="Display your recent activity to friends"
                value={settings.showActivity}
                onValueChange={(value) => updateSetting("showActivity", value)}
                color="#34C759"
              />

              <PrivacyToggle
                icon="trophy"
                title="Show Achievements"
                description="Display your achievements and badges"
                value={settings.showAchievements}
                onValueChange={(value) =>
                  updateSetting("showAchievements", value)
                }
                color="#FFD60A"
              />
            </View>

            {/* Social Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Social Features</Text>

              <PrivacyToggle
                icon="people"
                title="Allow Friend Requests"
                description="Let others send you friend requests"
                value={settings.allowFriendRequests}
                onValueChange={(value) =>
                  updateSetting("allowFriendRequests", value)
                }
                color="#AF52DE"
              />

              <PrivacyToggle
                icon="podium"
                title="Show on Leaderboard"
                description="Display your ranking on public leaderboards"
                value={settings.showOnLeaderboard}
                onValueChange={(value) =>
                  updateSetting("showOnLeaderboard", value)
                }
                color="#FF9500"
              />

              <PrivacyToggle
                icon="camera"
                title="Share Completed Challenges"
                description="Let friends see your completed challenges"
                value={settings.shareCompletedChallenges}
                onValueChange={(value) =>
                  updateSetting("shareCompletedChallenges", value)
                }
                color="#32D74B"
              />

              <PrivacyToggle
                icon="pricetag"
                title="Allow Tagging"
                description="Let friends tag you in their posts"
                value={settings.allowTagging}
                onValueChange={(value) => updateSetting("allowTagging", value)}
                color="#5AC8FA"
              />
            </View>

            {/* Data Collection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Collection</Text>

              <PrivacyToggle
                icon="analytics"
                title="Analytics Data"
                description="Help improve the app with usage analytics"
                value={settings.dataCollection.analytics}
                onValueChange={(value) =>
                  updateNestedSetting("dataCollection", "analytics", value)
                }
                color="#007AFF"
                isRecommended={true}
              />

              <PrivacyToggle
                icon="speedometer"
                title="Performance Data"
                description="Share performance data to optimize the app"
                value={settings.dataCollection.performance}
                onValueChange={(value) =>
                  updateNestedSetting("dataCollection", "performance", value)
                }
                color="#34C759"
                isRecommended={true}
              />

              <PrivacyToggle
                icon="bug"
                title="Crash Reports"
                description="Automatically send crash reports for bug fixes"
                value={settings.dataCollection.crashReports}
                onValueChange={(value) =>
                  updateNestedSetting("dataCollection", "crashReports", value)
                }
                color="#FF9500"
                isRecommended={true}
              />
            </View>

            {/* Marketing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Marketing & Communications
              </Text>

              <PrivacyToggle
                icon="mail-unread"
                title="Email Marketing"
                description="Receive promotional emails and newsletters"
                value={settings.marketing.emailMarketing}
                onValueChange={(value) =>
                  updateNestedSetting("marketing", "emailMarketing", value)
                }
                color="#5856D6"
              />

              <PrivacyToggle
                icon="megaphone"
                title="Marketing Notifications"
                description="Receive promotional push notifications"
                value={settings.marketing.pushMarketing}
                onValueChange={(value) =>
                  updateNestedSetting("marketing", "pushMarketing", value)
                }
                color="#FF3B30"
              />

              <PrivacyToggle
                icon="share"
                title="Third-Party Sharing"
                description="Allow sharing anonymized data with partners"
                value={settings.marketing.thirdPartySharing}
                onValueChange={(value) =>
                  updateNestedSetting("marketing", "thirdPartySharing", value)
                }
                color="#8E8E93"
              />
            </View>

            {/* Legal & Policy */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.policyButton}
                onPress={openPrivacyPolicy}
              >
                <View style={styles.policyLeft}>
                  <Ionicons name="document-text" size={20} color="#007AFF" />
                  <Text style={styles.policyText}>
                    View Privacy Policy & Terms
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
  privacyItem: {
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
  recommendedItem: {
    borderColor: "rgba(52, 199, 89, 0.3)",
    borderWidth: 2,
  },
  privacyContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 20,
    paddingLeft: 70,
    zIndex: 2,
  },
  privacyLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  privacyInfo: {
    marginLeft: 15,
    flex: 1,
  },
  titleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 2,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
  },
  privacyDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  recommendedBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  recommendedText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600" as const,
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
  optionItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  optionLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  optionInfo: {
    marginLeft: 15,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#333",
  },
  optionValue: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 2,
    fontWeight: "500" as const,
  },
  policyButton: {
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
  policyLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  policyText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#007AFF",
    marginLeft: 12,
  },
};
