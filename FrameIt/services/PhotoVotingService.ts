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
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const PhotoVotingService = {
  // ===== VOTING FUNCTIONS =====

  /**
   * Cast a vote on a quest photo
   */
  async voteOnPhoto(
    photoId: string,
    voterId: string,
    voteType: "upvote" | "downvote"
  ): Promise<void> {
    try {
      const UserService = (await import("./UserService")).default;

      const voter = await UserService.getUser(voterId);
      if (!voter) {
        throw new Error("Voter not found");
      }

      const photoDoc = await getDoc(doc(db, "questPhotos", photoId));
      if (!photoDoc.exists()) {
        throw new Error("Photo not found");
      }

      const photoData = photoDoc.data();
      const currentVotes = photoData.votes || {};
      const voterPreviousVote = currentVotes[voterId];

      const batch = writeBatch(db);
      const photoRef = doc(db, "questPhotos", photoId);

      // Track vote changes for analytics
      let upvoteChange = 0;
      let downvoteChange = 0;

      if (voterPreviousVote === voteType) {
        // Remove vote if clicking same vote
        const { [voterId]: removed, ...remainingVotes } = currentVotes;
        batch.update(photoRef, {
          votes: remainingVotes,
          upvotes: increment(voteType === "upvote" ? -1 : 0),
          downvotes: increment(voteType === "downvote" ? -1 : 0),
          voteScore: increment(voteType === "upvote" ? -1 : 1),
        });

        if (voteType === "upvote") upvoteChange = -1;
        else downvoteChange = -1;
      } else {
        // Add or change vote
        const newVotes = { ...currentVotes, [voterId]: voteType };

        if (voterPreviousVote) {
          // Changing from opposite vote
          batch.update(photoRef, {
            votes: newVotes,
            upvotes: increment(voteType === "upvote" ? 1 : -1),
            downvotes: increment(voteType === "downvote" ? 1 : -1),
            voteScore: increment(voteType === "upvote" ? 2 : -2),
          });

          if (voteType === "upvote") {
            upvoteChange = 1;
            downvoteChange = -1;
          } else {
            upvoteChange = -1;
            downvoteChange = 1;
          }
        } else {
          // New vote
          batch.update(photoRef, {
            votes: newVotes,
            upvotes: increment(voteType === "upvote" ? 1 : 0),
            downvotes: increment(voteType === "downvote" ? 1 : 0),
            voteScore: increment(voteType === "upvote" ? 1 : -1),
          });

          if (voteType === "upvote") upvoteChange = 1;
          else downvoteChange = 1;
        }
      }

      // Update user last activity
      const userRef = doc(db, "users", voterId);
      batch.update(userRef, {
        lastActiveDate: new Date(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Error voting on photo:", error);
      throw error;
    }
  },

  /**
   * Get voting statistics for a photo
   */
  async getPhotoVoteStats(photoId: string): Promise<{
    upvotes: number;
    downvotes: number;
    voteScore: number;
    totalVotes: number;
    votes: Record<string, "upvote" | "downvote">;
  }> {
    try {
      const photoDoc = await getDoc(doc(db, "questPhotos", photoId));
      if (!photoDoc.exists()) {
        return {
          upvotes: 0,
          downvotes: 0,
          voteScore: 0,
          totalVotes: 0,
          votes: {},
        };
      }

      const data = photoDoc.data();
      const votes = data.votes || {};
      const upvotes = data.upvotes || 0;
      const downvotes = data.downvotes || 0;

      return {
        upvotes,
        downvotes,
        voteScore: data.voteScore || 0,
        totalVotes: upvotes + downvotes,
        votes,
      };
    } catch (error) {
      console.error("Error getting photo vote stats:", error);
      throw error;
    }
  },

  /**
   * Get top voted photos for a quest
   */
  async getTopVotedPhotos(
    questId: string,
    limitCount: number = 10
  ): Promise<any[]> {
    try {
      const photosQuery = query(
        collection(db, "questPhotos"),
        where("questId", "==", questId),
        orderBy("voteScore", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(photosQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting top voted photos:", error);
      throw error;
    }
  },

  // ===== PHOTO ANALYTICS =====

  /**
   * Get comprehensive photo analytics
   */
  async getPhotoAnalytics(photoId: string): Promise<{
    viewCount: number;
    voteStats: any;
    engagementRate: number;
    hourlyVotes: Record<string, number>;
    voterDemographics: {
      newVoters: number;
      returningVoters: number;
      averageVoterXP: number;
    };
  }> {
    try {
      const photoDoc = await getDoc(doc(db, "questPhotos", photoId));
      if (!photoDoc.exists()) {
        throw new Error("Photo not found");
      }

      const photoData = photoDoc.data();
      const voteStats = await this.getPhotoVoteStats(photoId);

      // Calculate engagement metrics
      const viewCount = photoData.viewCount || 0;
      const engagementRate =
        viewCount > 0 ? (voteStats.totalVotes / viewCount) * 100 : 0;

      // Get hourly vote distribution
      const hourlyVotes: Record<string, number> = {};
      if (photoData.voteTimestamps) {
        photoData.voteTimestamps.forEach((timestamp: any) => {
          const hour = new Date(timestamp.toDate()).getHours();
          hourlyVotes[hour] = (hourlyVotes[hour] || 0) + 1;
        });
      }

      // Calculate voter demographics
      const voterDemographics = await this.calculateVoterDemographics(
        Object.keys(voteStats.votes)
      );

      return {
        viewCount,
        voteStats,
        engagementRate,
        hourlyVotes,
        voterDemographics,
      };
    } catch (error) {
      console.error("Error getting photo analytics:", error);
      throw error;
    }
  },

  /**
   * Calculate voter demographics for a photo
   */
  async calculateVoterDemographics(voterIds: string[]): Promise<{
    newVoters: number;
    returningVoters: number;
    averageVoterXP: number;
  }> {
    try {
      if (voterIds.length === 0) {
        return {
          newVoters: 0,
          returningVoters: 0,
          averageVoterXP: 0,
        };
      }

      const UserService = (await import("./UserService")).default;
      const voterProfiles = await Promise.all(
        voterIds.map((id) => UserService.getUser(id))
      );

      const validVoters = voterProfiles.filter((voter) => voter !== null);
      let totalXP = 0;
      let newVoters = 0;
      let returningVoters = 0;

      validVoters.forEach((voter) => {
        if (voter) {
          totalXP += voter.xp || 0;

          returningVoters++;
        }
      });

      return {
        newVoters,
        returningVoters,
        averageVoterXP:
          validVoters.length > 0 ? totalXP / validVoters.length : 0,
      };
    } catch (error) {
      console.error("Error calculating voter demographics:", error);
      return {
        newVoters: 0,
        returningVoters: 0,
        averageVoterXP: 0,
      };
    }
  },

  /**
   * Track photo view for analytics
   */
  async trackPhotoView(photoId: string, viewerId?: string): Promise<void> {
    try {
      const photoRef = doc(db, "questPhotos", photoId);

      await updateDoc(photoRef, {
        viewCount: increment(1),
        lastViewed: new Date(),
      });

      // Track unique viewers if viewerId provided
      if (viewerId) {
        await updateDoc(photoRef, {
          uniqueViewers: arrayUnion(viewerId),
        });
      }
    } catch (error) {
      console.error("Error tracking photo view:", error);
    }
  },

  // ===== VOTE MANAGEMENT =====

  /**
   * Get all votes by a specific user
   */
  async getUserVotes(userId: string): Promise<
    {
      photoId: string;
      voteType: "upvote" | "downvote";
      timestamp: Date;
    }[]
  > {
    try {
      // Query photos where user has voted
      const photosQuery = query(
        collection(db, "questPhotos"),
        where(`votes.${userId}`, "in", ["upvote", "downvote"])
      );

      const snapshot = await getDocs(photosQuery);
      const userVotes: {
        photoId: string;
        voteType: "upvote" | "downvote";
        timestamp: Date;
      }[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const userVote = data.votes?.[userId];
        if (userVote) {
          userVotes.push({
            photoId: doc.id,
            voteType: userVote,
            timestamp: data.lastUpdated || data.createdAt || new Date(),
          });
        }
      });

      // Sort by timestamp descending
      return userVotes.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    } catch (error) {
      console.error("Error getting user votes:", error);
      throw error;
    }
  },

  /**
   * Remove all votes from a photo (admin function)
   */
  async clearPhotoVotes(photoId: string, adminId: string): Promise<void> {
    try {
      const UserService = (await import("./UserService")).default;

      const admin = await UserService.getUser(adminId);
      if (!admin || admin.role !== "admin") {
        throw new Error("Only admins can clear photo votes");
      }

      const photoRef = doc(db, "questPhotos", photoId);
      await updateDoc(photoRef, {
        votes: {},
        upvotes: 0,
        downvotes: 0,
        voteScore: 0,
        voteHistory: arrayUnion({
          action: "votes_cleared",
          adminId,
          timestamp: new Date(),
        }),
      });
    } catch (error) {
      console.error("Error clearing photo votes:", error);
      throw error;
    }
  },

  /**
   * Get vote leaderboard for users
   *
   */
  async getVoteLeaderboard(limitCount: number = 50): Promise<
    {
      userId: string;
      username: string;
      totalVotesCast: number;
      totalVotesReceived: number;
      voteRatio: number;
    }[]
  > {
    try {
      console.log(
        "Vote leaderboard not yet implemented - requires analytics collection"
      );
      return [];
    } catch (error) {
      console.error("Error getting vote leaderboard:", error);
      throw error;
    }
  },

  // ===== REAL-TIME SUBSCRIPTIONS =====

  /**
   * Subscribe to photo vote updates
   */
  subscribeToPhotoVotes(
    photoId: string,
    callback: (voteStats: any) => void
  ): () => void {
    const photoDoc = doc(db, "questPhotos", photoId);

    const unsubscribe = onSnapshot(photoDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const votes = data.votes || {};
        const upvotes = data.upvotes || 0;
        const downvotes = data.downvotes || 0;

        callback({
          upvotes,
          downvotes,
          voteScore: data.voteScore || 0,
          totalVotes: upvotes + downvotes,
          votes,
        });
      }
    });

    return unsubscribe;
  },

  // ===== VOTE VALIDATION =====

  /**
   * Validate vote integrity and fix inconsistencies
   */
  async validateAndFixVotes(photoId: string): Promise<{
    fixed: boolean;
    issues: string[];
  }> {
    try {
      const photoDoc = await getDoc(doc(db, "questPhotos", photoId));
      if (!photoDoc.exists()) {
        throw new Error("Photo not found");
      }

      const data = photoDoc.data();
      const votes = data.votes || {};
      const upvotes = data.upvotes || 0;
      const downvotes = data.downvotes || 0;
      const voteScore = data.voteScore || 0;

      // Calculate actual counts from votes object
      let actualUpvotes = 0;
      let actualDownvotes = 0;

      Object.values(votes).forEach((vote) => {
        if (vote === "upvote") actualUpvotes++;
        else if (vote === "downvote") actualDownvotes++;
      });

      const actualVoteScore = actualUpvotes - actualDownvotes;
      const issues: string[] = [];
      let needsUpdate = false;

      if (upvotes !== actualUpvotes) {
        issues.push(
          `Upvotes mismatch: stored=${upvotes}, actual=${actualUpvotes}`
        );
        needsUpdate = true;
      }

      if (downvotes !== actualDownvotes) {
        issues.push(
          `Downvotes mismatch: stored=${downvotes}, actual=${actualDownvotes}`
        );
        needsUpdate = true;
      }

      if (voteScore !== actualVoteScore) {
        issues.push(
          `Vote score mismatch: stored=${voteScore}, actual=${actualVoteScore}`
        );
        needsUpdate = true;
      }

      if (needsUpdate) {
        await updateDoc(doc(db, "questPhotos", photoId), {
          upvotes: actualUpvotes,
          downvotes: actualDownvotes,
          voteScore: actualVoteScore,
          lastValidated: new Date(),
        });
      }

      return {
        fixed: needsUpdate,
        issues,
      };
    } catch (error) {
      console.error("Error validating votes:", error);
      throw error;
    }
  },
};

export default PhotoVotingService;
