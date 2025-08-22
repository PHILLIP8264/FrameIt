import React, { useState } from "react";
import { View, ActivityIndicator, Text, ScrollView } from "react-native";
import { contestStyles as styles } from "../../styles";
import { VotingSubmission } from "../../types/database";
import { useContestManagement } from "../../hooks/useContestManagement";
import {
  ContestHeader,
  ContestTabs,
  ContestSubmissionsList,
  VotingModal,
} from "../../components/contest";

export default function Contest() {
  const {
    selectedTab,
    setSelectedTab,
    submissions,
    loading,
    refreshing,
    userVotes,
    userTeamId,
    onRefresh,
    isVotingActive,
    getContestStatus,
    handleVotePress,
    submitVote,
  } = useContestManagement();

  const [selectedSubmission, setSelectedSubmission] =
    useState<VotingSubmission | null>(null);
  const [votingModalVisible, setVotingModalVisible] = useState(false);

  const onVotePress = (submission: VotingSubmission) => {
    if (handleVotePress(submission)) {
      setSelectedSubmission(submission);
      setVotingModalVisible(true);
    }
  };

  const handleVoteSubmit = async (voteData: {
    photoQualityRating: number;
    requirementVotes: { [key: string]: boolean };
  }) => {
    if (selectedSubmission) {
      await submitVote(selectedSubmission, voteData);
      setVotingModalVisible(false);
      setSelectedSubmission(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#137CD8" />
          <Text style={styles.loadingText}>
            Loading today&apos;s contest...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <ContestHeader
          contestStatus={getContestStatus()}
          isVotingActive={isVotingActive()}
        />

        <ContestTabs
          selectedTab={selectedTab}
          onTabSelect={setSelectedTab}
          userTeamId={userTeamId}
        />

        <ContestSubmissionsList
          submissions={submissions}
          userVotes={userVotes}
          isVotingActive={isVotingActive()}
          selectedTab={selectedTab}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onVotePress={onVotePress}
        />
      </ScrollView>

      <VotingModal
        visible={votingModalVisible}
        submission={selectedSubmission}
        onClose={() => {
          setVotingModalVisible(false);
          setSelectedSubmission(null);
        }}
        onSubmitVote={handleVoteSubmit}
      />
    </View>
  );
}
