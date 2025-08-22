import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import DatabaseService from "../services/DatabaseService";
import { FirestoreService } from "../services";
import {
  DailyContest,
  VotingSubmission,
  SubmissionVote,
} from "../types/database";

export const useContestManagement = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"global" | "team">("global");
  const [currentContest, setCurrentContest] = useState<DailyContest | null>(
    null
  );
  const [submissions, setSubmissions] = useState<VotingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  // Load user team
  const loadUserTeam = async () => {
    if (!user?.uid) return;
    try {
      const userData = await FirestoreService.getUser(user.uid);
      if (userData?.primaryTeam) {
        setUserTeamId(userData.primaryTeam);
      }
    } catch (error) {
      console.error("Error loading user team:", error);
    }
  };

  // Load today's contest
  const loadTodayContest = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const contest = await DatabaseService.getTodayContest(today);
      setCurrentContest(contest);

      if (contest) {
        let contestSubmissions: VotingSubmission[] = [];

        if (selectedTab === "global") {
          contestSubmissions =
            await DatabaseService.getGlobalContestSubmissions(
              contest.contestId
            );
        } else if (selectedTab === "team" && userTeamId) {
          contestSubmissions = await DatabaseService.getTeamContestSubmissions(
            contest.contestId,
            userTeamId
          );
        }

        // Filter out user's own submissions
        const filteredSubmissions = contestSubmissions.filter(
          (submission) => submission.userId !== user?.uid
        );
        setSubmissions(filteredSubmissions);

        // Load user's existing votes
        const votes = await DatabaseService.getUserVotesForContest(
          contest.contestId,
          user!.uid
        );
        setUserVotes(
          new Set(votes.map((vote: SubmissionVote) => vote.submissionId))
        );
      }
    } catch (error) {
      console.error("Error loading contest:", error);
      Alert.alert("Error", "Failed to load today's contest");
    } finally {
      setLoading(false);
    }
  };

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodayContest();
    setRefreshing(false);
  };

  // Check if voting is active
  const isVotingActive = (): boolean => {
    if (!currentContest) return false;

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (currentContest.date !== today) return false;

    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = 1300; // 13:00
    const endTime = 2359; // 23:59

    return currentTime >= startTime || currentTime <= 59;
  };

  // Get contest status
  const getContestStatus = (): string => {
    if (!currentContest) return "No contest today";

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    if (currentTime < 1800) {
      return "Voting opens at 18:00";
    } else if (isVotingActive()) {
      return "Voting is active!";
    } else {
      return "Voting has ended";
    }
  };

  // Handle vote press
  const handleVotePress = (submission: VotingSubmission): boolean => {
    if (userVotes.has(submission.subId)) {
      Alert.alert(
        "Already Voted",
        "You have already voted on this submission."
      );
      return false;
    }

    if (submission.userId === user?.uid) {
      Alert.alert("Cannot Vote", "You cannot vote on your own submission.");
      return false;
    }

    if (!isVotingActive()) {
      Alert.alert("Voting Closed", "Voting is not currently active.");
      return false;
    }

    return true;
  };

  // Submit vote
  const submitVote = async (
    submission: VotingSubmission,
    voteData: {
      photoQualityRating: number;
      requirementVotes: { [key: string]: boolean };
    }
  ) => {
    if (!submission || !currentContest) return;

    try {
      const votePayload: any = {
        submissionId: submission.subId,
        voterId: user!.uid,
        contestId: currentContest.contestId,
        votingContext: selectedTab,
        photoQualityRating: voteData.photoQualityRating,
        requirementVotes: voteData.requirementVotes,
      };

      if (selectedTab === "team" && userTeamId) {
        votePayload.teamId = userTeamId;
      }

      await DatabaseService.submitVote(votePayload);
      setUserVotes((prev) => new Set([...prev, submission.subId]));
      await loadTodayContest();

      Alert.alert(
        "Vote Submitted",
        "Your vote has been recorded successfully!"
      );
    } catch (error) {
      console.error("Error submitting vote:", error);
      Alert.alert("Error", "Failed to submit your vote. Please try again.");
    }
  };

  // Initialize
  useEffect(() => {
    loadUserTeam();
  }, []);

  useEffect(() => {
    loadTodayContest();
  }, [selectedTab, userTeamId]);

  return {
    selectedTab,
    setSelectedTab,
    currentContest,
    submissions,
    loading,
    refreshing,
    userVotes,
    userTeamId,
    loadTodayContest,
    onRefresh,
    isVotingActive,
    getContestStatus,
    handleVotePress,
    submitVote,
  };
};
