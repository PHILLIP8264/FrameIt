import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker, Circle } from "../shared/PlatformMapView";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import SwipeButton from "../shared/SwipeButton";
import SimpleSwipeButton from "../shared/SimpleSwipeButton";
import QuestLocationSwipeButton from "./QuestLocationSwipeButton";
import ModerationStatusModal from "../modals/ModerationStatusModal";
import { Quest, QuestAttempt } from "../../types/database";
import { FirestoreService } from "../../services";
import NotificationService from "../../services/NotificationService";
import TagUnlockService from "../../services/TagUnlockService";
import AchievementService from "../../services/AchievementService";
import LocationService from "../../services/LocationService";
import StorageService from "../../services/StorageService";
import { useAuth } from "../../contexts/AuthContext";
import { QuestMapView } from "./QuestMapViewSimple";

interface QuestNavigationMapProps {
  quest: Quest;
  attempt: QuestAttempt;
  onQuestComplete: () => void;
  onQuestCancel: () => void;
  onExitMap: () => void;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const { width, height } = Dimensions.get("window");

export default function QuestNavigationMap({
  quest,
  attempt,
  onQuestComplete,
  onQuestCancel,
  onExitMap,
}: QuestNavigationMapProps) {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [isInQuestArea, setIsInQuestArea] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [submittingPhoto, setSubmittingPhoto] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState<any>(null);

  // Moderation modal state
  const [moderationModal, setModerationModal] = useState({
    visible: false,
    submissionId: undefined as string | undefined,
    status: "submitting" as
      | "submitting"
      | "pending_review"
      | "approved"
      | "rejected",
  });

  useEffect(() => {
    initializeLocation();
    return () => {
      if (locationWatcher) {
        LocationService.clearWatch(locationWatcher);
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      checkProximityToQuest();
    }
  }, [userLocation]);

  const initializeLocation = async () => {
    try {
      const hasPermission = await LocationService.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          "Location Required",
          "Please enable location access to navigate to quests."
        );
        return;
      }

      // Get initial location
      const location = await LocationService.getCurrentLocation();
      setUserLocation(location);

      // Start watching location changes
      const watcher = LocationService.watchLocation(
        (newLocation) => {
          setUserLocation(newLocation);
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
      setLocationWatcher(watcher);
    } catch (error) {
      console.error("Failed to initialize location:", error);
      Alert.alert("Error", "Failed to get your location. Please try again.");
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const checkProximityToQuest = () => {
    if (!userLocation) return;

    const distanceToQuest = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      quest.coordinates.latitude,
      quest.coordinates.longitude
    );

    setDistance(distanceToQuest);
    setIsInQuestArea(distanceToQuest <= quest.radius);
  };

  const openExternalMap = () => {
    const { latitude, longitude } = quest.coordinates;
    const label = encodeURIComponent(quest.title);

    const url = Platform.select({
      ios: `maps://app?saddr=Current%20Location&daddr=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const webUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          Linking.openURL(webUrl);
        }
      });
    }
  };

  const handleTakePhoto = async () => {
    if (!isInQuestArea) {
      Alert.alert(
        "Not in Quest Area",
        "Please get closer to the quest location to take a photo."
      );
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant camera permission to take photos for quests."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && user) {
        setSubmittingPhoto(true);

        try {
          // Upload photo with content moderation
          const filename = `quest-submissions/${user.uid}/${
            quest.questId
          }_${Date.now()}.jpg`;

          // Convert URI to blob for upload with memory management
          let response, blob;
          try {
            response = await fetch(result.assets[0].uri);

            // Check response size to prevent memory issues
            const contentLength = response.headers.get("content-length");
            if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
              // 10MB limit
              throw new Error(
                "Image too large. Please select a smaller image."
              );
            }

            blob = await response.blob();

            // Additional memory management - release response reference
            response = null;
          } catch (fetchError) {
            console.error("Error processing image:", fetchError);
            throw new Error("Failed to process image. Please try again.");
          }

          // Show uploading modal
          setModerationModal({
            visible: true,
            submissionId: undefined,
            status: "submitting",
          });

          // Upload with moderation
          const uploadResult = await StorageService.uploadWithModeration(
            filename,
            blob,
            user.uid,
            quest.questId
          );

          // Handle moderation result
          if (uploadResult.status === "rejected") {
            setSubmittingPhoto(false);
            console.log("Setting moderation modal for automatic rejection");
            setModerationModal({
              visible: true,
              submissionId: undefined,
              status: "rejected",
            });
            return;
          }

          // Create submission
          const submissionId = `${attempt.attemptId}_${Date.now()}`;
          const submission = {
            subId: submissionId,
            userId: user.uid,
            subUrl: uploadResult.downloadURL,
            questId: quest.questId,
            timestamp: new Date(),
            votes: 0,
            moderationStatus: uploadResult.status as
              | "approved"
              | "pending_review",
            moderationResult: uploadResult.moderationResult,
          };

          await FirestoreService.addSubmission(submission);
          await FirestoreService.completeQuestAttempt(
            attempt.attemptId,
            submissionId
          );

          if (uploadResult.status === "pending_review") {
            setSubmittingPhoto(false);
            console.log(
              "Setting moderation modal for manual review with submissionId:",
              submissionId
            );
            setModerationModal({
              visible: true,
              submissionId: submissionId,
              status: "pending_review",
            });
            return;
          }

          // Photo approved - proceed normally
          await awardQuestXP();
          setSubmittingPhoto(false);
          setModerationModal({
            visible: true,
            submissionId: submissionId,
            status: "approved",
          });
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          setSubmittingPhoto(false);

          // Check if it's a moderation error
          if (
            uploadError instanceof Error &&
            uploadError.message?.includes("Content rejected")
          ) {
            console.log("Setting moderation modal for error case rejection");
            setModerationModal({
              visible: true,
              submissionId: undefined,
              status: "rejected",
            });
          } else {
            Alert.alert("Error", "Failed to upload photo. Please try again.");
          }
        }
      }
    } catch (error) {
      console.error("Error completing quest:", error);
      setSubmittingPhoto(false);
      Alert.alert("Error", "Failed to complete quest. Please try again.");
    }
  };

  const awardQuestXP = async () => {
    if (!user?.uid) return;

    try {
      const currentUser = await FirestoreService.getUser(user.uid);
      if (!currentUser) return;

      // Get system configuration for XP multiplier
      const config = await FirestoreService.getSystemConfiguration();
      const xpMultiplier = config.xpMultiplier;

      let totalXP = quest.xpReward;

      // Calculate bonuses
      const timeElapsed = Date.now() - new Date(attempt.startedAt).getTime();
      const hoursElapsed = timeElapsed / (1000 * 60 * 60);

      // Speed bonus (if completed within 2 hours)
      if (hoursElapsed <= 2 && quest.rewards?.bonusXP?.speedBonus > 0) {
        totalXP += quest.rewards.bonusXP.speedBonus;
      }

      // First time bonus
      const completedQuests = await FirestoreService.getCompletedQuests(
        user.uid
      );
      const isFirstTime = !completedQuests.some(
        (cq) => cq.questId === quest.questId
      );
      if (isFirstTime && quest.rewards?.bonusXP?.firstTime > 0) {
        totalXP += quest.rewards.bonusXP.firstTime;
      }

      // Apply system XP multiplier
      totalXP = Math.floor(totalXP * xpMultiplier);

      // Update user XP
      const newXP = (currentUser.xp || 0) + totalXP;
      const newLevel = calculateLevel(newXP);

      // Update both current XP and total XP for tag requirements
      const newTotalXP = (currentUser.totalXP || currentUser.xp || 0) + totalXP;

      await FirestoreService.setUser(user.uid, {
        ...currentUser,
        xp: newXP,
        totalXP: newTotalXP,
        level: newLevel,
      });

      // Add to completed quests
      await FirestoreService.addCompletedQuest(user.uid, {
        questId: quest.questId,
        completedAt: new Date(),
        xpEarned: totalXP,
      });

      // Update team challenge progress for quest completion
      await FirestoreService.updateUserQuestProgress(user.uid);

      // Update team challenge progress for XP gained
      await FirestoreService.updateUserXPProgress(user.uid, totalXP);

      // Send quest completion notification
      await NotificationService.notifyQuestCompletion(
        user.uid,
        quest.title,
        totalXP
      );

      // Check for level up and send notification if needed
      if (newLevel > currentUser.level) {
        await NotificationService.notifyLevelUp(user.uid, newLevel, newXP);
      }

      // Check for new achievements and tag unlocks
      try {
        // First check for new achievements
        const achievementResults =
          await AchievementService.checkAllAchievements(user.uid);

        // Send achievement notifications
        if (achievementResults.total > 0) {
          await NotificationService.notifyAchievementUnlocked(
            user.uid,
            "Multiple Achievements",
            `You unlocked ${achievementResults.total} new achievements!`
          );
        }

        // Then check for general tag unlocks (based on quest completion)
        const newlyUnlockedTags = await TagUnlockService.checkAndUnlockTags(
          user.uid
        );

        if (achievementResults.total > 0 || newlyUnlockedTags.length > 0) {
          console.log(`� Quest completion results:
            - New achievements: ${achievementResults.total}
            - New tags: ${newlyUnlockedTags.length}`);
        }
      } catch (error) {
        console.error("Error checking achievements and tags:", error);
        // Don't fail quest completion if checking fails
      }
    } catch (error) {
      console.error("XP award error:", error);
    }
  };

  const calculateLevel = (xp: number): number => {
    const baseXP = 500;
    let level = 1;
    let xpRequired = baseXP;

    while (xp >= xpRequired) {
      level++;
      xpRequired += baseXP * Math.pow(1.3, level - 2);
    }

    return level;
  };

  const handleCancelQuest = () => {
    Alert.alert("Cancel Quest", "Are you sure you want to cancel this quest?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onLongPress: async () => {
          try {
            await FirestoreService.cancelQuestAttempt(attempt.attemptId);
            onQuestCancel();
          } catch (error) {
            console.error("Error canceling quest:", error);
            Alert.alert("Error", "Failed to cancel quest. Please try again.");
          }
        },
      },
    ]);
  };

  const formatDistance = (distanceInMeters: number) => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onLongPress={onExitMap} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quest Navigation</Text>
        <TouchableOpacity
          onLongPress={handleCancelQuest}
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <QuestMapView
        quest={quest}
        attempt={attempt}
        userLocation={userLocation}
        isInQuestArea={isInQuestArea}
        distance={distance}
        onOpenExternalMap={openExternalMap}
      />

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Enhanced Quest Info */}
        <View style={styles.questInfoCard}>
          <View style={styles.questHeader}>
            <View style={styles.questIconContainer}>
              <Ionicons name="flag" size={24} color="#007AFF" />
            </View>
            <View style={styles.questTextContainer}>
              <Text style={styles.questTitle}>{quest.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.questLocation}>{quest.location}</Text>
              </View>
            </View>
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.xpText}>{quest.xpReward}</Text>
            </View>
          </View>

          {quest.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.questDescription}>{quest.description}</Text>
            </View>
          )}

          <View style={styles.questStats}>
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={16} color="#007AFF" />
              <Text style={styles.statText}>{quest.radius}m radius</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#007AFF" />
              <Text style={styles.statText}>
                {formatDistance(distance)} away
              </Text>
            </View>
            {quest.difficulty && (
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={16} color="#007AFF" />
                <Text style={styles.statText}>{quest.difficulty}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Location Status with Dynamic Swipe Button */}
        <QuestLocationSwipeButton
          isInQuestArea={isInQuestArea}
          distance={distance}
          onSwipeLeft={onExitMap}
          onSwipeRight={handleTakePhoto}
        />

        {/* Single SwipeButton for all actions */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          {isInQuestArea ? (
            <View>
              <SimpleSwipeButton
                leftText="Exit"
                rightText="Maps"
                centerText="📸"
                onSwipeLeft={onExitMap}
                onSwipeRight={openExternalMap}
                instructionText="Swipe left to exit, right to open Maps"
              />
            </View>
          ) : (
            <SimpleSwipeButton
              leftText="Exit"
              rightText="Maps"
              centerText="🗺️"
              onSwipeLeft={onExitMap}
              onSwipeRight={openExternalMap}
              instructionText="Swipe left to exit, right to open Maps"
            />
          )}
        </View>
      </View>

      {/* Moderation Status Modal */}
      <ModerationStatusModal
        visible={moderationModal.visible}
        submissionId={moderationModal.submissionId}
        initialStatus={moderationModal.status}
        questTitle={quest.title}
        onClose={() => {
          setModerationModal((prev) => ({ ...prev, visible: false }));
          if (moderationModal.status === "approved") {
            onQuestComplete();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#007AFF",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  menuButton: {
    padding: 5,
  },
  questInfo: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  questInfoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  questHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 16,
  },
  questIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  questTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8DC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  xpText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B8860B",
    marginLeft: 4,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  questStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F8F9FA",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  questTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
    lineHeight: 26,
  },
  questLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  questDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
  loadingMapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  bottomPanel: {
    backgroundColor: "white",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  secondaryButton: {
    backgroundColor: "white",
    borderColor: "#007AFF",
    borderWidth: 2,
    flex: 1,
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
  statusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  statusCardActive: {
    backgroundColor: "#E8F5E8",
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  statusTextActive: {
    color: "#4CAF50",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 12,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 15,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  takePhotoButton: {
    backgroundColor: "#4CAF50",
  },
  takePhotoButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 5,
  },
});
