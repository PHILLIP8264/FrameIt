import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  Vibration,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "../../contexts/AuthContext";
import { FirestoreService } from "../../services";
import StorageService from "../../services/StorageService";
import SwipeButton from "../shared/SwipeButton";
import { StandardButton } from "../shared/StandardButton";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  commonStyles,
} from "../../styles/commonStyles";

const { height: screenHeight } = Dimensions.get("window");

// Enhanced haptic feedback utility with more precise vibration patterns
const hapticFeedback = (
  type: "light" | "medium" | "heavy" | "success" | "error" = "light"
) => {
  try {
    if (type === "light") Vibration.vibrate(8);
    else if (type === "medium") Vibration.vibrate([0, 15]);
    else if (type === "heavy") Vibration.vibrate([0, 25]);
    else if (type === "success") Vibration.vibrate([0, 10, 50, 10]);
    else if (type === "error") Vibration.vibrate([0, 20, 100, 20, 100]);
  } catch {
    console.log("Haptic feedback not available");
  }
};

// Type definitions
interface ModernButtonProps {
  onLongPress: () => void;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  style?: any;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

// Enhanced Modern Button with improved animations and visual effects
const ModernButton = ({
  onLongPress,
  children,
  variant = "primary",
  style,
  icon,
  disabled = false,
}: ModernButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      hapticFeedback("medium");
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const variants = {
    primary: {
      gradient: ["#137CD8", "#0F6BB8"] as const,
      color: "white",
      shadowColor: "#137CD8",
    },
    secondary: {
      gradient: ["#FFFFFF", "#F8F9FA"] as const,
      color: "#1F2937",
      shadowColor: "rgba(0,0,0,0.1)",
    },
    danger: {
      gradient: ["#DC2626", "#B91C1C"] as const,
      color: "white",
      shadowColor: "#DC2626",
    },
    ghost: {
      gradient: ["transparent", "transparent"] as const,
      color: "#137CD8",
      shadowColor: "transparent",
    },
  };

  const currentVariant = variants[variant];

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={currentVariant.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20,
          shadowColor: currentVariant.shadowColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: disabled ? 0 : 0.15,
          shadowRadius: 12,
          elevation: disabled ? 0 : 6,
        }}
      >
        <Pressable
          onLongPress={disabled ? undefined : onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: variant === "secondary" ? 1 : 0,
            borderColor: variant === "secondary" ? "#E5E7EB" : "transparent",
            minHeight: 48,
          }}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={currentVariant.color}
              style={{ marginRight: children ? 8 : 0 }}
            />
          )}
          {children && (
            <Text
              style={{
                color: currentVariant.color,
                fontSize: 16,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}
            >
              {children}
            </Text>
          )}
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
};

interface ProfilePhotoModalProps {
  visible: boolean;
  onClose: () => void;
  currentPhotoURL?: string;
  onPhotoUpdated: (newPhotoURL: string) => void;
}

export interface ProfilePhotoModalRef {
  resetSwipeButton: () => void;
}

const ProfilePhotoModal = forwardRef<
  ProfilePhotoModalRef,
  ProfilePhotoModalProps
