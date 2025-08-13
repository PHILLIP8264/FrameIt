import React, { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Linking,
  Image,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

// App Information
const APP_INFO = {
  name: "FrameIt",
  version: "1.0.0",
  buildNumber: "100",
  releaseDate: "August 2025",
  description:
    "Discover your city through location-based photo challenges. Complete quests, earn XP, and compete with friends in this exciting augmented reality photography adventure.",
  developer: "FrameIt Team",
  website: "https://frameit-app.com",
  privacyPolicy: "https://frameit-app.com/privacy",
  termsOfService: "https://frameit-app.com/terms",
  supportEmail: "support@frameit-app.com",
};

// Team Members
const TEAM_MEMBERS = [
  {
    name: "Phillip",
    role: "Lead Developer",
    avatar: "code-slash",
    description: "Full-stack developer passionate about mobile experiences",
  },
  {
    name: "Phillip",
    role: "UI/UX Designer",
    avatar: "color-palette",
    description: "Creative designer focused on intuitive user experiences",
  },
  {
    name: "Phillip",
    role: "Product Manager",
    avatar: "phone-portrait",
    description: "Product strategist bringing ideas to life",
  },
  {
    name: "Phillip",
    role: "QA Engineer",
    avatar: "search",
    description: "Quality assurance specialist ensuring smooth experiences",
  },
];

// Features List
const FEATURES = [
  {
    icon: "location",
    title: "Location-Based Challenges",
    description: "Discover unique photo opportunities in your area",
    color: "#FF3B30",
  },
  {
    icon: "camera",
    title: "Photo Quests",
    description: "Complete creative photography challenges",
    color: "#34C759",
  },
  {
    icon: "trophy",
    title: "XP & Achievements",
    description: "Level up and unlock special badges",
    color: "#FFD60A",
  },
  {
    icon: "people",
    title: "Social Features",
    description: "Connect with friends and share your adventures",
    color: "#AF52DE",
  },
  {
    icon: "map",
    title: "Interactive Maps",
    description: "Explore challenges on an interactive map",
    color: "#007AFF",
  },
  {
    icon: "trending-up",
    title: "Leaderboards",
    description: "Compete with other photographers",
    color: "#FF9500",
  },
];

// Animated Info Card Component
interface InfoCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  color?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
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
        if (isDragging && onPress) {
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
    if (!onPress) return;

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
          onPress();
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

  const CardContent = (
    <View style={styles.infoCard}>
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <Ionicons name={icon as any} size={20} color={color} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
        </View>
        {onPress && (
          <View style={styles.slideHint}>
            <Text style={styles.slideHintText}>Slide to open</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </View>
        )}
      </View>

      {onPress && (
        <Animated.View
          style={[
            styles.slideBlob,
            {
              backgroundColor: color,
              transform: [{ translateX: blobTranslateX }, { scale: blobScale }],
            },
          ]}
        >
          <Ionicons name="open-outline" size={20} color="#fff" />
        </Animated.View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            {
              transform: [{ scale: containerScale }],
            },
          ]}
        >
          {CardContent}
        </Animated.View>
      </PanGestureHandler>
    );
  }

  return CardContent;
};

// Team Member Card Component
interface TeamMemberProps {
  member: (typeof TEAM_MEMBERS)[0];
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ member }) => {
  return (
    <View style={styles.teamCard}>
      <View style={styles.avatarContainer}>
        <Ionicons name={member.avatar as any} size={24} color="#007AFF" />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
        <Text style={styles.memberDescription}>{member.description}</Text>
      </View>
    </View>
  );
};

// Feature Card Component
interface FeatureCardProps {
  feature: (typeof FEATURES)[0];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  return (
    <View style={styles.featureCard}>
      <View
        style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}
      >
        <Ionicons name={feature.icon as any} size={24} color={feature.color} />
      </View>
      <View style={styles.featureInfo}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );
};

