import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { contestStyles as styles } from "../../styles";
import { VotingSubmission } from "../../types/database";

interface VotingModalProps {
  visible: boolean;
  submission: VotingSubmission | null;
  onClose: () => void;
  onSubmitVote: (voteData: {
    photoQualityRating: number;
    requirementVotes: { [key: string]: boolean };
  }) => void;
}

export default function VotingModal({
  visible,
  submission,
  onClose,
  onSubmitVote,
}: VotingModalProps) {
  const [photoQualityRating, setPhotoQualityRating] = useState<number>(0);
  const [requirementVotes, setRequirementVotes] = useState<{
    [key: string]: boolean | null;
  }>({});
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetVotes = () => {
    setPhotoQualityRating(0);
    setRequirementVotes({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      resetVotes();
      onClose();
    });
  };

  const handleSubmit = async () => {
    // Validate that quality rating is selected
    if (photoQualityRating === 0) {
      Alert.alert(
        "Missing Rating",
        "Please rate the photo quality (1-5 stars)"
      );
      return;
    }

    // Validate that all requirements have been voted on
    const requirements = Object.keys(submission?.questRequirements || {});
    const missingVotes = requirements.filter(
      (req) =>
        requirementVotes[req] === null || requirementVotes[req] === undefined
    );

    if (missingVotes.length > 0) {
      Alert.alert("Missing Votes", "Please vote on all quest requirements");
      return;
    }

    setIsSubmitting(true);

    // Convert null values to false and submit
    const finalRequirementVotes: { [key: string]: boolean } = {};
    requirements.forEach((req) => {
      finalRequirementVotes[req] = requirementVotes[req] === true;
    });

    try {
      await onSubmitVote({
        photoQualityRating,
        requirementVotes: finalRequirementVotes,
      });

      resetVotes();
      handleClose();
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("Error", "Failed to submit vote. Please try again.");
    }
  };

  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onLongPress={() => setPhotoQualityRating(i)}
          style={styles.star}
          activeOpacity={0.7}
        >
          <Ionicons
            name={i <= photoQualityRating ? "star" : "star-outline"}
            size={36}
            color={i <= photoQualityRating ? "#FFD700" : "#ddd"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Select rating";
    }
  };

  const handleRequirementVote = (requirementKey: string, vote: boolean) => {
    setRequirementVotes((prev) => ({
      ...prev,
      [requirementKey]: vote,
    }));
  };

  const renderRequirements = () => {
    if (!submission?.questRequirements) return null;

    return Object.entries(submission.questRequirements).map(
      ([key, requirement]) => (
        <View key={key} style={styles.requirementItem}>
          <Text style={styles.requirementText}>{requirement.description}</Text>
          <View style={styles.requirementButtons}>
            <TouchableOpacity
              style={[
                styles.requirementButton,
                requirementVotes[key] === true && styles.requirementButtonYes,
              ]}
              onLongPress={() => handleRequirementVote(key, true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark"
                size={16}
                color={requirementVotes[key] === true ? "#fff" : "#666"}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.requirementButtonText,
                  requirementVotes[key] === true &&
                    styles.requirementButtonTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.requirementButton,
                requirementVotes[key] === false && styles.requirementButtonNo,
              ]}
              onLongPress={() => handleRequirementVote(key, false)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="close"
                size={16}
                color={requirementVotes[key] === false ? "#fff" : "#666"}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.requirementButtonText,
                  requirementVotes[key] === false &&
                    styles.requirementButtonTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    );
  };

  const isReadyToSubmit = (): boolean => {
    if (photoQualityRating === 0 || isSubmitting) return false;

    const requirements = Object.keys(submission?.questRequirements || {});
    return requirements.every(
      (req) => requirementVotes[req] === true || requirementVotes[req] === false
    );
  };

  // Animate modal entrance
  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!submission) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Vote on Submission</Text>
            <TouchableOpacity
              onLongPress={handleClose}
              style={styles.modalCloseButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Submission Image */}
            {submission.subUrl && (
              <View style={styles.votingImageContainer}>
                <Image
                  source={{ uri: submission.subUrl }}
                  style={styles.votingImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.submissionInfo}>
                    <Text style={styles.votingSubmissionUserName}>
                      by{" "}
                      {submission.userName ||
                        submission.userDisplayName ||
                        "Anonymous"}
                    </Text>
                    <Text style={styles.votingSubmissionQuestTitle}>
                      {submission.questTitle || "Quest Submission"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Photo Quality Rating */}
            <View style={styles.qualityRatingSection}>
              <Text style={styles.sectionTitle}>Photo Quality Rating</Text>
              <Text style={styles.sectionDescription}>
                Rate the overall quality, composition, and creativity of this
                photo
              </Text>
              <View style={styles.starRating}>{renderStarRating()}</View>
              <Text style={styles.ratingLabel}>
                {getRatingLabel(photoQualityRating)}
              </Text>
            </View>

            {/* Quest Requirements */}
            <View style={styles.requirementsSection}>
              <Text style={styles.sectionTitle}>Quest Requirements</Text>
              <Text style={styles.sectionDescription}>
                Vote whether this photo meets each quest requirement
              </Text>
              {renderRequirements()}
            </View>

            {/* Vote Summary */}
            <View style={styles.voteSummary}>
              <Text style={styles.voteSummaryTitle}>Vote Summary</Text>
              <Text style={styles.voteSummaryText}>
                Quality Rating: {photoQualityRating}/5 stars{"\n"}
                Requirements:{" "}
                {
                  Object.values(requirementVotes).filter((v) => v === true)
                    .length
                }
                /{Object.keys(submission.questRequirements || {}).length} met
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isReadyToSubmit() && styles.submitButtonDisabled,
              ]}
              onLongPress={handleSubmit}
              disabled={!isReadyToSubmit()}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="reload"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Submit Vote</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