>(({ visible, onClose, currentPhotoURL, onPhotoUpdated }, ref) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const swipeButtonRef = useRef<any>(null);

  // Enhanced animation values
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Modal entrance animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
          delay: 100,
        }),
      ]).start();
    } else {
      // Modal exit animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, scaleAnim]);

  useImperativeHandle(ref, () => ({
    resetSwipeButton: () => {
      if (swipeButtonRef.current) {
        swipeButtonRef.current.resetToCenter();
      }
    },
  }));

  const openCamera = async () => {
    try {
      hapticFeedback("medium");
      // Request camera permission
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        hapticFeedback("error");
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to take photos for your profile.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => {} },
          ]
        );
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!result.canceled) {
        hapticFeedback("success");
        const imageUri = result.assets[0].uri;
        await uploadPhoto(imageUri);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      hapticFeedback("error");
      Alert.alert("Camera Error", "Unable to access camera. Please try again.");
    }
  };

  const openGallery = async () => {
    try {
      hapticFeedback("medium");
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        hapticFeedback("success");
        const imageUri = result.assets[0].uri;
        await uploadPhoto(imageUri);
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
      hapticFeedback("error");
      Alert.alert(
        "Gallery Error",
        "Unable to access photo library. Please try again."
      );
    }
  };
  // Function to delete old profile photo from storage
  const deleteOldProfilePhoto = async (photoURL: string) => {
    try {
      if (photoURL && photoURL.includes("firebase")) {
        // Extract the file path from the URL
        const path = photoURL.split("/o/")[1]?.split("?")[0];
        if (path) {
          const decodedPath = decodeURIComponent(path);
          await StorageService.deleteFile(decodedPath);
          console.log("Old profile photo deleted:", decodedPath);
        }
      }
    } catch (error) {
      console.error("Error deleting old profile photo:", error);
    }
  };

  const uploadPhoto = async (imageUri?: string) => {
    const imageToUpload = imageUri || selectedImage;
    if (!imageToUpload || !user?.uid) {
      hapticFeedback("error");
      Alert.alert("No Image Selected", "Please select an image first");
      return;
    }

    setLoading(true);
    hapticFeedback("medium");

    try {
      // Get current user data to check for existing profile photo
      const currentUser = await FirestoreService.getUser(user.uid);
      const oldPhotoURL = currentUser?.profileImageUrl;

      // Create a unique filename for the profile photo
      const filename = `profile-photos/${user.uid}_${Date.now()}.jpg`;

      // Convert URI to blob for upload with memory management
      let response, blob;
      try {
        response = await fetch(imageToUpload);

        // Check response size to prevent memory issues
        const contentLength = response.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
          // 10MB limit
          throw new Error("Image too large. Please select a smaller image.");
        }

        blob = await response.blob();

        // Additional memory management - release response reference
        response = null;
      } catch (fetchError) {
        console.error("Error processing image:", fetchError);
        throw new Error("Failed to process image. Please try again.");
      }

      // Upload to Firebase Storage
      const downloadURL = await StorageService.uploadFile(filename, blob);

      // Clean up blob reference immediately after upload
      blob = null;

      // Delete old profile photo if it exists
      if (oldPhotoURL) {
        await deleteOldProfilePhoto(oldPhotoURL);
      }

      // Update user profile in Firestore using setUser with merge
      if (currentUser) {
        await FirestoreService.setUser(user.uid, {
          ...currentUser,
          profileImageUrl: downloadURL,
        });
      }

      // Call the callback to update the parent component
      onPhotoUpdated(downloadURL);

      // Success feedback
      hapticFeedback("success");

      // Close modal and reset
      if (imageToUpload !== selectedImage) {
        onClose();
      } else {
        setSelectedImage(null);
        onClose();
      }

      Alert.alert(
        "Photo Updated! 📸",
        "Your profile photo has been updated successfully!",
        [{ text: "Great!", style: "default" }]
      );
    } catch (error) {
      console.error("Error uploading photo:", error);
      hapticFeedback("error");
      Alert.alert(
        "Upload Failed",
        "Unable to upload your photo. Please check your connection and try again.",
        [{ text: "Try Again", style: "default" }]
      );

      // Reset the swipe button after error
      setTimeout(() => {
        if (swipeButtonRef.current) {
          swipeButtonRef.current.resetToCenter();
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = async () => {
    if (!user?.uid) return;

    hapticFeedback("medium");
    Alert.alert(
      "Remove Profile Photo? 🗑️",
      "This will permanently delete your current profile photo. You can always add a new one later.",
      [
        {
          text: "Keep Photo",
          style: "cancel",
          onPress: () => hapticFeedback("light"),
        },
        {
          text: "Remove Photo",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            hapticFeedback("heavy");
            try {
              // Get current user data to get the photo URL for deletion
              const currentUser = await FirestoreService.getUser(user.uid);
              const oldPhotoURL = currentUser?.profileImageUrl;

              // Delete the photo from storage if it exists
              if (oldPhotoURL) {
                await deleteOldProfilePhoto(oldPhotoURL);
              }

              // Update user profile in Firestore to remove photo
              if (currentUser) {
                await FirestoreService.setUser(user.uid, {
                  ...currentUser,
                  profileImageUrl: "",
                });
              }

              // Call the callback to update the parent component
              onPhotoUpdated("");

              hapticFeedback("success");
              onClose();
              Alert.alert(
                "Photo Removed! ✅",
                "Your profile photo has been removed successfully.",
                [{ text: "OK", style: "default" }]
              );
            } catch (error) {
              console.error("Error removing photo:", error);
              hapticFeedback("error");
              Alert.alert(
                "Remove Failed",
                "Unable to remove your photo. Please try again.",
                [{ text: "Try Again", style: "default" }]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    hapticFeedback("light");
    setSelectedImage(null);
    onClose();
  };

  console.log("Profile Photo Modal");
  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          style={[
            { flex: 1 },
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[
              "rgba(79, 70, 229, 0.05)",
              "rgba(79, 70, 229, 0.02)",
              "rgba(255, 255, 255, 0.95)",
            ]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Enhanced Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.headerLeft}>
                <StandardButton
                  onLongPress={handleClose}
                  variant="secondary"
                  size="small"
                  title="Cancel"
                />
              </View>
              <View style={styles.headerCenter}>
                <Text style={styles.title}>Profile Photo</Text>
              </View>
              <View style={styles.headerRight} />
            </Animated.View>

            <Animated.ScrollView
              style={[
                styles.content,
                {
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* Enhanced Photo Preview */}
              <Animated.View
                style={[
                  styles.photoPreview,
                  {
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.photoContainer}>
                  {currentPhotoURL ? (
                    <Image
                      source={{ uri: currentPhotoURL }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.placeholderPhoto}>
                      <Ionicons name="person" size={40} color="#D61A66" />
                      <Text style={styles.placeholderText}>Add Photo</Text>
                    </View>
                  )}
                  <View style={styles.photoRing} />
                </View>
                <Text style={styles.previewHint}>
                  {currentPhotoURL
                    ? "Your current profile photo"
                    : "Add your first profile photo"}
                </Text>
              </Animated.View>

              {/* Enhanced Swipe Section */}
              <Animated.View
                style={[
                  styles.swipeSection,
                  {
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.swipeHeader}>
                  <Ionicons name="camera" size={20} color="#137CD8" />
                  <Text style={styles.swipeTitle}>Choose Photo Source</Text>
                  <Ionicons name="images" size={20} color="#137CD8" />
                </View>

                <Text style={styles.swipeInstructions}>
                  Swipe left for Camera or right for Photo Library
                </Text>

                <SwipeButton
                  ref={swipeButtonRef}
                  leftText="Camera"
                  rightText="Library"
                  centerText="Swipe Me"
                  onSwipeLeft={openCamera}
                  onSwipeRight={openGallery}
                  disabled={loading}
                  instructionText="Swipe to select your photo source"
                />

                {currentPhotoURL && (
                  <Animated.View
                    style={[
                      styles.removeSection,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <StandardButton
                      onLongPress={removePhoto}
                      variant="danger"
                      icon="trash-outline"
                      title="Remove Current Photo"
                      style={{ marginTop: spacing.lg }}
                    />
                  </Animated.View>
                )}
              </Animated.View>

              {/* Loading Overlay with Enhanced Design */}
              {loading && (
                <Animated.View
                  style={[
                    styles.loadingOverlay,
                    {
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingContent}>
                      <ActivityIndicator size="large" color="#137CD8" />
                      <Text style={styles.loadingText}>
                        {selectedImage
                          ? "Uploading your photo..."
                          : "Processing..."}
                      </Text>
                      <Text style={styles.loadingSubtext}>
                        Please wait a moment
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
            </Animated.ScrollView>
          </LinearGradient>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
});

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start" as const,
  },
  headerCenter: {
    flex: 2,
    alignItems: "center" as const,
  },
  headerRight: {
    flex: 1,
  },
  title: {
    ...typography.h5,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  photoPreview: {
    alignItems: "center" as const,
    marginBottom: spacing.xxxl,
    paddingVertical: spacing.lg,
  },
  photoContainer: {
    position: "relative" as const,
    marginBottom: spacing.lg,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.circle,
    borderWidth: 3,
    borderColor: colors.primary,
    ...shadows.medium,
  },
  placeholderPhoto: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.backgroundLight,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed" as const,
    ...shadows.small,
  },
  placeholderText: {
    ...typography.caption,
    fontWeight: "600" as const,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  photoRing: {
    position: "absolute" as const,
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
  previewHint: {
    textAlign: "center" as const,
    ...typography.body2,
    color: colors.secondary,
    fontWeight: "500" as const,
    maxWidth: 280,
  },
  swipeSection: {
    marginTop: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.medium,
  },
  swipeHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  swipeTitle: {
    ...typography.subtitle1,
    color: colors.text,
    textAlign: "center" as const,
  },
  swipeInstructions: {
    ...typography.caption,
    color: colors.secondary,
    textAlign: "center" as const,
    marginBottom: spacing.lg,
  },
  removeSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  loadingOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: colors.overlayLight,
  },
  loadingContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    margin: spacing.xxl,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  loadingContent: {
    alignItems: "center" as const,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.subtitle1,
    color: colors.text,
    textAlign: "center" as const,
  },
  loadingSubtext: {
    ...typography.caption,
    color: colors.secondary,
    textAlign: "center" as const,
    fontWeight: "500" as const,
  },
};

ProfilePhotoModal.displayName = "ProfilePhotoModal";

export default ProfilePhotoModal;
