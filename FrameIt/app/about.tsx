import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Hooks and Utils
import { useAbout } from "../hooks/useAbout";

// Components
import { InfoCard } from "../components/about/InfoCard";
import { TeamMemberCard } from "../components/about/TeamMemberCard";
import { FeatureCard } from "../components/about/FeatureCard";

// Constants and Styles
import {
  APP_INFO,
  TEAM_MEMBERS,
  FEATURES,
  ACKNOWLEDGMENTS_TEXT,
  COPYRIGHT_TEXT,
  MADE_WITH_TEXT,
} from "../constants/aboutData";
import { aboutStyles } from "../styles/aboutStyles";

export default function About() {
  const {
    showVersionInfo,
    openPrivacyPolicy,
    openTermsOfService,
    openWebsite,
    openEmail,
  } = useAbout();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={aboutStyles.container}>
        {/* Header */}
        <View style={aboutStyles.header}>
          <TouchableOpacity
            style={aboutStyles.backButton}
            onLongPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#137CD8" />
          </TouchableOpacity>
          <Text style={aboutStyles.headerTitle}>About FrameIt</Text>
          <TouchableOpacity
            style={aboutStyles.versionButton}
            onLongPress={showVersionInfo}
          >
            <Text style={aboutStyles.versionText}>v{APP_INFO.version}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={aboutStyles.scrollContainer}
          contentContainerStyle={aboutStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={aboutStyles.content}>
            {/* App Logo and Description */}
            <View style={aboutStyles.heroSection}>
              <View style={aboutStyles.logoContainer}>
                <Image
                  source={require("../assets/images/frameit logo_2.gif")}
                  style={aboutStyles.appLogo}
                  resizeMode="contain"
                />
              </View>
              <Text style={aboutStyles.appName}>{APP_INFO.name}</Text>
              <Text style={aboutStyles.appDescription}>
                {APP_INFO.description}
              </Text>
            </View>

            {/* Key Features */}
            <View style={aboutStyles.section}>
              <Text style={aboutStyles.sectionTitle}>Key Features</Text>
              <View style={aboutStyles.featuresGrid}>
                {FEATURES.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} />
                ))}
              </View>
            </View>

            {/* App Information */}
            <View style={aboutStyles.section}>
              <Text style={aboutStyles.sectionTitle}>App Information</Text>

              <InfoCard
                icon="information-circle"
                title="Version"
                subtitle={`${APP_INFO.version} (Build ${APP_INFO.buildNumber})`}
                onLongPress={showVersionInfo}
                color="#137CD8"
              />

              <InfoCard
                icon="calendar"
                title="Release Date"
                subtitle={APP_INFO.releaseDate}
                color="#34C759"
              />

              <InfoCard
                icon="code-working"
                title="Developer"
                subtitle={APP_INFO.developer}
                color="#FF9500"
              />
            </View>

            {/* Team */}
            <View style={aboutStyles.section}>
              <Text style={aboutStyles.sectionTitle}>Meet the Team</Text>
              {TEAM_MEMBERS.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
            </View>

            {/* Legal & Links */}
            <View style={aboutStyles.section}>
              <Text style={aboutStyles.sectionTitle}>Legal & Support</Text>

              <InfoCard
                icon="shield-checkmark"
                title="Privacy Policy"
                subtitle="Learn how we protect your data"
                onLongPress={openPrivacyPolicy}
                color="#5856D6"
              />

              <InfoCard
                icon="document-text"
                title="Terms of Service"
                subtitle="Read our terms and conditions"
                onLongPress={openTermsOfService}
                color="#AF52DE"
              />

              <InfoCard
                icon="globe"
                title="Visit Our Website"
                subtitle="Learn more about FrameIt"
                onLongPress={openWebsite}
                color="#32D74B"
              />

              <InfoCard
                icon="mail"
                title="Contact Support"
                subtitle={APP_INFO.supportEmail}
                onLongPress={openEmail}
                color="#D61A66"
              />
            </View>

            {/* Acknowledgments */}
            <View style={aboutStyles.section}>
              <Text style={aboutStyles.sectionTitle}>Acknowledgments</Text>
              <View style={aboutStyles.acknowledgeCard}>
                <Text style={aboutStyles.acknowledgeText}>
                  {ACKNOWLEDGMENTS_TEXT}
                </Text>
              </View>
            </View>

            {/* Copyright */}
            <View style={aboutStyles.copyrightSection}>
              <Text style={aboutStyles.copyrightText}>{COPYRIGHT_TEXT}</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={aboutStyles.madeWithText}>Made with </Text>
                <Ionicons name="heart" size={16} color="#D61A66" />
                <Text style={aboutStyles.madeWithText}>{MADE_WITH_TEXT}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
