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
            <Ionicons name={icon as any} size={20} color="#007AFF" />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{label}</Text>
              <Text style={styles.settingValue}>{value}</Text>
            </View>
          </View>
          <View style={styles.slideHint}>
            <Text style={styles.slideHintText}>Slide to edit</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
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
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
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
                  <Ionicons name="camera" size={20} color="#007AFF" />
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
                value={userData?.displayName || user?.displayName || "Not set"}
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
                    size={20}
                    color="#007AFF"
                  />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Notifications</Text>
                    <Text style={styles.settingValue}>
                      Manage notification settings
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => router.push("/privacy")}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="shield-outline" size={20} color="#007AFF" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Privacy</Text>
                    <Text style={styles.settingValue}>
                      Privacy and security settings
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
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
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.settingLabel}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => router.push("/about")}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.settingLabel}>About</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
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
          currentDisplayName={userData?.displayName || user?.displayName || ""}
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
    </GestureHandlerRootView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  placeholder: {
    width: 40,
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
  profileImageContainer: {
    alignItems: "center" as const,
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  changeImageButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  changeImageText: {
    color: "#007AFF",
    fontWeight: "600" as const,
    marginLeft: 8,
  },
  avatarContainer: {
    position: "relative" as const,
    marginBottom: 15,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraIconOverlay: {
    position: "absolute" as const,
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  settingItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  settingInfo: {
    marginLeft: 15,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#333",
  },
  settingValue: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  signOutButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    marginTop: 20,
    marginBottom: 40,
  },
  signOutText: {
    color: "#FF3B30",
  },
  // Setting Slider Styles
  settingSlider: {
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
    borderColor: "rgba(0, 122, 255, 0.1)",
  },
  settingSliderContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 20,
    paddingLeft: 70, // Make room for the slide blob
    zIndex: 2,
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
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 1,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
