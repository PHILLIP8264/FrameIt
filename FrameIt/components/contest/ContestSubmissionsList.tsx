import React from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { contestStyles as styles } from "../../styles";
import { VotingSubmission } from "../../types/database";
import ContestSubmissionCard from "./ContestSubmissionCard";

interface ContestSubmissionsListProps {
  submissions: VotingSubmission[];
  userVotes: Set<string>;
  isVotingActive: boolean;
  selectedTab: "global" | "team";
  refreshing: boolean;
  onRefresh: () => void;
  onVotePress: (submission: VotingSubmission) => void;
}

const ContestSubmissionsList: React.FC<ContestSubmissionsListProps> = ({
  submissions,
  userVotes,
  isVotingActive,
  selectedTab,
  refreshing,
  onRefresh,
  onVotePress,
}) => {
  return (
    <ScrollView
      style={styles.submissionsContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {submissions.length > 0 ? (
        <View style={styles.submissionsList}>
          {submissions.map((submission, index) => (
            <ContestSubmissionCard
              key={submission.subId}
              submission={submission}
              onVotePress={() => onVotePress(submission)}
              hasUserVoted={userVotes.has(submission.subId)}
              isVotingActive={isVotingActive}
              rank={index + 1}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="camera-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>
            {selectedTab === "team"
              ? "Team contests coming soon!"
              : "No submissions yet"}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {selectedTab === "team"
              ? "Team contests will be available once team features are implemented"
              : "Check back later for photo submissions"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default ContestSubmissionsList;
