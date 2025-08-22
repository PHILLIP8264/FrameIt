import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { FirestoreService } from "../../services";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type ModerationStatus =
  | "submitting"
  | "pending_review"
  | "approved"
  | "rejected"
  | "hidden";

interface ModerationStatusModalProps {
  visible: boolean;
  submissionId?: string;
  onClose: () => void;
  initialStatus?: ModerationStatus;
  questTitle?: string;
}

export default function ModerationStatusModal({
  visible,
  submissionId,
  onClose,
  initialStatus = "submitting",
  questTitle = "Quest",
}: ModerationStatusModalProps) {
  const [status, setStatus] = useState<ModerationStatus>(initialStatus);
  const [autoCloseTimer, setAutoCloseTimer] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  console.log("ModerationStatusModal rendered with:", {
    visible,
    submissionId,
    status,
    initialStatus,
  });

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Update status when initialStatus changes
  useEffect(() => {
    console.log("initialStatus changed to:", initialStatus);
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (visible) {
      // Animate modal appearance
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Start pulse animation for loading state
      if (status === "submitting" || status === "pending_review") {
        startPulseAnimation();
      }

      // Set up submission listener if we have a submission ID
      if (submissionId) {
        return setupModerationListener();
      }
    } else {
      scaleAnim.setValue(0);
      stopPulseAnimation();
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        setAutoCloseTimer(null);
      }
    }
  }, [visible, submissionId]);

  const setupModerationListener = () => {
    console.log("Setting up moderation listener for:", submissionId);

    const unsubscribe = FirestoreService.subscribeToSubmission(
      submissionId!,
      (submission: any) => {
        console.log("Moderation status update received:", submission);
        if (submission?.moderationStatus) {
          const newStatus = submission.moderationStatus as ModerationStatus;
          console.log("Current status:", status, "New status:", newStatus);
          if (newStatus !== status) {
            console.log("Updating status to:", newStatus);
            setStatus(newStatus);
            stopPulseAnimation();
            if (newStatus === "approved" || newStatus === "rejected") {
              handleStatusChange(newStatus);
            }
          }
        }
      }
    );

    return unsubscribe;
  };

  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (status === "submitting" || status === "pending_review") {
          pulse();
        }
      });
    };
    pulse();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleStatusChange = (newStatus: ModerationStatus) => {
    if (newStatus === "approved" || newStatus === "rejected") {
      // Start countdown timer
      startCountdownTimer(newStatus);
    }
  };

  const startCountdownTimer = (finalStatus: ModerationStatus) => {
    setCountdown(3);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Countdown
    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count <= 0) {
        clearInterval(timer);
        handleAutoAction(finalStatus);
      }
    }, 1000);

    setAutoCloseTimer(timer as any);
  };

  const handleAutoAction = (finalStatus: ModerationStatus) => {
    if (finalStatus === "approved") {
      // Redirect to index page
      onClose();
      router.push("/(tabs)/" as any);
    } else if (finalStatus === "rejected") {
      // Just close modal, user can try again
      onClose();
    }
  };

  const handleManualClose = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    stopPulseAnimation();
    onClose();
  };

  const getStatusConfig = () => {
    switch (status) {
      case "submitting":
        return {
          title: "Uploading Photo",
          subtitle: "Please wait while we process your submission...",
          icon: "cloud-upload",
          gradient: ["#137CD8", "#D61A66"],
          showSpinner: true,
        };
      case "pending_review":
        return {
          title: "Under Review",
          subtitle:
            "Your photo is being moderated. This usually takes a few moments...",
          icon: "time",
          gradient: ["#F59E0B", "#EF4444"],
          showSpinner: true,
        };
      case "approved":
        return {
          title: "Photo Approved! 🎉",
          subtitle: `Great job! Your photo for "${questTitle}" has been approved.`,
          icon: "checkmark-circle",
          gradient: ["#10B981", "#059669"],
          showSpinner: false,
        };
      case "rejected":
        return {
          title: "Photo Rejected",
          subtitle:
            "Your photo didn't meet our guidelines. Please try taking another photo.",
          icon: "close-circle",
          gradient: ["#EF4444", "#DC2626"],
          showSpinner: false,
        };
      default:
        return {
          title: "Processing",
          subtitle: "Please wait...",
          icon: "hourglass",
          gradient: ["#D61A66", "#B91C5A"],
          showSpinner: true,
        };
    }
  };

  const config = getStatusConfig();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleManualClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={config.gradient as [string, string]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                {config.showSpinner ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <Ionicons name={config.icon as any} size={48} color="white" />
                )}
              </View>

              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.subtitle}>{config.subtitle}</Text>
            </View>

            {/* Progress bar for countdown */}
            {(status === "approved" || status === "rejected") &&
              autoCloseTimer && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <Animated.View
                      style={[
                        styles.progressBar,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.countdownText}>
                    {status === "approved"
                      ? `Redirecting in ${countdown}...`
                      : `Closing in ${countdown}...`}
                  </Text>
                </View>
              )}

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              {status === "rejected" && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onLongPress={handleManualClose}
                >
                  <Text style={styles.primaryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}

              {(status === "approved" || status === "rejected") &&
                autoCloseTimer && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onLongPress={handleManualClose}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {status === "approved" ? "Stay Here" : "Close"}
                    </Text>
                  </TouchableOpacity>
                )}

              {(status === "submitting" || status === "pending_review") && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onLongPress={handleManualClose}
                >
                  <Text style={styles.secondaryButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: Math.min(screenWidth - 40, 400),
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradient: {
    padding: 30,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 20,
  },
  progressBackground: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  countdownText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
