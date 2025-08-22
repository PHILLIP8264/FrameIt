import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  TeamChallenge,
  TeamChallengeParticipation,
  User,
} from "../types/database";

const TeamChallengeService = {
  // ===== TEAM CHALLENGE MANAGEMENT =====

  /**
   * Create a new team challenge
   */
  async createTeamChallenge(
    challengeData: Omit<
      TeamChallenge,
      "challengeId" | "createdAt" | "currentValue" | "progress" | "statistics"
    >,
    creatorUserId: string
  ): Promise<string> {
    try {
      const { userService } = await import("./user/UserService");
      const { teamService } = await import("./team/TeamService");

      const creator = await userService.getUser(creatorUserId);
      if (!creator) {
        throw new Error("Creator user not found");
      }

      if (creator.role !== "team_leader") {
        throw new Error("Only team leaders can create team challenges");
      }

      const team = await teamService.getTeam(challengeData.teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      if (team.leaderId !== creatorUserId) {
        throw new Error(
          "Only the team leader can create challenges for this team"
        );
      }

      const challengeId = `challenge_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const challenge: TeamChallenge = {
        ...challengeData,
        challengeId,
        currentValue: 0,
        progress: 0,
        createdAt: new Date(),
        statistics: {
          totalParticipants: challengeData.participants.length,
          activeParticipants: challengeData.participants.length,
          completionRate: 0,
          averageContribution: 0,
          completedBy: [],
          topContributors: [],
        },
      };

      await setDoc(doc(db, "teamChallenges", challengeId), challenge);

      // Create participation records for all participants
      const participationPromises = challengeData.participants.map(
        async (userId) => {
          const participationId = `participation_${challengeId}_${userId}`;
          const participation: TeamChallengeParticipation = {
            participationId,
            challengeId,
            userId,
            teamId: challengeData.teamId,
            contribution: 0,
            joinedAt: new Date(),
            lastUpdated: new Date(),
            isActive: true,
          };
          return setDoc(
            doc(db, "teamChallengeParticipations", participationId),
            participation
          );
        }
      );

      await Promise.all(participationPromises);

      return challengeId;
    } catch (error) {
      console.error("Error creating team challenge:", error);
      throw error;
    }
  },

  /**
   * Get team challenges for a specific team
   */
  async getTeamChallenges(teamId: string): Promise<TeamChallenge[]> {
    try {
      const challengesQuery = query(
        collection(db, "teamChallenges"),
        where("teamId", "==", teamId)
      );

      const snapshot = await getDocs(challengesQuery);
      const challenges = snapshot.docs.map(
        (doc) => doc.data() as TeamChallenge
      );

      return challenges.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } catch (error) {
      console.error("Error getting team challenges:", error);
      throw error;
    }
  },

  /**
   * Get a specific team challenge
   */
  async getTeamChallenge(challengeId: string): Promise<TeamChallenge | null> {
    try {
      const challengeDoc = await getDoc(doc(db, "teamChallenges", challengeId));
      return challengeDoc.exists()
        ? (challengeDoc.data() as TeamChallenge)
        : null;
    } catch (error) {
      console.error("Error getting team challenge:", error);
      throw error;
    }
  },

  /**
   * Delete a team challenge (only by team leader)
   */
  async deleteTeamChallenge(
    challengeId: string,
    requestorId: string
  ): Promise<void> {
    try {
      const { default: TeamService } = await import("./TeamService");

      const challenge = await this.getTeamChallenge(challengeId);
      if (!challenge) {
        throw new Error("Challenge not found");
      }

      const team = await TeamService.getTeam(challenge.teamId);
      if (!team || team.leaderId !== requestorId) {
        throw new Error("Only the team leader can delete this challenge");
      }

      // Delete all participation records
      const participationsQuery = query(
        collection(db, "teamChallengeParticipations"),
        where("challengeId", "==", challengeId)
      );

      const snapshot = await getDocs(participationsQuery);
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the challenge
      await deleteDoc(doc(db, "teamChallenges", challengeId));
    } catch (error) {
      console.error("Error deleting team challenge:", error);
      throw error;
    }
  },

  // ===== CHALLENGE PARTICIPATION =====

  /**
   * Get user's participation in a challenge
   */
  async getChallengeParticipation(
    challengeId: string,
    userId: string
  ): Promise<TeamChallengeParticipation | null> {
    try {
      const participationId = `participation_${challengeId}_${userId}`;
      const participationDoc = await getDoc(
        doc(db, "teamChallengeParticipations", participationId)
      );
      return participationDoc.exists()
        ? (participationDoc.data() as TeamChallengeParticipation)
        : null;
    } catch (error) {
      console.error("Error getting challenge participation:", error);
      throw error;
    }
  },

  /**
   * Update team challenge progress
   */
  async updateChallengeProgress(
    challengeId: string,
    userId: string,
    newContribution: number
  ): Promise<void> {
    try {
      const challenge = await this.getTeamChallenge(challengeId);
      if (!challenge) {
        throw new Error("Challenge not found");
      }

      const participationId = `participation_${challengeId}_${userId}`;
      const participationRef = doc(
        db,
        "teamChallengeParticipations",
        participationId
      );

      await updateDoc(participationRef, {
        contribution: newContribution,
        lastUpdated: new Date(),
      });

      await this.recalculateChallengeProgress(challengeId);
    } catch (error) {
      console.error("Error updating challenge progress:", error);
      throw error;
    }
  },

  async recalculateChallengeProgress(challengeId: string): Promise<void> {
    try {
      const challenge = await this.getTeamChallenge(challengeId);
      if (!challenge) return;

      const participationsQuery = query(
        collection(db, "teamChallengeParticipations"),
        where("challengeId", "==", challengeId),
        where("isActive", "==", true)
      );

      const snapshot = await getDocs(participationsQuery);
      const participations = snapshot.docs.map(
        (doc) => doc.data() as TeamChallengeParticipation
      );

      const totalContribution = participations.reduce(
        (sum, p) => sum + p.contribution,
        0
      );
      const progress = Math.min(
        (totalContribution / challenge.targetValue) * 100,
        100
      );
      const averageContribution =
        participations.length > 0
          ? totalContribution / participations.length
          : 0;

      // Determine who completed the challenge
      const completedBy: string[] = [];
      const topContributors = participations
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 5)
        .map((p) => ({ userId: p.userId, contribution: p.contribution }));

      if (progress >= 100) {
        completedBy.push(...participations.map((p) => p.userId));
      }

      const updateData: Partial<TeamChallenge> = {
        currentValue: totalContribution,
        progress,
        statistics: {
          ...challenge.statistics,
          activeParticipants: participations.length,
          averageContribution,
          completionRate: progress,
          completedBy,
          topContributors,
        },
      };

      // Check if challenge is completed
      if (progress >= 100 && challenge.status === "active") {
        updateData.status = "completed";
        updateData.completedAt = new Date();
      }

      await updateDoc(doc(db, "teamChallenges", challengeId), updateData);
    } catch (error) {
      console.error("Error recalculating challenge progress:", error);
      throw error;
    }
  },

  // ===== AUTO-UPDATE PROGRESS METHODS =====

  /**
   * Auto-update challenge progress when user gains XP
   */
  async updateUserXPProgress(userId: string, xpGained: number): Promise<void> {
    try {
      // Get all active challenges where this user participates
      const challengesQuery = query(
        collection(db, "teamChallenges"),
        where("participants", "array-contains", userId),
        where("isActive", "==", true),
        where("type", "==", "xp")
      );

      const snapshot = await getDocs(challengesQuery);
      const challenges = snapshot.docs.map(
        (doc) => doc.data() as TeamChallenge
      );

      // Update participation for each XP challenge
      const updatePromises = challenges.map(async (challenge) => {
        const participation = await this.getChallengeParticipation(
          challenge.challengeId,
          userId
        );
        if (participation) {
          const newContribution = participation.contribution + xpGained;
          await this.updateChallengeProgress(
            challenge.challengeId,
            userId,
            newContribution
          );
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating XP progress:", error);
    }
  },

  /**
   * Auto-update challenge progress when user completes quest
   */
  async updateUserQuestProgress(userId: string): Promise<void> {
    try {
      // Get all active quest challenges where this user participates
      const challengesQuery = query(
        collection(db, "teamChallenges"),
        where("participants", "array-contains", userId),
        where("isActive", "==", true),
        where("type", "==", "quests")
      );

      const snapshot = await getDocs(challengesQuery);
      const challenges = snapshot.docs.map(
        (doc) => doc.data() as TeamChallenge
      );

      // Update participation for each quest challenge
      const updatePromises = challenges.map(async (challenge) => {
        const participation = await this.getChallengeParticipation(
          challenge.challengeId,
          userId
        );
        if (participation) {
          const newContribution = participation.contribution + 1;
          await this.updateChallengeProgress(
            challenge.challengeId,
            userId,
            newContribution
          );
        }
      });

      await Promise.all(updatePromises);

      // Check if any challenges were completed and send notifications
      await this.checkAndNotifyCompletedChallenges(challenges);
    } catch (error) {
      console.error("Error updating quest progress:", error);
    }
  },

  /**
   * Check if challenges are completed and notify team members
   */
  async checkAndNotifyCompletedChallenges(
    challenges: TeamChallenge[]
  ): Promise<void> {
    try {
      for (const challenge of challenges) {
        const updatedChallenge = await this.getTeamChallenge(
          challenge.challengeId
        );
        if (
          updatedChallenge &&
          updatedChallenge.statistics.completedBy.length > 0 &&
          challenge.statistics.completedBy.length === 0
        ) {
          // Challenge just completed! Send notifications
          await this.notifyTeamChallengeCompleted(updatedChallenge);
        }
      }
    } catch (error) {
      console.error("Error checking completed challenges:", error);
    }
  },

  /**
   * Notify team members when challenge is completed
   */
  async notifyTeamChallengeCompleted(challenge: TeamChallenge): Promise<void> {
    try {
      const TeamService = (await import("./TeamService")).default;

      const completedBy = challenge.statistics.completedBy[0];
      const team = await TeamService.getTeam(challenge.teamId);

      if (team) {
        const notification = {
          title: "🎉 Challenge Completed!",
          message: `${challenge.title} has been completed by your team!`,
          type: "challenge_completed" as const,
          data: {
            challengeId: challenge.challengeId,
            teamId: challenge.teamId,
            completedBy,
          },
        };

        // For now, just logging the notification
        console.log("Challenge completed notification:", notification);
      }
    } catch (error) {
      console.error("Error notifying challenge completion:", error);
    }
  },

  // ===== REAL-TIME SUBSCRIPTIONS =====

  /**
   * Subscribe to team challenge updates for real-time sync
   */
  subscribeToTeamChallenges(
    teamId: string,
    callback: (challenges: TeamChallenge[]) => void
  ): () => void {
    const challengesQuery = query(
      collection(db, "teamChallenges"),
      where("teamId", "==", teamId)
    );

    const unsubscribe = onSnapshot(challengesQuery, (snapshot) => {
      const challenges = snapshot.docs.map(
        (doc) => doc.data() as TeamChallenge
      );

      const sortedChallenges = challenges.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      callback(sortedChallenges);
    });

    return unsubscribe;
  },

  /**
   * Subscribe to specific challenge updates
   */
  subscribeToChallenge(
    challengeId: string,
    callback: (challenge: TeamChallenge | null) => void
  ): () => void {
    const challengeDoc = doc(db, "teamChallenges", challengeId);

    const unsubscribe = onSnapshot(challengeDoc, (snapshot) => {
      const challenge = snapshot.exists()
        ? (snapshot.data() as TeamChallenge)
        : null;
      callback(challenge);
    });

    return unsubscribe;
  },
};

export default TeamChallengeService;
