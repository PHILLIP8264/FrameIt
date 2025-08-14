import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Animated,
  Image,
  ImageBackground,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types/database";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { DisplayNameModal } from "../components/modals/DisplayNameModal";
import { EmailModal } from "../components/modals/EmailModal";
import { PasswordModal } from "../components/modals/PasswordModal";
import ProfilePhotoModal, {
  ProfilePhotoModalRef,
} from "../components/modals/ProfilePhotoModal";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

// SettingSlider Component
interface SettingSliderProps {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
}

const SettingSlider: React.FC<SettingSliderProps> = ({
  icon,
  label,
  value,
  onPress,
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

          // Scale the blob slightly as it moves
          const scaleValue = 1 + (clampedTranslation / maxTranslation) * 0.1;
          blobScale.setValue(scaleValue);
        }
      },
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
      // Subtle scale up when starting to drag
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
        // Trigger action with enhanced animation
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
        // Return to start with enhanced animation
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
          styles.settingSlider,
          {
            transform: [{ translateX }, { scale: containerScale }],
          },
        ]}
      >
        <View style={styles.settingSliderContent}>
          <View style={styles.settingLeft}>
            <Ionicons name={icon as any} size={22} color="#4F46E5" />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{label}</Text>
              <Text style={styles.settingValue}>{value}</Text>
            </View>
          </View>
          <View style={styles.slideHint}>
            <Text style={styles.slideHintText}>Slide to edit</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </View>

        {/* Sliding blob */}
        <Animated.View
          style={[
            styles.slideBlob,
            {
              transform: [{ translateX: blobTranslateX }, { scale: blobScale }],
            },
          ]}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default function Settings() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal visibility states
  const [displayNameModalVisible, setDisplayNameModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [profilePhotoModalVisible, setProfilePhotoModalVisible] =
    useState(false);

  // Profile photo modal ref
  const profilePhotoModalRef = useRef<ProfilePhotoModalRef>(null);

  // Real-time listener for user data
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as User);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Sync Firebase Auth email changes to Firestore
  useEffect(() => {
    if (!user?.uid || !userData) return;

    // Check if Firebase Auth email differs from Firestore email
    if (user.email && user.email !== userData.email) {
      const syncEmail = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, {
            email: user.email,
            updatedAt: new Date(),
          });
          // Email synced to Firestore successfully
        } catch (error) {
          console.error("Error syncing email to Firestore:", error);
        }
      };

      syncEmail();
    }
  }, [user?.email, userData?.email, user?.uid]);

  const handleProfileImageChange = () => {
    setProfilePhotoModalVisible(true);
  };

  const handlePhotoUpdated = (newPhotoURL: string) => {
    // Update the local userData state to reflect the change immediately
    if (userData) {
      setUserData({
        ...userData,
        profileImageUrl: newPhotoURL,
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/blank.png")}
        style={styles.container}
        imageStyle={styles.backgroundImage}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#4F46E5" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Profile Image Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Picture</Text>
                <View style={styles.profileImageContainer}>
                  <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={handleProfileImageChange}
                  >
                    {userData?.profileImageUrl ? (
                      <Image
                        source={{ uri: userData.profileImageUrl }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {getInitials(
                            userData?.displayName || user?.displayName || "User"
                          )}
                        </Text>
                      </View>
                    )}
                    <View style={styles.cameraIconOverlay}>
                      <Ionicons name="camera" size={16} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={handleProfileImageChange}
                  >
                    <Ionicons name="camera" size={22} color="#FFFFFF" />
                    <Text style={styles.changeImageText}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Account Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>

                <SettingSlider
                  icon="person-outline"
                  label="Display Name"
                  value={
                    userData?.displayName || user?.displayName || "Not set"
                  }
                  onPress={() => setDisplayNameModalVisible(true)}
                />

                <SettingSlider
                  icon="mail-outline"
                  label="Email Address"
                  value={userData?.email || user?.email || "Not set"}
                  onPress={() => setEmailModalVisible(true)}
                />

                <SettingSlider
                  icon="lock-closed-outline"
                  label="Password"
                  value="••••••••"
                  onPress={() => setPasswordModalVisible(true)}
                />
              </View>

              {/* App Preferences */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>

                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => router.push("/notifications")}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons
                      name="notifications-outline"
                      size={22}
                      color="#4F46E5"
                    />
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Notifications</Text>
                      <Text style={styles.settingValue}>
                        Manage notification settings
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => router.push("/privacy")}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="shield-outline" size={22} color="#4F46E5" />
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Privacy</Text>
                      <Text style={styles.settingValue}>
                        Privacy and security settings
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              </View>

              {/* Support */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>

                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => router.push("/help")}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons
                      name="help-circle-outline"
                      size={22}
                      color="#4F46E5"
                    />
                    <Text style={styles.settingLabel}>Help & Support</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => router.push("/about")}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons
                      name="information-circle-outline"
                      size={22}
                      color="#4F46E5"
                    />
                    <Text style={styles.settingLabel}>About</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              </View>

              {/* Sign Out */}
              <TouchableOpacity
                style={[styles.settingItem, styles.signOutButton]}
                onPress={async () => {
                  try {
                    await logout();
                    router.replace("/login");
                  } catch (error) {
                    console.error("Error signing out:", error);
                  }
                }}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.settingLabel, styles.signOutText]}>
                    Sign Out
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Individual Modals */}
          <DisplayNameModal
            visible={displayNameModalVisible}
            onClose={() => setDisplayNameModalVisible(false)}
            currentDisplayName={
              userData?.displayName || user?.displayName || ""
            }
          />

          <EmailModal
            visible={emailModalVisible}
            onClose={() => setEmailModalVisible(false)}
            currentEmail={userData?.email || user?.email || ""}
          />

          <PasswordModal
            visible={passwordModalVisible}
            onClose={() => setPasswordModalVisible(false)}
          />

          <ProfilePhotoModal
            ref={profilePhotoModalRef}
            visible={profilePhotoModalVisible}
            onClose={() => setProfilePhotoModalVisible(false)}
            onPhotoUpdated={handlePhotoUpdated}
          />
        </SafeAreaView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backgroundImage: {
    opacity: 1,
    resizeMode: "cover" as const,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "transparent",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500" as const,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1F2937",
    letterSpacing: 0.3,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  profileImageContainer: {
    alignItems: "center" as const,
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4F46E5",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 20,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  changeImageButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  changeImageText: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
    marginLeft: 8,
    fontSize: 16,
  },
  avatarContainer: {
    position: "relative" as const,
    marginBottom: 20,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  cameraIconOverlay: {
    position: "absolute" as const,
    bottom: 8,
    right: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  settingItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  settingLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  settingInfo: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#1F2937",
    letterSpacing: 0.1,
  },
  settingValue: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18,
  },
  signOutButton: {
    backgroundColor: "#FEF2F2",
    marginTop: 24,
    marginBottom: 48,
    borderColor: "#FECACA",
  },
  signOutText: {
    color: "#DC2626",
    fontWeight: "600" as const,
  },
  // Setting Slider Styles
  settingSlider: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden" as const,
    position: "relative" as const,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  settingSliderContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 24,
    paddingLeft: 80, // Make room for the slide blob
    zIndex: 2,
    minHeight: 72,
  },
  slideHint: {
    alignItems: "flex-end" as const,
    opacity: 0.8,
  },
  slideHintText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "600" as const,
    marginBottom: 2,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  slideBlob: {
    position: "absolute" as const,
    left: 8,
    top: 8,
    bottom: 8,
    width: 64,
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 1,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};
