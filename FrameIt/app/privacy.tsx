import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
} from "react-native";
import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PrivacyToggle } from "../components/privacy/PrivacyToggle";
import { PrivacyOption } from "../components/privacy/PrivacyOption";
import { usePrivacy } from "../hooks/usePrivacy";
import { privacyStyles } from "../styles/privacyStyles";
import { 
  profileVisibilityOptions, 
  emailVisibilityOptions 
} from "../constants/privacyData";

export default function Privacy() {
  const {
    settings,
    loading,
    updateSetting,
    updateNestedSetting,
    resetToDefaults,
    openPrivacyPolicy,
  } = usePrivacy();

  if (loading) {
    return (
      <View style={privacyStyles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={privacyStyles.container}>
        {/* Header */}
        <View style={privacyStyles.header}>
          <TouchableOpacity
            style={privacyStyles.backButton}
            onLongPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#137CD8" />
          </TouchableOpacity>
          <Text style={privacyStyles.headerTitle}>Privacy & Security</Text>
          <TouchableOpacity
            style={privacyStyles.resetButton}
            onLongPress={resetToDefaults}
          >
            <Ionicons name="refresh" size={20} color="#137CD8" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={privacyStyles.scrollContainer}
          contentContainerStyle={privacyStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={privacyStyles.content}>
            {/* Profile Visibility */}
            <View style={privacyStyles.section}>
              <Text style={privacyStyles.sectionTitle}>Profile Visibility</Text>

              <PrivacyOption
                icon="person-circle"
                title="Profile Visibility"
                description="Choose who can see your profile information"
                currentValue={settings.profileVisibility}
                options={profileVisibilityOptions}
                onValueChange={(value: string) =>
                  updateSetting("profileVisibility", value)
                }
              />

              <PrivacyOption
                icon="mail"
                title="Email Visibility"
                description="Choose who can see your email address"
                currentValue={settings.showEmail}
                options={emailVisibilityOptions}
                onValueChange={(value: string) => updateSetting("showEmail", value)}
              />
            </View>

            {/* Activity & Location */}
            <View style={privacyStyles.section}>
              <Text style={privacyStyles.sectionTitle}>Activity & Location</Text>

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
            <View style={privacyStyles.section}>
              <Text style={privacyStyles.sectionTitle}>Social Features</Text>

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
            <View style={privacyStyles.section}>
              <Text style={privacyStyles.sectionTitle}>Data Collection</Text>

              <PrivacyToggle
                icon="analytics"
                title="Analytics Data"
                description="Help improve the app with usage analytics"
                value={settings.dataCollection.analytics}
                onValueChange={(value) =>
                  updateNestedSetting("dataCollection", "analytics", value)
                }
                color="#137CD8"
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
            <View style={privacyStyles.section}>
              <Text style={privacyStyles.sectionTitle}>
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
            <View style={privacyStyles.section}>
              <TouchableOpacity
                style={privacyStyles.policyButton}
                onLongPress={openPrivacyPolicy}
              >
                <View style={privacyStyles.policyLeft}>
                  <Ionicons name="document-text" size={20} color="#137CD8" />
                  <Text style={privacyStyles.policyText}>
                    View Privacy Policy & Terms
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