export default function About() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open the link");
    });
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${APP_INFO.supportEmail}`).catch(() => {
      Alert.alert("Error", "Could not open email client");
    });
  };

  const showVersionInfo = () => {
    Alert.alert(
      "Version Information",
      `Version: ${APP_INFO.version}\nBuild: ${APP_INFO.buildNumber}\nRelease: ${APP_INFO.releaseDate}`,
      [{ text: "OK" }]
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
          <Text style={styles.headerTitle}>About FrameIt</Text>
          <TouchableOpacity
            style={styles.versionButton}
            onPress={showVersionInfo}
          >
            <Text style={styles.versionText}>v{APP_INFO.version}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* App Logo and Description */}
            <View style={styles.heroSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/frameit logo_2.gif")}
                  style={styles.appLogo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appName}>{APP_INFO.name}</Text>
              <Text style={styles.appDescription}>{APP_INFO.description}</Text>
            </View>

            {/* Key Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Features</Text>
              <View style={styles.featuresGrid}>
                {FEATURES.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} />
                ))}
              </View>
            </View>

            {/* App Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>App Information</Text>

              <InfoCard
                icon="information-circle"
                title="Version"
                subtitle={`${APP_INFO.version} (Build ${APP_INFO.buildNumber})`}
                onPress={showVersionInfo}
                color="#007AFF"
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meet the Team</Text>
              {TEAM_MEMBERS.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
            </View>

            {/* Legal & Links */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Legal & Support</Text>

              <InfoCard
                icon="shield-checkmark"
                title="Privacy Policy"
                subtitle="Learn how we protect your data"
                onPress={() => openLink(APP_INFO.privacyPolicy)}
                color="#5856D6"
              />

              <InfoCard
                icon="document-text"
                title="Terms of Service"
                subtitle="Read our terms and conditions"
                onPress={() => openLink(APP_INFO.termsOfService)}
                color="#AF52DE"
              />

              <InfoCard
                icon="globe"
                title="Visit Our Website"
                subtitle="Learn more about FrameIt"
                onPress={() => openLink(APP_INFO.website)}
                color="#32D74B"
              />

              <InfoCard
                icon="mail"
                title="Contact Support"
                subtitle={APP_INFO.supportEmail}
                onPress={openEmail}
                color="#FF3B30"
              />
            </View>

            {/* Acknowledgments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acknowledgments</Text>
              <View style={styles.acknowledgeCard}>
                <Text style={styles.acknowledgeText}>
                  Special thanks to all our beta testers, the open-source
                  community, and everyone who helped make FrameIt possible.
                  Built with React Native, Expo, and Firebase.
                </Text>
              </View>
            </View>

            {/* Copyright */}
            <View style={styles.copyrightSection}>
              <Text style={styles.copyrightText}>
                © 2025 FrameIt Team. All rights reserved.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={styles.madeWithText}>Made with </Text>
                <Ionicons name="heart" size={16} color="#FF3B30" />
                <Text style={styles.madeWithText}>
                  {" "}
                  for photography enthusiasts
                </Text>
              </View>
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
  versionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600" as const,
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
  heroSection: {
    alignItems: "center" as const,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  appLogo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center" as const,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 15,
  },
  infoCard: {
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
  cardContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 20,
    paddingLeft: 70,
    zIndex: 2,
  },
  cardLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  cardInfo: {
    marginLeft: 15,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  slideHint: {
    alignItems: "flex-end" as const,
    opacity: 0.7,
  },
  slideHintText: {
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "500" as const,
    marginBottom: 2,
    letterSpacing: 0.3,
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
  featuresGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
  },
  featureCard: {
    width: "48%" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center" as const,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 12,
  },
  featureInfo: {
    alignItems: "center" as const,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
    textAlign: "center" as const,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center" as const,
    lineHeight: 16,
  },
  teamCard: {
    flexDirection: "row" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F0F0",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
  },
  memberRole: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500" as const,
    marginTop: 2,
  },
  memberDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    lineHeight: 18,
  },
  acknowledgeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  acknowledgeText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center" as const,
  },
  copyrightSection: {
    alignItems: "center" as const,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center" as const,
  },
  madeWithText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center" as const,
    marginTop: 4,
  },
};
