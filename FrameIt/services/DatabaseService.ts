import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  orderBy,
  limit,
  getDoc,
} from "firebase/firestore";
import {
  Group,
  Tag,
  Vote,
  DailyContest,
  VotingSubmission,
  SubmissionVote,
} from "../types/database";

// Service for managing Firestore operations
const DatabaseService = {
  // Votes
  async addVote(submissionId: string, vote: Vote): Promise<void> {
    const voteRef = doc(
      collection(db, "submissions", submissionId, "votes"),
      vote.userId
    );
    await setDoc(voteRef, vote);
  },

  // Groups
  async createGroup(group: Group): Promise<void> {
    const groupRef = doc(collection(db, "groups"), group.groupId);
    await setDoc(groupRef, group);
  },

  async addUserToGroup(groupId: string, userId: string): Promise<void> {
    const groupRef = doc(collection(db, "groups"), groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
    });
  },

  // Completed Quests
  async addCompletedQuest(
    userId: string,
    quest: { questId: string }
  ): Promise<void> {
    const questRef = doc(
      collection(db, "users", userId, "completedQuests"),
      quest.questId
    );
    await setDoc(questRef, quest);
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    const tagsSnapshot = await getDocs(collection(db, "tags"));
    return tagsSnapshot.docs.map((doc) => doc.data() as Tag);
  },

  // Contest and Voting Methods
  async getTodayContest(contestId: string): Promise<DailyContest | null> {
    try {
      const contestRef = doc(collection(db, "dailyContests"), contestId);
      const contestSnap = await getDoc(contestRef);

      if (contestSnap.exists()) {
        return contestSnap.data() as DailyContest;
      }

      // Create today's contest if it doesn't exist
      const newContest: DailyContest = {
        contestId,
        date: contestId,
        status: "voting",
        votingStartTime: "18:00",
        votingEndTime: "00:00",
        globalSubmissions: [],
        teamContests: {},
      };

      await setDoc(contestRef, newContest);
      return newContest;
    } catch (error) {
      console.error("Error getting today's contest:", error);
      return null;
    }
  },

  async getGlobalContestSubmissions(
    contestId: string
  ): Promise<VotingSubmission[]> {
    try {
      // Get submissions from today
      const submissionsSnapshot = await getDocs(
        query(
          collection(db, "submissions"),
          where("timestamp", ">=", new Date(contestId + "T00:00:00Z")),
          where("timestamp", "<=", new Date(contestId + "T23:59:59Z")),
          orderBy("timestamp", "desc")
        )
      );

      const submissions: VotingSubmission[] = [];

      for (const submissionDoc of submissionsSnapshot.docs) {
        const submissionData = submissionDoc.data();

        // Get quest details
        const questRef = doc(collection(db, "quests"), submissionData.questId);
        const questSnap = await getDoc(questRef);
        const questData = questSnap.data();

        // Get user details
        const userRef = doc(collection(db, "users"), submissionData.userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (questData) {
          // Calculate voting stats
          const votesSnapshot = await getDocs(
            query(
              collection(db, "submissionVotes"),
              where("submissionId", "==", submissionDoc.id),
              where("contestId", "==", contestId)
            )
          );

          const votes = votesSnapshot.docs.map(
            (doc) => doc.data() as SubmissionVote
          );
          const totalVotes = votes.length;
          const averageQualityRating =
            totalVotes > 0
              ? votes.reduce((sum, vote) => sum + vote.photoQualityRating, 0) /
                totalVotes
              : 0;

          // Calculate requirement scores
          const requirementScores: { [key: string]: any } = {};
          Object.keys(questData.photoRequirements?.subjects || {}).forEach(
            (req) => {
              const yesVotes = votes.filter(
                (vote) => vote.requirementVotes[req] === true
              ).length;
              requirementScores[req] = {
                yesVotes,
                totalVotes,
                percentage: totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0,
              };
            }
          );

          const overallScore =
            averageQualityRating * 0.6 +
            ((Object.values(requirementScores).reduce(
              (sum: number, req: any) => sum + req.percentage,
              0
            ) /
              Object.keys(requirementScores).length) *
              0.4) /
              100;

          submissions.push({
            ...submissionData,
            subId: submissionDoc.id,
            userName:
              userData?.name || userData?.displayName || "Anonymous User",
            userDisplayName:
              userData?.displayName || userData?.name || "Anonymous User",
            userProfilePhoto: userData?.profileImageUrl || null,
            questTitle: questData.title,
            questCategory: questData.category,
            questRequirements: this.parseQuestRequirements(
              questData.photoRequirements
            ),
            totalVotes,
            averageQualityRating,
            requirementScores,
            overallScore,
            contestId,
            isEligibleForVoting: true,
          } as VotingSubmission);
        }
      }

      // Sort by overall score
      return submissions.sort((a, b) => b.overallScore - a.overallScore);
    } catch (error) {
      console.error("Error getting global contest submissions:", error);
      return [];
    }
  },

  async getTeamContestSubmissions(
    contestId: string,
    teamId: string
  ): Promise<VotingSubmission[]> {
    try {
      // Get team members first
      const teamRef = doc(collection(db, "teams"), teamId);
      const teamSnap = await getDoc(teamRef);

      if (!teamSnap.exists()) return [];

      const teamData = teamSnap.data();
      const teamMembers = teamData.members || [];

      // Get submissions from team members
      const submissionsSnapshot = await getDocs(
        query(
          collection(db, "submissions"),
          where("userId", "in", teamMembers),
          where("timestamp", ">=", new Date(contestId + "T00:00:00Z")),
          where("timestamp", "<=", new Date(contestId + "T23:59:59Z")),
          orderBy("timestamp", "desc")
        )
      );

      // Process similar to global submissions but filter for team
      return this.processSubmissionsForVoting(
        submissionsSnapshot,
        contestId,
        "team"
      );
    } catch (error) {
      console.error("Error getting team contest submissions:", error);
      return [];
    }
  },

  async getUserVotesForContest(
    contestId: string,
    userId: string
  ): Promise<SubmissionVote[]> {
    try {
      const votesSnapshot = await getDocs(
        query(
          collection(db, "submissionVotes"),
          where("voterId", "==", userId),
          where("contestId", "==", contestId)
        )
      );

      return votesSnapshot.docs.map((doc) => doc.data() as SubmissionVote);
    } catch (error) {
      console.error("Error getting user votes:", error);
      return [];
    }
  },

  async submitVote(voteData: {
    submissionId: string;
    voterId: string;
    contestId: string;
    votingContext: "global" | "team";
    teamId?: string;
    photoQualityRating: number;
    requirementVotes: { [key: string]: boolean };
  }): Promise<void> {
    try {
      const voteId = `${voteData.submissionId}_${voteData.voterId}_${voteData.contestId}`;

      // Calculate scores
      const requirementScore = Object.values(voteData.requirementVotes).filter(
        (v) => v === true
      ).length;
      const totalRequirements = Object.keys(voteData.requirementVotes).length;
      const finalScore =
        voteData.photoQualityRating * 0.6 +
        (requirementScore / totalRequirements) * 0.4 * 5;

      const vote: any = {
        voteId,
        submissionId: voteData.submissionId,
        voterId: voteData.voterId,
        contestId: voteData.contestId,
        votingContext: voteData.votingContext,
        photoQualityRating: voteData.photoQualityRating,
        requirementVotes: voteData.requirementVotes,
        requirementScore,
        totalRequirements,
        finalScore,
        timestamp: new Date(),
        isLocked: true,
      };

      // Only include teamId if it's provided
      if (voteData.teamId) {
        vote.teamId = voteData.teamId;
      }

      const voteRef = doc(collection(db, "submissionVotes"), voteId);
      await setDoc(voteRef, vote);
    } catch (error) {
      console.error("Error submitting vote:", error);
      throw error;
    }
  },

  // Helper method to parse quest requirements
  parseQuestRequirements(photoRequirements: any): { [key: string]: any } {
    const requirements: { [key: string]: any } = {};

    if (photoRequirements) {
      // Parse subjects as requirements
      if (
        photoRequirements.subjects &&
        Array.isArray(photoRequirements.subjects)
      ) {
        photoRequirements.subjects.forEach((subject: string, index: number) => {
          requirements[`subject_${index}`] = {
            description: `Contains ${subject}`,
            type: "subject",
          };
        });
      }

      // Parse style requirements
      if (photoRequirements.style) {
        requirements.style = {
          description: `Shot in ${photoRequirements.style} style`,
          type: "style",
        };
      }

      // Parse time of day requirements
      if (
        photoRequirements.timeOfDay &&
        photoRequirements.timeOfDay !== "any"
      ) {
        requirements.timeOfDay = {
          description: `Taken during ${photoRequirements.timeOfDay}`,
          type: "time",
        };
      }

      // Parse minimum resolution requirements
      if (photoRequirements.minResolution) {
        requirements.resolution = {
          description: `Minimum ${photoRequirements.minResolution.width}x${photoRequirements.minResolution.height} resolution`,
          type: "technical",
        };
      }
    }

    // Always have at least one requirement for voting
    if (Object.keys(requirements).length === 0) {
      requirements.general = {
        description: "Meets quest objectives",
        type: "subject",
      };
    }

    return requirements;
  },

  // Helper method to process submissions for voting
  async processSubmissionsForVoting(
    submissionsSnapshot: any,
    contestId: string,
    context: string
  ): Promise<VotingSubmission[]> {
    try {
      const submissions: VotingSubmission[] = [];

      for (const submissionDoc of submissionsSnapshot.docs) {
        const submissionData = submissionDoc.data();

        // Get quest details
        const questRef = doc(collection(db, "quests"), submissionData.questId);
        const questSnap = await getDoc(questRef);
        const questData = questSnap.data();

        // Get user details
        const userRef = doc(collection(db, "users"), submissionData.userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (questData) {
          // Calculate voting stats
          const votesSnapshot = await getDocs(
            query(
              collection(db, "submissionVotes"),
              where("submissionId", "==", submissionDoc.id),
              where("contestId", "==", contestId)
            )
          );

          const votes = votesSnapshot.docs.map(
            (doc) => doc.data() as SubmissionVote
          );
          const totalVotes = votes.length;
          const averageQualityRating =
            totalVotes > 0
              ? votes.reduce((sum, vote) => sum + vote.photoQualityRating, 0) /
                totalVotes
              : 0;

          // Calculate requirement scores
          const requirementScores: { [key: string]: any } = {};
          const questRequirements = this.parseQuestRequirements(
            questData.photoRequirements
          );

          Object.keys(questRequirements).forEach((req) => {
            const yesVotes = votes.filter(
              (vote) => vote.requirementVotes[req] === true
            ).length;
            requirementScores[req] = {
              yesVotes,
              totalVotes,
              percentage: totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0,
            };
          });

          const overallScore =
            averageQualityRating * 0.6 +
            ((Object.values(requirementScores).reduce(
              (sum: number, req: any) => sum + req.percentage,
              0
            ) /
              Object.keys(requirementScores).length) *
              0.4) /
              100;

          submissions.push({
            ...submissionData,
            subId: submissionDoc.id,
            userName:
              userData?.name || userData?.displayName || "Anonymous User",
            userDisplayName:
              userData?.displayName || userData?.name || "Anonymous User",
            userProfilePhoto: userData?.profileImageUrl || null,
            questTitle: questData.title,
            questCategory: questData.category,
            questRequirements,
            totalVotes,
            averageQualityRating,
            requirementScores,
            overallScore,
            contestId,
            isEligibleForVoting: true,
          } as VotingSubmission);
        }
      }

      // Sort by overall score
      return submissions.sort((a, b) => b.overallScore - a.overallScore);
    } catch (error) {
      console.error("Error processing submissions for voting:", error);
      return [];
    }
  },
};

export default DatabaseService;
