import React, { useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

// Hooks and Utils
import { useSettings } from "../hooks/useSettings";

// Components
import { ProfileImageSection } from "../components/settings/ProfileImageSection";
import {
  SettingItem,
  SettingsSection,
} from "../components/settings/SettingItem";
import { DisplayNameModal } from "../components/modals/DisplayNameModal";
import { EmailModal } from "../components/modals/EmailModal";
import { PasswordModal } from "../components/modals/PasswordModal";
import ProfilePhotoModal, {
  ProfilePhotoModalRef,
} from "../components/modals/ProfilePhotoModal";
import { StandardHeader } from "../components/shared/StandardHeader";

// Constants and Styles
import {
  SETTINGS_SECTIONS,
  ACCOUNT_SETTINGS,
  UI_TEXT,
} from "../constants/settingsData";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  commonStyles,
} from "../styles/commonStyles";
import { settingsStyles } from "../styles/settingsStyles";

export default function Settings() {
  const { user, logout } = useAuth();
  const {
    userData,
    loading,
    displayNameModalVisible,
    emailModalVisible,
    passwordModalVisible,
    profilePhotoModalVisible,
    handleProfileImageChange,
    handlePhotoUpdated,
    handleSignOut,
    openDisplayNameModal,
    openEmailModal,
    openPasswordModal,
    closeDisplayNameModal,
    closeEmailModal,
    closePasswordModal,
    closeProfilePhotoModal,
  } = useSettings(user, logout);

  // Profile photo modal ref
  const profilePhotoModalRef = useRef<ProfilePhotoModalRef>(null);

  const getAccountSettingValue = (type: string) => {
    switch (type) {
      case "displayName":
        return userData?.displayName || user?.displayName || UI_TEXT.notSet;
      case "email":
        return userData?.email || user?.email || UI_TEXT.notSet;
      case "password":
        return UI_TEXT.passwordValue;
      default:
        return UI_TEXT.notSet;
    }
  };

  const getAccountSettingHandler = (type: string) => {
    switch (type) {
      case "displayName":
        return openDisplayNameModal;
      case "email":
        return openEmailModal;
      case "password":
        return openPasswordModal;
      default:
        return () => {};
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={settingsStyles.container}>
        <View style={settingsStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={commonStyles.bodyText}>{UI_TEXT.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={settingsStyles.container}>
        {/* Header */}
        <StandardHeader title="Settings" onBackPress={() => router.back()} />
        <ScrollView
          style={settingsStyles.scrollContainer}
          contentContainerStyle={settingsStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Section */}
          <ProfileImageSection
            userData={userData}
            user={user}
            onProfileImageChange={handleProfileImageChange}
          />

          {/* Account Information */}
          <View style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>
              {UI_TEXT.accountInformation}
            </Text>
            <View style={settingsStyles.cardGroup}>
              {ACCOUNT_SETTINGS.map((setting, index) => (
                <SettingItem
                  key={index}
                  icon={setting.icon}
                  label={setting.label}
                  value={getAccountSettingValue(setting.type)}
                  onLongPress={getAccountSettingHandler(setting.type)}
                  isLast={index === ACCOUNT_SETTINGS.length - 1}
                />
              ))}
            </View>
          </View>

          {/* App Preferences */}
          <SettingsSection
            title={UI_TEXT.preferences}
            items={SETTINGS_SECTIONS.preferences}
          />

          {/* Support */}
          <SettingsSection
            title={UI_TEXT.support}
            items={SETTINGS_SECTIONS.support}
          />

          {/* Sign Out */}
          <View style={settingsStyles.cardGroup}>
            <SettingItem
              icon="log-out-outline"
              label={UI_TEXT.signOut}
              onLongPress={handleSignOut}
              isSignOut={true}
              isLast={true}
            />
          </View>
        </ScrollView>{" "}
        {/* Individual Modals */}
        <DisplayNameModal
          visible={displayNameModalVisible}
          onClose={closeDisplayNameModal}
          currentDisplayName={userData?.displayName || user?.displayName || ""}
        />
        <EmailModal
          visible={emailModalVisible}
          onClose={closeEmailModal}
          currentEmail={userData?.email || user?.email || ""}
        />
        <PasswordModal
          visible={passwordModalVisible}
          onClose={closePasswordModal}
        />
        <ProfilePhotoModal
          ref={profilePhotoModalRef}
          visible={profilePhotoModalVisible}
          onClose={closeProfilePhotoModal}
          currentPhotoURL={userData?.profileImageUrl}
          onPhotoUpdated={handlePhotoUpdated}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
