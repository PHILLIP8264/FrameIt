import { UserService } from "./user/UserService";
import { TeamService } from "./team/TeamService";
import { QuestService } from "./quest/QuestService";
import { AnalyticsService } from "./analytics/AnalyticsService";
import { SecurityService } from "./security/SecurityService";

// Import Firebase dependencies from the legacy service
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
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import {
  User,
  Group,
  Team,
  CompletedQuest,
  Tag,
  Achievement,
  Submission,
  Quest,
  QuestAttempt,
  QuestReview,
  QuestAnalytics,
  Friend,
  FriendRequest,
  Engagement,
  AppAnalytics,
  TeamChallenge,
  TeamChallengeParticipation,
  TeamActivity,
} from "../types/database";

// Temporary interfaces for missing types
interface TeamInvite {
  id: string;
  teamId: string;
  invitedUserId: string;
  invitedBy: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: any;
}

interface QuestCompletion {
  id: string;
  questId: string;
  teamId?: string;
  userId: string;
  completedAt: any;
  score?: number;
}

/**
 * Modern Firestore Service that combines all specialized services
 * with legacy method compatibility for backward compatibility
 */
export class ModernFirestoreService {
  public readonly users: UserService;
  public readonly teams: TeamService;
  public readonly quests: QuestService;
  public readonly analytics: AnalyticsService;
  public readonly security: SecurityService;

  constructor() {
    this.users = new UserService();
    this.teams = new TeamService();
    this.quests = new QuestService();
    this.analytics = new AnalyticsService();
    this.security = new SecurityService();
  }

  // Legacy User Management Methods - Direct implementation for backward compatibility
  async getUser(userId: string): Promise<User | null> {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? (userDoc.data() as User) : null;
  }

