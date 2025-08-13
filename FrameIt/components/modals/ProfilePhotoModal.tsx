import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "../../contexts/AuthContext";
import FirestoreService from "../../services/FirestoreService";
import StorageService from "../../services/StorageService";
import SwipeButton from "../SwipeButton";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const swipeButtonRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    resetSwipeButton: () => {
      if (swipeButtonRef.current) {
        swipeButtonRef.current.resetToCenter();
      }
    },
  }));

  const openImagePicker = () => {
    console.log("openImagePicker called");
    Alert.alert(
      "Select Profile Photo",
      "Choose how you want to select your new profile photo",
      [
        {
          text: "Camera",
          onPress: () => {
            console.log("Camera option selected");
            openCamera();
          },
        },
        {
          text: "Photo Library",
          onPress: () => {
            console.log("Photo Library option selected");
            openGallery();
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const openCamera = async () => {
    console.log("openCamera called");
    try {
      // Request camera permission
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera is required!"
        );
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      console.log("Camera result:", result);

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        console.log("Selected image set to:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const openGallery = async () => {
    console.log("openGallery called");
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      console.log("Gallery result:", result);

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        console.log("Selected image set to:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
      Alert.alert("Error", "Failed to open photo library");
    }
  };
  const uploadPhoto = async () => {
    if (!selectedImage || !user?.uid) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setLoading(true);

    try {
      // Create a unique filename for the profile photo
      const filename = `profile-photos/${user.uid}_${Date.now()}.jpg`;

      // Convert URI to blob for upload
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const downloadURL = await StorageService.uploadFile(filename, blob);

      // Update user profile in Firestore using setUser with merge
      const currentUser = await FirestoreService.getUser(user.uid);
      if (currentUser) {
        await FirestoreService.setUser(user.uid, {
          ...currentUser,
          profileImageUrl: downloadURL,
        });
      }

      // Call the callback to update the parent component
      onPhotoUpdated(downloadURL);

      // Close modal and reset
      setSelectedImage(null);
      onClose();

      Alert.alert("Success", "Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "Failed to upload profile photo. Please try again.");

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

    Alert.alert(
      "Remove Profile Photo",
      "Are you sure you want to remove your profile photo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Update user profile in Firestore to remove photo
              const currentUser = await FirestoreService.getUser(user.uid);
              if (currentUser) {
                await FirestoreService.setUser(user.uid, {
                  ...currentUser,
                  profileImageUrl: "",
                });
              }

              // Call the callback to update the parent component
              onPhotoUpdated("");

              onClose();
              Alert.alert("Success", "Profile photo removed successfully!");
            } catch (error) {
              console.error("Error removing photo:", error);
              Alert.alert(
                "Error",
                "Failed to remove profile photo. Please try again."
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
    setSelectedImage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Profile Photo</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.content}>
            {/* Current/Selected Photo Preview */}
            <View style={styles.photoPreview}>
              <View style={styles.photoContainer}>
                {selectedImage ? (
                  <>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.previewImage}
                    />
                    <View style={styles.newPhotoBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#fff"
                      />
                    </View>
                  </>
                ) : currentPhotoURL ? (
                  <Image
                    source={{ uri: currentPhotoURL }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.placeholderPhoto}>
                    <Ionicons name="person" size={64} color="#adb5bd" />
                    <Text style={styles.placeholderText}>No Photo</Text>
                  </View>
                )}
              </View>
              {!selectedImage && (
                <Text style={styles.previewHint}>
                  {currentPhotoURL
                    ? "Current profile photo"
                    : "Add a profile photo to personalize your account"}
                </Text>
              )}
              {selectedImage && (
                <Text style={styles.previewHint}>
                  New photo selected - swipe below to upload
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={openImagePicker}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="camera" size={24} color="#007AFF" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>
                    {selectedImage ? "Change Photo" : "Select Photo"}
                  </Text>
                  <Text style={styles.actionSubtext}>
                    Choose from camera or gallery
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
              </TouchableOpacity>

              {(currentPhotoURL || selectedImage) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={removePhoto}
                >
                  <View
                    style={[
                      styles.actionIconContainer,
                      styles.removeIconContainer,
                    ]}
                  >
                    <Ionicons name="trash" size={24} color="#FF3B30" />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={[styles.actionText, styles.removeText]}>
                      Remove Photo
                    </Text>
                    <Text style={[styles.actionSubtext, styles.removeSubtext]}>
                      Delete current profile photo
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ffb3b3" />
                </TouchableOpacity>
              )}
            </View>

            {/* Upload Button */}
            {selectedImage && (
              <View style={styles.uploadSection}>
                <View style={styles.uploadHeader}>
                  <View style={styles.uploadIconContainer}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={24}
                      color="#007AFF"
                    />
                  </View>
                  <Text style={styles.uploadTitle}>Ready to Upload</Text>
                </View>
                <Text style={styles.uploadHint}>
                  Swipe right to save your new profile photo
                </Text>
                <SwipeButton
                  ref={swipeButtonRef}
                  leftText="Cancel"
                  rightText="Upload"
                  centerText="Swipe Me"
                  onSwipeLeft={() => {
                    setSelectedImage(null);
                  }}
                  onSwipeRight={uploadPhoto}
                  disabled={loading}
                  instructionText="Swipe right to upload your new profile photo"
                />
              </View>
            )}

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                  {selectedImage ? "Uploading photo..." : "Removing photo..."}
                </Text>
              </View>
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
});

const { width } = Dimensions.get("window");

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecef",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#007AFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  photoPreview: {
    alignItems: "center" as const,
    marginBottom: 48,
    paddingVertical: 20,
  },
  photoContainer: {
    position: "relative" as const,
    marginBottom: 16,
  },
  previewImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  newPhotoBadge: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    backgroundColor: "#34C759",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  placeholderPhoto: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#f8f9fa",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 3,
    borderColor: "#dee2e6",
    borderStyle: "dashed" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6c757d",
    marginTop: 4,
  },
  previewHint: {
    textAlign: "center" as const,
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "400" as const,
    lineHeight: 20,
    maxWidth: 280,
  },
  actions: {
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecef",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 64,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f9ff",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  removeIconContainer: {
    backgroundColor: "#fef2f2",
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionSubtext: {
    fontSize: 13,
    color: "#8e8e93",
    fontWeight: "400" as const,
  },
  removeSubtext: {
    color: "#ff9999",
  },
  removeButton: {
    borderColor: "#ffebee",
    backgroundColor: "#fef7f7",
    shadowColor: "#FF3B30",
    shadowOpacity: 0.08,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#007AFF",
    letterSpacing: 0.2,
  },
  removeText: {
    color: "#FF3B30",
  },
  uploadSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#e8ecef",
  },
  uploadHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 12,
    gap: 12,
  },
  uploadIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f9ff",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    letterSpacing: 0.2,
  },
  uploadHint: {
    textAlign: "center" as const,
    fontSize: 15,
    color: "#6c757d",
    marginBottom: 20,
    fontWeight: "500" as const,
    letterSpacing: 0.3,
  },
  swipeButton: {
    marginTop: 16,
  },
  loadingOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(248, 249, 250, 0.95)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 16,
    backdropFilter: "blur(10px)",
  },
  loadingText: {
    fontSize: 16,
    color: "#495057",
    textAlign: "center" as const,
    fontWeight: "500" as const,
    letterSpacing: 0.2,
  },
};

export default ProfilePhotoModal;
