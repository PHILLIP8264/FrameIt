import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { contestStyles as styles } from "../../styles";
import { VotingSubmission } from "../../types/database";

interface ContestSubmissionCardProps {
  submission: VotingSubmission;
  onVotePress: () => void;
  hasUserVoted: boolean;
  isVotingActive: boolean;
  rank: number;
}

export default function ContestSubmissionCard({
  submission,
  onVotePress,
  hasUserVoted,
  isVotingActive,
  rank,
}: ContestSubmissionCardProps) {
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getVoteButtonText = (): string => {
    if (hasUserVoted) return "Voted";
    if (!isVotingActive) return "Voting Closed";
    return "Vote";
  };

  const getVoteButtonIcon = (): string => {
    if (hasUserVoted) return "checkmark-circle";
    if (!isVotingActive) return "time-outline";
    return "star-outline";
  };

  const formatScore = (score: number): string => {
    return score.toFixed(1);
  };

  return (
    <View style={styles.submissionCard}>
      {/* Header with user info and rank */}
      <View style={styles.submissionHeader}>
        <View style={styles.submissionUserInfo}>
          {submission.userProfilePhoto ? (
            <Image
              source={{ uri: submission.userProfilePhoto }}
              style={styles.submissionAvatar}
            />
          ) : (
            <View style={styles.submissionAvatar}>
              <Text style={styles.submissionAvatarText}>
                {getInitials(submission.userDisplayName || "Anonymous User")}
              </Text>
            </View>
          )}
          <View style={styles.submissionUserDetails}>
            <Text style={styles.submissionUserName}>
              {submission.userDisplayName || "Anonymous User"}
            </Text>
            <Text style={styles.submissionQuestTitle}>
              {submission.questTitle} • {submission.questCategory}
            </Text>
          </View>
        </View>
        <View style={styles.submissionRank}>
          <Ionicons
            name={rank <= 3 ? "trophy" : "ribbon-outline"}
            size={16}
            color="#007AFF"
          />
          <Text style={styles.submissionRankText}>#{rank}</Text>
        </View>
      </View>

      {/* Submission Image */}
      <Image
        source={{ uri: submission.subUrl }}
        style={styles.submissionImage}
        resizeMode="cover"
      />

      {/* Stats */}
      <View style={styles.submissionStats}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.statValue}>
            {formatScore(submission.averageQualityRating || 0)}
          </Text>
          <Text style={styles.statLabel}>Quality</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.statValue}>
            {Object.values(submission.requirementScores || {}).reduce(
              (acc, req) => acc + (req.percentage >= 50 ? 1 : 0),
              0
            )}
          </Text>
          <Text style={styles.statLabel}>Requirements</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#007AFF" />
          <Text style={styles.statValue}>{submission.totalVotes || 0}</Text>
          <Text style={styles.statLabel}>Votes</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={16} color="#FF5722" />
          <Text style={styles.statValue}>
            {formatScore(submission.overallScore || 0)}
          </Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
      </View>

      {/* Vote Button */}
      <View style={styles.voteButtonContainer}>
        <TouchableOpacity
          style={[
            styles.voteButton,
            hasUserVoted && styles.voteButtonVoted,
            !isVotingActive && styles.voteButtonDisabled,
          ]}
          onLongPress={onVotePress}
          disabled={hasUserVoted || !isVotingActive}
        >
          <Ionicons name={getVoteButtonIcon() as any} size={20} color="#fff" />
          <Text style={styles.voteButtonText}>{getVoteButtonText()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