  async setUser(userId: string, userData: User): Promise<void> {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, userData, { merge: true });
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      return usersSnapshot.docs.map((doc) => doc.data() as User);
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async updateUserRole(
    userId: string,
    newRole: "basic" | "team_leader" | "admin"
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  async awardAchievement(
    userId: string,
    achievementId: string
  ): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      const userAchievements = user.achievements || [];

      // Don't award if already has achievement
      if (userAchievements.includes(achievementId)) {
        return false;
      }

      // Update user with new achievement
      await this.setUser(userId, {
        ...user,
        achievements: [...userAchievements, achievementId],
      });

      console.log(`🏆 Achievement awarded: ${achievementId} to user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error awarding achievement:", error);
      return false;
    }
  }

  async searchUsers(
    searchTerm: string,
    currentUserId: string
  ): Promise<User[]> {
    try {
      const usersRef = collection(db, "users");
      const normalizedSearch = searchTerm.toLowerCase();

      // Search by display name
      const nameQuery = query(
        usersRef,
        where("displayName", ">=", searchTerm),
        where("displayName", "<=", searchTerm + "\uf8ff"),
        limit(10)
      );

      const nameSnapshot = await getDocs(nameQuery);
      let users = nameSnapshot.docs
        .map((doc) => doc.data() as User)
        .filter((user) => user.userId !== currentUserId);

      // If no results from exact match, try case-insensitive search
      if (users.length === 0) {
        const allUsersSnapshot = await getDocs(usersRef);
        users = allUsersSnapshot.docs
          .map((doc) => doc.data() as User)
          .filter(
            (user) =>
              user.userId !== currentUserId &&
              (user.displayName.toLowerCase().includes(normalizedSearch) ||
                user.email.toLowerCase().includes(normalizedSearch))
          )
          .slice(0, 10);
      }

      return users;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  // Legacy Team Management Methods - Direct implementation for backward compatibility
  async getTeams(): Promise<Team[]> {
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    return teamsSnapshot.docs.map((doc) => doc.data() as Team);
  }

  async createTeam(
    teamData: {
      name: string;
      description?: string;
      maxMembers?: number;
    },
    creatorUserId: string
  ): Promise<string> {
    try {
      const creator = await this.getUser(creatorUserId);
      if (!creator) {
        throw new Error("Creator user not found");
      }

      if (creator.role !== "team_leader") {
        throw new Error("Only team leaders can create teams");
      }

      // Generate team ID
      const teamId = `team_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newTeam: Team = {
        teamId,
        name: teamData.name,
        description: teamData.description,
        createdBy: creatorUserId,
        leaderId: creatorUserId,
        members: [creatorUserId],
        createdAt: new Date(),
        maxMembers: teamData.maxMembers || 10,
        isActive: true,
      };

      // Create the team
      await setDoc(doc(db, "teams", teamId), newTeam);

      // Update the creator's user record to add this team
      const updatedTeams = [...(creator.teams || []), teamId];
      await updateDoc(doc(db, "users", creatorUserId), {
        teams: updatedTeams,
        primaryTeam: creator.primaryTeam || teamId,
      });

      return teamId;
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  }

  async getTeam(teamId: string): Promise<Team | null> {
    try {
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      return teamDoc.exists() ? (teamDoc.data() as Team) : null;
    } catch (error) {
      console.error("Error getting team:", error);
      return null;
    }
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    try {
      const team = await this.getTeam(teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      const memberPromises = team.members.map((memberId) =>
        this.getUser(memberId)
      );
      const members = await Promise.all(memberPromises);

      return members.filter((member) => member !== null) as User[];
    } catch (error) {
      console.error("Error getting team members:", error);
      return [];
    }
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    try {
      const user = await this.getUser(userId);
      if (!user || !user.teams || user.teams.length === 0) {
        return [];
      }

      const teamPromises = user.teams.map((teamId) => this.getTeam(teamId));
      const teams = await Promise.all(teamPromises);

      return teams.filter((team) => team !== null) as Team[];
    } catch (error) {
      console.error("Error getting user teams:", error);
      return [];
    }
  }

  async addUserToTeam(
    teamId: string,
    userId: string,
    requestorId: string
  ): Promise<void> {
    try {
      const [team, user, requestor] = await Promise.all([
        this.getTeam(teamId),
        this.getUser(userId),
        this.getUser(requestorId),
      ]);

      if (!team || !user || !requestor) {
        throw new Error("Team, user, or requestor not found");
      }

      if (!team.isActive) {
        throw new Error("Cannot add users to inactive team");
      }

      if (requestor.role !== "team_leader" || team.leaderId !== requestorId) {
        throw new Error("Only the team leader can add members to the team");
      }

      if (team.members.includes(userId)) {
        throw new Error("User is already a member of this team");
      }

      if (team.maxMembers && team.members.length >= team.maxMembers) {
        throw new Error("Team has reached maximum member capacity");
      }

      // Add user to team members
      const updatedMembers = [...team.members, userId];
      await updateDoc(doc(db, "teams", teamId), {
        members: updatedMembers,
      });

      // Update user's team assignments
      const userTeams = user.teams || [];
      const updatedUserTeams = [...userTeams, teamId];
      const updateData: any = { teams: updatedUserTeams };

      // Set as primary team if user has no primary team
      if (!user.primaryTeam) {
        updateData.primaryTeam = teamId;
      }

      await updateDoc(doc(db, "users", userId), updateData);
    } catch (error) {
      console.error("Error adding user to team:", error);
      throw error;
    }
  }

  async generateTeamCode(teamId: string): Promise<string> {
    try {
      const team = await this.getTeam(teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      // Generate a 6-character alphanumeric code
      const code = Math.random().toString(36).substr(2, 6).toUpperCase();

      // Update team with the code
      await updateDoc(doc(db, "teams", teamId), {
        inviteCode: code,
        codeGeneratedAt: new Date(),
        codeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      return code;
    } catch (error) {
      console.error("Error generating team code:", error);
      throw error;
    }
  }

  async joinTeamByCode(userId: string, teamCode: string): Promise<void> {
    try {
      // Find team with the invite code
      const teamsQuery = query(
        collection(db, "teams"),
        where("inviteCode", "==", teamCode),
        where("isActive", "==", true)
      );

      const teamsSnapshot = await getDocs(teamsQuery);

      if (teamsSnapshot.empty) {
        throw new Error("Invalid or expired team code");
      }

      const teamDoc = teamsSnapshot.docs[0];
      const team = teamDoc.data() as Team;

      // Check if code is expired - handle Firestore Timestamp
      if (team.codeExpiresAt) {
        const expiresAt =
          team.codeExpiresAt instanceof Date
            ? team.codeExpiresAt
            : (team.codeExpiresAt as any).toDate(); // Convert Firestore Timestamp to Date

        if (new Date() > expiresAt) {
          throw new Error("Team code has expired");
        }
      }

      // Check if team is full
      if (team.maxMembers && team.members.length >= team.maxMembers) {
        throw new Error("Team is full");
      }

      // Check if user is already a member
      if (team.members.includes(userId)) {
        throw new Error("You are already a member of this team");
      }

      const user = await this.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Add user to team
      const updatedMembers = [...team.members, userId];
      await updateDoc(doc(db, "teams", team.teamId), {
        members: updatedMembers,
      });

      // Update user's team assignments
      const userTeams = user.teams || [];
      const updatedUserTeams = [...userTeams, team.teamId];
      const updateData: any = { teams: updatedUserTeams };

      // Set as primary team if user has no primary team
      if (!user.primaryTeam) {
        updateData.primaryTeam = team.teamId;
      }

      await updateDoc(doc(db, "users", userId), updateData);
    } catch (error) {
      console.error("Error joining team by code:", error);
      throw error;
    }
  }

  // Legacy Quest Management Methods - Direct implementation for backward compatibility
  async getQuestById(questId: string): Promise<Quest | null> {
    try {
      const questDoc = await getDoc(doc(db, "quests", questId));
      return questDoc.exists() ? (questDoc.data() as Quest) : null;
    } catch (error) {
      console.error("Error fetching quest by ID:", error);
      return null;
    }
  }

  async getQuests(
    options: {
      category?: string;
      difficulty?: string;
      minLevel?: number;
      userLocation?: { latitude: number; longitude: number };
      limitCount?: number;
    } = {}
  ): Promise<Quest[]> {
    let questsQuery = query(collection(db, "quests"));

    // Add basic filter for active quests first
    questsQuery = query(questsQuery, where("status", "==", "active"));

    // Add other filters only if specified to minimize index requirements
    if (options.category) {
      questsQuery = query(
        questsQuery,
        where("category", "==", options.category)
      );
    }
    if (options.difficulty) {
      questsQuery = query(
        questsQuery,
        where("difficulty", "==", options.difficulty)
      );
    }
    if (options.minLevel) {
      questsQuery = query(
        questsQuery,
        where("minLevel", "<=", options.minLevel)
      );
    }

    if (options.limitCount) {
      questsQuery = query(questsQuery, limit(options.limitCount));
    }

    const questsSnapshot = await getDocs(questsQuery);
    let quests = questsSnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          questId: doc.id,
        } as Quest)
    );

    // Sort on client side by XP reward (descending)
    quests = quests.sort((a, b) => b.xpReward - a.xpReward);

    // Apply limit after sorting if needed
    if (options.limitCount && quests.length > options.limitCount) {
      quests = quests.slice(0, options.limitCount);
    }

    return quests;
  }

  async getUserQuestAttempts(userId: string): Promise<QuestAttempt[]> {
    try {
      // Query without orderBy to avoid index requirement
      const attemptsQuery = query(
        collection(db, "questAttempts"),
        where("userId", "==", userId)
      );

      const attemptsSnapshot = await getDocs(attemptsQuery);
      const attempts = attemptsSnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            attemptId: doc.id,
          } as QuestAttempt)
      );

      // Sort on client side instead of server side
      return attempts.sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
    } catch (error) {
      console.error("Error getting user quest attempts:", error);
      return [];
    }
  }

  async getUserActiveQuestAttempts(userId: string): Promise<QuestAttempt[]> {
    try {
      const allAttempts = await this.getUserQuestAttempts(userId);
      return allAttempts.filter((attempt) => attempt.status === "in-progress");
    } catch (error) {
      console.error("Error getting user active quest attempts:", error);
      return [];
    }
  }

  async getQuestAnalytics(questId: string): Promise<QuestAnalytics | null> {
    try {
      const analyticsDoc = await getDoc(doc(db, "questAnalytics", questId));
      return analyticsDoc.exists()
        ? (analyticsDoc.data() as QuestAnalytics)
        : null;
    } catch (error) {
      console.error("Error getting quest analytics:", error);
      return null;
    }
  }

  async getQuestReviews(questId: string): Promise<QuestReview[]> {
    try {
      // Query without orderBy to avoid composite index requirement
      const reviewsQuery = query(
        collection(db, "questReviews"),
        where("questId", "==", questId),
        limit(10)
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = reviewsSnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            reviewId: doc.id,
          } as QuestReview)
      );

      // Sort on client side by helpful votes (descending)
      return reviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
    } catch (error) {
      console.error("Error getting quest reviews:", error);
      return [];
    }
  }

  async getTeamQuests(userId: string, options: any = {}): Promise<Quest[]> {
    try {
      const user = await this.getUser(userId);
      if (!user || !user.teams || user.teams.length === 0) {
        return []; // User not in any teams
      }

      let questsQuery = query(
        collection(db, "quests"),
        where("status", "==", "active"),
        where("questType", "==", "team"),
        where("targetTeams", "array-contains-any", user.teams)
      );

      if (options.limitCount) {
        questsQuery = query(questsQuery, limit(options.limitCount));
      }

      const snapshot = await getDocs(questsQuery);
      let quests = snapshot.docs.map((doc) => doc.data() as Quest);

      return quests;
    } catch (error) {
      console.error("Error getting team quests:", error);
      return [];
    }
  }

  async getCompletedQuests(userId: string): Promise<CompletedQuest[]> {
    try {
      const questsSnapshot = await getDocs(
        collection(db, "users", userId, "completedQuests")
      );
      return questsSnapshot.docs.map((doc) => doc.data() as CompletedQuest);
    } catch (error) {
      console.error("Error getting completed quests:", error);
      return [];
    }
  }

  // Legacy Friends Management Methods
  async getUserFriends(userId: string): Promise<any[]> {
    try {
      const user = await this.getUser(userId);
      return user?.friends || [];
    } catch (error) {
      console.error("Error getting user friends:", error);
      return [];
    }
  }

  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
    try {
      const fromUser = await this.getUser(fromUserId);
      if (!fromUser) throw new Error("User not found");

      const friendRequest = {
        requestId: `${fromUserId}_${toUserId}_${Date.now()}`,
        fromUserId,
        toUserId,
        fromUserName: fromUser.displayName,
        fromUserImage: fromUser.profileImageUrl,
        status: "pending" as const,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "friendRequests"), friendRequest);
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw error;
    }
  }

  // Legacy Submission Methods
  async getUserSubmissions(userId: string): Promise<Submission[]> {
    try {
      const submissionsQuery = query(
        collection(db, "submissions"),
        where("userId", "==", userId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      return submissionsSnapshot.docs.map((doc) => doc.data() as Submission);
    } catch (error) {
      console.error("Error getting user submissions:", error);
      return [];
    }
  }

  async addSubmission(submission: Submission): Promise<void> {
    try {
      const submissionDocRef = doc(db, "submissions", submission.subId);
      await setDoc(submissionDocRef, submission);
    } catch (error) {
      console.error("Error adding submission:", error);
      throw error;
    }
  }

  // Legacy System Configuration Method
  async getSystemConfiguration(): Promise<any> {
    try {
      const configDoc = await getDoc(doc(db, "system", "configuration"));
      if (configDoc.exists()) {
        return configDoc.data();
      }
      // Return default configuration if none exists
      return {
        maxTeamSize: 10,
        xpMultiplier: 1.0,
        questCooldownMinutes: 5,
        maxQuestAttempts: 3,
      };
    } catch (error) {
      console.error("Error getting system configuration:", error);
      return {
        maxTeamSize: 10,
        xpMultiplier: 1.0,
        questCooldownMinutes: 5,
        maxQuestAttempts: 3,
      };
    }
  }

  // Legacy Achievement and Tag Methods
  async getAchievements(): Promise<Achievement[]> {
    try {
      const achievementsSnapshot = await getDocs(
        collection(db, "achievements")
      );
      return achievementsSnapshot.docs.map((doc) => doc.data() as Achievement);
    } catch (error) {
      console.error("Error getting achievements:", error);
      return [];
    }
  }

  async getTags(): Promise<Tag[]> {
    try {
      const tagsSnapshot = await getDocs(collection(db, "tags"));
      return tagsSnapshot.docs.map((doc) => doc.data() as Tag);
    } catch (error) {
      console.error("Error getting tags:", error);
      return [];
    }
  }

  async addCompletedQuest(
    userId: string,
    quest: CompletedQuest
  ): Promise<void> {
    try {
      const questDocRef = doc(
        db,
        "users",
        userId,
        "completedQuests",
        quest.questId
      );
      await setDoc(questDocRef, quest);
    } catch (error) {
      console.error("Error adding completed quest:", error);
      throw error;
    }
  }

  // Legacy Team Challenge Methods
  async getTeamChallenges(teamId: string): Promise<TeamChallenge[]> {
    try {
      const challengesQuery = query(
        collection(db, "teamChallenges"),
        where("teamId", "==", teamId)
      );
      const challengesSnapshot = await getDocs(challengesQuery);
      return challengesSnapshot.docs.map((doc) => doc.data() as TeamChallenge);
    } catch (error) {
      console.error("Error getting team challenges:", error);
      return [];
    }
  }

  // Additional Quest Management Methods
  async canUserAttemptQuest(
    userId: string,
    questId: string
  ): Promise<{
    canAttempt: boolean;
    reason?: string;
  }> {
    try {
      const [user, quest] = await Promise.all([
        this.getUser(userId),
        getDoc(doc(db, "quests", questId)),
      ]);

      if (!user || !quest.exists()) {
        return { canAttempt: false, reason: "User or quest not found" };
      }

      const questData = quest.data() as Quest;

      // Check if quest is already completed
      const completedQuests = await this.getCompletedQuests(userId);
      const isCompleted = completedQuests.some((cq) => cq.questId === questId);
      if (isCompleted) {
        return {
          canAttempt: false,
          reason: "Quest already completed.",
        };
      }

      // Check user level
      if (user.level < questData.minLevel) {
        return {
          canAttempt: false,
          reason: `Requires level ${questData.minLevel}. You are level ${user.level}.`,
        };
      }

      return { canAttempt: true };
    } catch (error) {
      console.error("Error checking if user can attempt quest:", error);
      return { canAttempt: false, reason: "Error checking permissions" };
    }
  }

  async startQuestAttemptWithLimitCheck(
    userId: string,
    questId: string,
    userLocation?: any
  ): Promise<{ success: boolean; attemptId?: string; error?: string }> {
    try {
      const canAttempt = await this.canUserAttemptQuest(userId, questId);
      if (!canAttempt.canAttempt) {
        return {
          success: false,
          error: canAttempt.reason || "Cannot attempt quest",
        };
      }

      const attempt = {
        questId,
        userId,
        startedAt: new Date().toISOString(),
        status: "in-progress",
        ...(userLocation && { location: userLocation }),
      };

      const attemptRef = await addDoc(collection(db, "questAttempts"), attempt);
      return { success: true, attemptId: attemptRef.id };
    } catch (error) {
      console.error("Error starting quest attempt:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async cancelQuestAttempt(attemptId: string): Promise<void> {
    try {
      const attemptRef = doc(db, "questAttempts", attemptId);
      await updateDoc(attemptRef, {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error cancelling quest attempt:", error);
      throw error;
    }
  }

  // Location utility method
  calculateDistance(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(coord2.latitude - coord1.latitude);
    const dLon = this.deg2rad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coord1.latitude)) *
        Math.cos(this.deg2rad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Photo Voting Methods
  async getSubmissionVotes(submissionId: string): Promise<any> {
    try {
      const votesQuery = query(
        collection(db, "photoVotes"),
        where("submissionId", "==", submissionId)
      );

      const votesSnapshot = await getDocs(votesQuery);
      const votes = votesSnapshot.docs.map((doc) => doc.data());

      // Calculate vote statistics
      const voteStats = {
        total: votes.length,
        breakdown: {
          likes: votes.filter((v) => v.voteType === "like").length,
          loves: votes.filter((v) => v.voteType === "love").length,
          creative: votes.filter((v) => v.voteType === "creative").length,
          technical: votes.filter((v) => v.voteType === "technical").length,
        },
        averageRating:
          votes.length > 0
            ? votes.reduce((sum, vote) => sum + vote.rating, 0) / votes.length
            : 0,
        totalVoters: votes.length,
        categoryAverages: {
          composition:
            votes.length > 0
              ? votes.reduce(
                  (sum, vote) => sum + (vote.categories?.composition || 0),
                  0
                ) / votes.length
              : 0,
          creativity:
            votes.length > 0
              ? votes.reduce(
                  (sum, vote) => sum + (vote.categories?.creativity || 0),
                  0
                ) / votes.length
              : 0,
          technicalQuality:
            votes.length > 0
              ? votes.reduce(
                  (sum, vote) =>
                    sum + (vote.categories?.techniqualQuality || 0),
                  0
                ) / votes.length
              : 0,
          questAlignment:
            votes.length > 0
              ? votes.reduce(
                  (sum, vote) => sum + (vote.categories?.questAlignment || 0),
                  0
                ) / votes.length
              : 0,
        },
        recentVotes: votes
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 5),
      };

      return voteStats;
    } catch (error) {
      console.error("Error getting submission votes:", error);
      return {
        total: 0,
        breakdown: { likes: 0, loves: 0, creative: 0, technical: 0 },
        averageRating: 0,
        totalVoters: 0,
      };
    }
  }

  // Additional Quest Analytics Methods
  async getDailyQuestCount(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attemptsQuery = query(
        collection(db, "questAttempts"),
        where("userId", "==", userId),
        where("startedAt", ">=", today.toISOString()),
        where("startedAt", "<", tomorrow.toISOString())
      );

      const attemptsSnapshot = await getDocs(attemptsQuery);
      return attemptsSnapshot.size;
    } catch (error) {
      console.error("Error getting daily quest count:", error);
      return 0;
    }
  }

  // Admin-specific methods - Basic implementations
  async getAllQuests(): Promise<Quest[]> {
    try {
      const questsQuery = query(collection(db, "quests"));
      const questsSnapshot = await getDocs(questsQuery);
      const quests = questsSnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            questId: doc.id,
          } as Quest)
      );
      return quests.sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
    } catch (error) {
      console.error("Error getting all quests:", error);
      return [];
    }
  }

  async getAllSubmissions(): Promise<Submission[]> {
    try {
      const submissionsSnapshot = await getDocs(collection(db, "submissions"));
      return submissionsSnapshot.docs.map((doc) => doc.data() as Submission);
    } catch (error) {
      console.error("Error getting all submissions:", error);
      return [];
    }
  }

  // Admin functionality - return empty/default data for now
  async getEngagementData(days: number): Promise<any> {
    console.log(`getEngagementData(${days}) - implementation pending`);
    return { daily: [], weekly: [], monthly: [] };
  }

  async getCommunications(): Promise<any[]> {
    console.log("getCommunications - implementation pending");
    return [];
  }

  async getAdminLogs(limit: number): Promise<any[]> {
    console.log(`getAdminLogs(${limit}) - implementation pending`);
    return [];
  }

  async getSecurityAlerts(): Promise<any[]> {
    console.log("getSecurityAlerts - implementation pending");
    return [];
  }

  async getFailedLoginAttempts(hours: number): Promise<any[]> {
    console.log(`getFailedLoginAttempts(${hours}) - implementation pending`);
    return [];
  }

  async getBlockedIpAddresses(): Promise<any[]> {
    console.log("getBlockedIpAddresses - implementation pending");
    return [];
  }

  async getLockedAccounts(): Promise<any[]> {
    console.log("getLockedAccounts - implementation pending");
    return [];
  }

  async getDailyActiveUsers(): Promise<any> {
    console.log("getDailyActiveUsers - implementation pending");
    return { count: 0, trend: [] };
  }

  async getUserRetentionMetrics(): Promise<any> {
    console.log("getUserRetentionMetrics - implementation pending");
    return { retention: 0, churn: 0 };
  }

  async getSystemHealth(): Promise<any> {
    console.log("getSystemHealth - implementation pending");
    return { status: "healthy", uptime: "99.9%" };
  }

  async getRecentActivity(limit: number): Promise<any[]> {
    console.log(`getRecentActivity(${limit}) - implementation pending`);
    return [];
  }

  async getPerformanceMetrics(): Promise<any> {
    console.log("getPerformanceMetrics - implementation pending");
    return { responseTime: 100, throughput: 1000 };
  }

  async sendCommunication(data: any): Promise<boolean> {
    console.log("sendCommunication - implementation pending", data);
    return true;
  }

  async logAdminAction(data: any): Promise<void> {
    console.log("logAdminAction - implementation pending", data);
  }

  // Additional Team Methods
  async getTeamActivities(teamId: string): Promise<TeamActivity[]> {
    try {
      const activitiesQuery = query(
        collection(db, "teamActivities"),
        where("teamId", "==", teamId),
        orderBy("timestamp", "desc"),
        limit(50)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      return activitiesSnapshot.docs.map((doc) => doc.data() as TeamActivity);
    } catch (error) {
      console.error("Error getting team activities:", error);
      return [];
    }
  }

  // Subscription methods - simplified implementations
  subscribeToTeam(
    teamId: string,
    callback: (team: Team | null) => void
  ): () => void {
    const teamRef = doc(db, "teams", teamId);
    const unsubscribe = onSnapshot(teamRef, (doc) => {
      callback(doc.exists() ? (doc.data() as Team) : null);
    });
    return unsubscribe;
  }

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
      callback(challenges);
    });
    return unsubscribe;
  }

  async removeUserFromTeam(
    teamId: string,
    userId: string,
    requestorId: string
  ): Promise<void> {
    try {
      const teamRef = doc(db, "teams", teamId);
      const teamDoc = await getDoc(teamRef);

      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;

        // Only team leader can remove members
        if (teamData.leaderId !== requestorId) {
          throw new Error("Only team leader can remove members");
        }

        const updatedMembers = teamData.members.filter(
          (memberId) => memberId !== userId
        );

        await updateDoc(teamRef, {
          members: updatedMembers,
          memberCount: updatedMembers.length,
        });
      }
    } catch (error) {
      console.error("Error removing user from team:", error);
      throw error;
    }
  }

  async getTeamInvites(teamId: string): Promise<TeamInvite[]> {
    try {
      const invitesQuery = query(
        collection(db, "teamInvites"),
        where("teamId", "==", teamId)
      );
      const invitesSnapshot = await getDocs(invitesQuery);
      return invitesSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as TeamInvite)
      );
    } catch (error) {
      console.error("Error getting team invites:", error);
      return [];
    }
  }

  async getTeamQuestCompletions(teamId: string): Promise<QuestCompletion[]> {
    try {
      const completionsQuery = query(
        collection(db, "questCompletions"),
        where("teamId", "==", teamId)
      );
      const completionsSnapshot = await getDocs(completionsQuery);
      return completionsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as QuestCompletion)
      );
    } catch (error) {
      console.error("Error getting team quest completions:", error);
      return [];
    }
  }

  async deleteTeam(teamId: string, requestorId: string): Promise<void> {
    try {
      const teamRef = doc(db, "teams", teamId);
      const teamDoc = await getDoc(teamRef);

      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;

        // Only team leader can delete team
        if (teamData.leaderId === requestorId) {
          await deleteDoc(teamRef);
        } else {
          throw new Error("Only team leader can delete team");
        }
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  }

  // Submission subscription method
  subscribeToSubmission(
    submissionId: string,
    callback: (submission: Submission | null) => void
  ): () => void {
    const submissionRef = doc(db, "submissions", submissionId);
    const unsubscribe = onSnapshot(submissionRef, (doc) => {
      callback(doc.exists() ? (doc.data() as Submission) : null);
    });
    return unsubscribe;
  }

  // Friend management methods
  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, "friendRequests"),
        where("recipientId", "==", userId),
        where("status", "==", "pending")
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      return requestsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as unknown as FriendRequest)
      );
    } catch (error) {
      console.error("Error getting friend requests:", error);
      return [];
    }
  }

  async getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, "friendRequests"),
        where("senderId", "==", userId),
        where("status", "==", "pending")
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      return requestsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as unknown as FriendRequest)
      );
    } catch (error) {
      console.error("Error getting sent friend requests:", error);
      return [];
    }
  }

  async acceptFriendRequest(
    requestId: string,
    fromUserId: string,
    toUserId: string
  ): Promise<void> {
    try {
      const requestRef = doc(db, "friendRequests", requestId);
      await updateDoc(requestRef, {
        status: "accepted",
        acceptedAt: serverTimestamp(),
      });

      // Create friend relationships for both users
      await Promise.all([
        addDoc(collection(db, "friends"), {
          userId: fromUserId,
          friendId: toUserId,
          createdAt: serverTimestamp(),
        }),
        addDoc(collection(db, "friends"), {
          userId: toUserId,
          friendId: fromUserId,
          createdAt: serverTimestamp(),
        }),
      ]);
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw error;
    }
  }

  async declineFriendRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, "friendRequests", requestId);
      await updateDoc(requestRef, {
        status: "declined",
        declinedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error declining friend request:", error);
      throw error;
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      // Remove friend relationship from both users
      const userFriendsQuery = query(
        collection(db, "friends"),
        where("userId", "==", userId),
        where("friendId", "==", friendId)
      );
      const friendUserQuery = query(
        collection(db, "friends"),
        where("userId", "==", friendId),
        where("friendId", "==", userId)
      );

      const [userSnapshot, friendSnapshot] = await Promise.all([
        getDocs(userFriendsQuery),
        getDocs(friendUserQuery),
      ]);

      const deletePromises: Promise<void>[] = [];
      userSnapshot.docs.forEach((doc) =>
        deletePromises.push(deleteDoc(doc.ref))
      );
      friendSnapshot.docs.forEach((doc) =>
        deletePromises.push(deleteDoc(doc.ref))
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error removing friend:", error);
      throw error;
    }
  }

  // Tag management methods
  async createTag(tag: Tag): Promise<void> {
    try {
      await addDoc(collection(db, "tags"), tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  }

  async updateTag(tag: Tag): Promise<void> {
    try {
      if (tag.id) {
        const tagRef = doc(db, "tags", tag.id);
        await updateDoc(tagRef, tag as any);
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      throw error;
    }
  }

  async deleteTag(tagId: string): Promise<void> {
    try {
      const tagRef = doc(db, "tags", tagId);
      await deleteDoc(tagRef);
    } catch (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  }

  // Quest management methods
  async createQuest(questData: Quest, userId: string): Promise<void> {
    try {
      await addDoc(collection(db, "quests"), {
        ...questData,
        createdBy: userId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating quest:", error);
      throw error;
    }
  }

  async completeQuestAttempt(
    attemptId: string,
    submissionId: string
  ): Promise<void> {
    try {
      const attemptRef = doc(db, "questAttempts", attemptId);
      await updateDoc(attemptRef, {
        status: "completed",
        submissionId: submissionId,
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error completing quest attempt:", error);
      throw error;
    }
  }

  async updateUserQuestProgress(userId: string): Promise<void> {
    try {
      // Implementation note - count completed quests
      const completedQuery = query(
        collection(db, "questAttempts"),
        where("userId", "==", userId),
        where("status", "==", "completed")
      );
      const completedSnapshot = await getDocs(completedQuery);

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        completedQuests: completedSnapshot.docs.length,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user quest progress:", error);
      throw error;
    }
  }

  async updateUserXPProgress(userId: string, xpGained: number): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const newXP = (userData.xp || 0) + xpGained;

        await updateDoc(userRef, {
          xp: newXP,
          level: Math.floor(newXP / 100) + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error updating user XP progress:", error);
      throw error;
    }
  }

  async getUserRole(userId: string) {
    return this.security.getUserRole(userId);
  }

  async setUserRole(
    userId: string,
    role: any,
    permissions: string[] = [],
    assignedBy: string,
    expiresAt?: Date
  ) {
    return this.security.setUserRole(
      userId,
      role,
      permissions,
      assignedBy,
      expiresAt
    );
  }

  async isAdmin(userId: string) {
    return this.security.isAdmin(userId);
  }

  async trackEvent(
    userId: string,
    eventType: string,
    eventData: any = {},
    sessionId?: string
  ) {
    return this.analytics.trackEvent(userId, eventType, eventData, sessionId);
  }

  async getUserStats(userId: string) {
    return this.analytics.getUserStats(userId);
  }

  async updateUserStats(userId: string, updates: any) {
    return this.analytics.updateUserStats(userId, updates);
  }

  async initialize() {
    console.log("ModernFirestoreService initialized with specialized services");
  }

  // Health check method
  async healthCheck() {
    try {
      await this.users.getAll();
      await this.teams.getAll();
      await this.quests.getAll();
      return { status: "healthy", timestamp: new Date() };
    } catch (error) {
      console.error("Health check failed:", error);
      return {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }
}

export const modernFirestoreService = new ModernFirestoreService();
