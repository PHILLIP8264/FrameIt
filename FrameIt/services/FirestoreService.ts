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
} from "../types/database";
import LocationService, { LocationCoords } from "./LocationService";

const FirestoreService = {
  // Get a user by ID
  async getUser(userId: string): Promise<User | null> {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? (userDoc.data() as User) : null;
  },

  // Add or update a user
  async setUser(userId: string, userData: User): Promise<void> {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, userData, { merge: true });
  },

  // User Management Functions (for Admins)

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      return usersSnapshot.docs.map((doc) => doc.data() as User);
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  },

  // Update user role (admin only)
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
  },

  // Get all groups
  async getGroups(): Promise<Group[]> {
    const groupsSnapshot = await getDocs(collection(db, "groups"));
    return groupsSnapshot.docs.map((doc) => doc.data() as Group);
  },

  // Add a new group
  async addGroup(group: Group): Promise<void> {
    const groupDocRef = doc(db, "groups", group.groupId);
    await setDoc(groupDocRef, group);
  },

  // TEAM MANAGEMENT FUNCTIONS (NEW SYSTEM)

  // Get all teams
  async getTeams(): Promise<Team[]> {
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    return teamsSnapshot.docs.map((doc) => doc.data() as Team);
  },

  // Create a new team (team leaders can create multiple teams)
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
        members: [creatorUserId], // Creator is automatically a member
        createdAt: new Date(),
        maxMembers: teamData.maxMembers || 50, // Default max 50 members
        isActive: true,
      };

      // Create the team
      await setDoc(doc(db, "teams", teamId), newTeam);

      // Update the creator's user record to add this team
      const updatedTeams = [...(creator.teams || []), teamId];
      await updateDoc(doc(db, "users", creatorUserId), {
        teams: updatedTeams,
        primaryTeam: creator.primaryTeam || teamId, // Set as primary if no primary team
      });

      return teamId;
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  },

  // Delete a team (only team leader can delete their own teams)
  async deleteTeam(teamId: string, requestorId: string): Promise<void> {
    try {
      const [team, requestor] = await Promise.all([
        this.getTeam(teamId),
        this.getUser(requestorId),
      ]);

      if (!team || !requestor) {
        throw new Error("Team or requestor not found");
      }

      // Allow admins to delete any team, or team leaders to delete their own team
      const isAdmin = requestor.role === "admin";
      const isTeamLeader =
        requestor.role === "team_leader" && team.leaderId === requestorId;

      if (!isAdmin && !isTeamLeader) {
        throw new Error("Only admins or the team leader can delete this team");
      }

      // Remove all members from the team
      const memberPromises = team.members.map(async (memberId) => {
        const member = await this.getUser(memberId);
        if (member) {
          const updatedTeams = member.teams?.filter((t) => t !== teamId) || [];
          const updateData: any = { teams: updatedTeams };

          // If this was their primary team, clear it or set to another team
          if (member.primaryTeam === teamId) {
            updateData.primaryTeam =
              updatedTeams.length > 0 ? updatedTeams[0] : null;
          }

          await updateDoc(doc(db, "users", memberId), updateData);
        }
      });

      await Promise.all(memberPromises);

      // Actually delete the team document from Firestore
      await deleteDoc(doc(db, "teams", teamId));
    } catch (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  },

  // Get team details
  async getTeam(teamId: string): Promise<Team | null> {
    try {
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      return teamDoc.exists() ? (teamDoc.data() as Team) : null;
    } catch (error) {
      console.error("Error getting team:", error);
      return null;
    }
  },

  // Get team members with their details
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
  },

  // Get teams for a specific user
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
  },

  // Add user to team (only team leader can add members)
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
  },

  // Remove user from team (only team leader can remove members)
  async removeUserFromTeam(
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

      if (!team || !requestor) {
        throw new Error("Team or requestor not found");
      }

      if (requestor.role !== "team_leader" || team.leaderId !== requestorId) {
        throw new Error(
          "Only the team leader can remove members from the team"
        );
      }

      if (userId === team.leaderId) {
        throw new Error("Team leader cannot be removed from the team");
      }

      if (!team.members.includes(userId)) {
        throw new Error("User is not a member of this team");
      }

      // Remove user from team members
      const updatedMembers = team.members.filter(
        (memberId) => memberId !== userId
      );
      await updateDoc(doc(db, "teams", teamId), {
        members: updatedMembers,
      });

      // Remove team from user's assignments
      if (user) {
        const updatedUserTeams = user.teams?.filter((t) => t !== teamId) || [];
        const updateData: any = { teams: updatedUserTeams };

        // If this was their primary team, change it
        if (user.primaryTeam === teamId) {
          updateData.primaryTeam =
            updatedUserTeams.length > 0 ? updatedUserTeams[0] : null;
        }

        await updateDoc(doc(db, "users", userId), updateData);
      }
    } catch (error) {
      console.error("Error removing user from team:", error);
      throw error;
    }
  },

  // Transfer team leadership (only current leader can transfer)
  async transferTeamLeadership(
    teamId: string,
    newLeaderId: string,
    currentLeaderId: string
  ): Promise<void> {
    try {
      const [team, newLeader, currentLeader] = await Promise.all([
        this.getTeam(teamId),
        this.getUser(newLeaderId),
        this.getUser(currentLeaderId),
      ]);

      if (!team || !newLeader || !currentLeader) {
        throw new Error("Team, new leader, or current leader not found");
      }

      if (team.leaderId !== currentLeaderId) {
        throw new Error("Only the current team leader can transfer leadership");
      }

      if (newLeader.role !== "team_leader") {
        throw new Error("New leader must have team_leader role");
      }

      if (!team.members.includes(newLeaderId)) {
        throw new Error("New leader must be a member of the team");
      }

      // Update team leadership
      await updateDoc(doc(db, "teams", teamId), {
        leaderId: newLeaderId,
      });
    } catch (error) {
      console.error("Error transferring team leadership:", error);
      throw error;
    }
  },

  // Generate team invite code
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
  },

  // Join team by code
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

      // Check if code is expired
      if (team.codeExpiresAt && new Date() > team.codeExpiresAt) {
        throw new Error("Team code has expired");
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
  },

  // LEGACY GROUP MANAGEMENT FUNCTIONS (for backward compatibility)

  // Generate group code for group leaders
  async generateGroupCode(groupId: string): Promise<string> {
    try {
      const group = await this.getGroup(groupId);
      if (!group) {
        throw new Error("Group not found");
      }

      // Generate a 6-character alphanumeric code
      const code = Math.random().toString(36).substr(2, 6).toUpperCase();

      // Update group with the code
      await updateDoc(doc(db, "groups", groupId), {
        inviteCode: code,
        codeGeneratedAt: new Date(),
        codeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      return code;
    } catch (error) {
      console.error("Error generating group code:", error);
      throw error;
    }
  },

  // Join group by code
  async joinGroupByCode(userId: string, groupCode: string): Promise<void> {
    try {
      // Find group with the invite code
      const groupsQuery = query(
        collection(db, "groups"),
        where("inviteCode", "==", groupCode),
        where("isActive", "==", true)
      );

      const groupsSnapshot = await getDocs(groupsQuery);

      if (groupsSnapshot.empty) {
        throw new Error("Invalid or expired group code");
      }

      const groupDoc = groupsSnapshot.docs[0];
      const group = groupDoc.data() as Group;

      // Check if code is expired
      if (group.codeExpiresAt && new Date() > group.codeExpiresAt) {
        throw new Error("Group code has expired");
      }

      // Check if group is full
      if (group.maxMembers && group.members.length >= group.maxMembers) {
        throw new Error("Group is full");
      }

      // Check if user is already a member
      if (group.members.includes(userId)) {
        throw new Error("You are already a member of this group");
      }

      const user = await this.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // For backward compatibility, migrate user to new team system
      // Create a team from the group if it doesn't exist
      let teamId = group.groupId.replace("group_", "team_");
      let team = await this.getTeam(teamId);

      if (!team) {
        // Migrate group to team
        const newTeam: Team = {
          teamId,
          name: group.name,
          description: group.description,
          createdBy: group.createdBy,
          leaderId: group.leaderId,
          members: group.members,
          createdAt: group.createdAt,
          maxMembers: group.maxMembers,
          isActive: group.isActive,
          inviteCode: group.inviteCode,
          codeGeneratedAt: group.codeGeneratedAt,
          codeExpiresAt: group.codeExpiresAt,
        };

        await setDoc(doc(db, "teams", teamId), newTeam);
        team = newTeam;
      }

      // Add user to team
      await this.addUserToTeam(teamId, userId, group.leaderId);
    } catch (error) {
      console.error("Error joining group by code:", error);
      throw error;
    }
  },

  // Group Management Functions (for Group Leaders)

  // Create a new group (only group leaders can create groups)
  async createGroup(
    groupData: {
      name: string;
      description?: string;
      maxMembers?: number;
    },
    creatorUserId: string
  ): Promise<string> {
    // Migrate to team system
    return this.createTeam(groupData, creatorUserId);
  },

  // Add user to group (only group leader can add members)
  async addUserToGroup(
    groupId: string,
    userId: string,
    requestorId: string
  ): Promise<void> {
    // For backward compatibility, convert to team
    const teamId = groupId.replace("group_", "team_");
    return this.addUserToTeam(teamId, userId, requestorId);
  },

  // Remove user from group (only group leader can remove members)
  async removeUserFromGroup(
    groupId: string,
    userId: string,
    requestorId: string
  ): Promise<void> {
    // For backward compatibility, convert to team
    const teamId = groupId.replace("group_", "team_");
    return this.removeUserFromTeam(teamId, userId, requestorId);
  },

  // Get group details
  async getGroup(groupId: string): Promise<Group | null> {
    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      return groupDoc.exists() ? (groupDoc.data() as Group) : null;
    } catch (error) {
      console.error("Error getting group:", error);
      return null;
    }
  },

  // Get group members with their details
  async getGroupMembers(groupId: string): Promise<User[]> {
    try {
      const group = await this.getGroup(groupId);
      if (!group) {
        throw new Error("Group not found");
      }

      const memberPromises = group.members.map((memberId) =>
        this.getUser(memberId)
      );
      const members = await Promise.all(memberPromises);

      return members.filter((member) => member !== null) as User[];
    } catch (error) {
      console.error("Error getting group members:", error);
      return [];
    }
  },

  // Transfer group leadership (only current leader can transfer)
  async transferGroupLeadership(
    groupId: string,
    newLeaderId: string,
    currentLeaderId: string
  ): Promise<void> {
    // For backward compatibility, convert to team
    const teamId = groupId.replace("group_", "team_");
    return this.transferTeamLeadership(teamId, newLeaderId, currentLeaderId);
  },

  // Get completed quests for a user
  async getCompletedQuests(userId: string): Promise<CompletedQuest[]> {
    const questsSnapshot = await getDocs(
      collection(db, "users", userId, "completedQuests")
    );
    return questsSnapshot.docs.map((doc) => doc.data() as CompletedQuest);
  },

  // Add a completed quest for a user
  async addCompletedQuest(
    userId: string,
    quest: CompletedQuest
  ): Promise<void> {
    const questDocRef = doc(
      db,
      "users",
      userId,
      "completedQuests",
      quest.questId
    );
    await setDoc(questDocRef, quest);
  },

  // Get all tags
  async getTags(): Promise<Tag[]> {
    const tagsSnapshot = await getDocs(collection(db, "tags"));
    return tagsSnapshot.docs.map((doc) => doc.data() as Tag);
  },

  // Get all achievements
  async getAchievements(): Promise<Achievement[]> {
    const achievementsSnapshot = await getDocs(collection(db, "achievements"));
    return achievementsSnapshot.docs.map((doc) => doc.data() as Achievement);
  },

  // Add a submission
  async addSubmission(submission: Submission): Promise<void> {
    const submissionDocRef = doc(db, "submissions", submission.subId);
    await setDoc(submissionDocRef, submission);
  },

  // ENHANCED QUEST FEATURES

  // Get quests with filtering and sorting
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

    // If user location provided, sort by distance instead
    if (options.userLocation) {
      quests = this.sortQuestsByDistance(quests, options.userLocation);
    }

    // Apply limit after sorting if needed
    if (options.limitCount && quests.length > options.limitCount) {
      quests = quests.slice(0, options.limitCount);
    }

    return quests;
  },

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ): number {
    return LocationService.calculateDistance(coord1, coord2);
  },

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  },

  // Sort quests by distance from user location
  sortQuestsByDistance(
    quests: Quest[],
    userLocation: { latitude: number; longitude: number }
  ): Quest[] {
    return quests.sort((a, b) => {
      const distanceA = LocationService.calculateDistance(
        userLocation,
        a.coordinates
      );
      const distanceB = LocationService.calculateDistance(
        userLocation,
        b.coordinates
      );
      return distanceA - distanceB;
    });
  },

  // Start a quest attempt
  async startQuestAttempt(
    userId: string,
    questId: string,
    userLocation?: { latitude: number; longitude: number }
  ): Promise<string> {
    const attempt: Omit<QuestAttempt, "attemptId"> = {
      questId,
      userId,
      startedAt: new Date().toISOString(),
      status: "in-progress",
      location: userLocation,
    };

    const attemptRef = await addDoc(collection(db, "questAttempts"), attempt);
    return attemptRef.id;
  },

  // Complete a quest attempt
  async completeQuestAttempt(
    attemptId: string,
    submissionId?: string
  ): Promise<void> {
    const attemptRef = doc(db, "questAttempts", attemptId);
    await updateDoc(attemptRef, {
      completedAt: new Date().toISOString(),
      status: "completed",
      submissionId: submissionId || null,
    });
  },

  // Get user's quest attempts
  async getUserQuestAttempts(userId: string): Promise<QuestAttempt[]> {
    // Option 1: Query without orderBy to avoid index requirement
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
  },

  // Add a quest review
  async addQuestReview(review: Omit<QuestReview, "reviewId">): Promise<void> {
    const reviewData = {
      ...review,
      timestamp: new Date().toISOString(),
      helpfulVotes: 0,
    };

    await addDoc(collection(db, "questReviews"), reviewData);
  },

  // Get reviews for a quest
  async getQuestReviews(questId: string): Promise<QuestReview[]> {
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
  },

  // Get quest analytics
  async getQuestAnalytics(questId: string): Promise<QuestAnalytics | null> {
    const analyticsDoc = await getDoc(doc(db, "questAnalytics", questId));
    return analyticsDoc.exists()
      ? (analyticsDoc.data() as QuestAnalytics)
      : null;
  },

  // Update quest statistics
  async updateQuestStatistics(
    questId: string,
    updates: Partial<QuestAnalytics>
  ): Promise<void> {
    const analyticsRef = doc(db, "questAnalytics", questId);
    await updateDoc(analyticsRef, {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
  },

  // Check if user can attempt quest (level, prerequisites, etc.)
  async canUserAttemptQuest(
    userId: string,
    questId: string
  ): Promise<{
    canAttempt: boolean;
    reason?: string;
  }> {
    const [user, quest] = await Promise.all([
      this.getUser(userId),
      getDoc(doc(db, "quests", questId)),
    ]);

    if (!user || !quest.exists()) {
      return { canAttempt: false, reason: "User or quest not found" };
    }

    const questData = quest.data() as Quest;

    // Check user level
    if (user.level < questData.minLevel) {
      return {
        canAttempt: false,
        reason: `Requires level ${questData.minLevel}. You are level ${user.level}.`,
      };
    }

    // Check max attempts
    if (questData.maxAttempts) {
      const userAttempts = await getDocs(
        query(
          collection(db, "questAttempts"),
          where("userId", "==", userId),
          where("questId", "==", questId)
        )
      );

      if (userAttempts.size >= questData.maxAttempts) {
        return {
          canAttempt: false,
          reason: `Maximum attempts (${questData.maxAttempts}) reached.`,
        };
      }
    }

    // Check if quest is within available hours
    if (questData.availableHours) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour + currentMinute / 60;

      const startTime = this.parseTimeString(questData.availableHours.start);
      const endTime = this.parseTimeString(questData.availableHours.end);

      if (currentTime < startTime || currentTime > endTime) {
        return {
          canAttempt: false,
          reason: `Quest only available ${questData.availableHours.start} - ${questData.availableHours.end}`,
        };
      }
    }

    return { canAttempt: true };
  },

  // Helper function to parse time string (HH:MM) to decimal hours
  parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours + minutes / 60;
  },

  // Get nearby quests based on user location
  async getNearbyQuests(
    userLocation: { latitude: number; longitude: number },
    radiusKm: number = 10,
    limitCount: number = 10
  ): Promise<(Quest & { distance: number })[]> {
    // Get all active quests (in a real app, you'd use geohash for better performance)
    const quests = await this.getQuests({ limitCount: 100 });

    // Filter by distance and add distance property
    const nearbyQuests = quests
      .map((quest) => ({
        ...quest,
        distance: LocationService.calculateDistance(
          userLocation,
          quest.coordinates
        ),
      }))
      .filter((quest) => quest.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limitCount);

    return nearbyQuests;
  },

  // Check if user is within quest location
  isUserAtQuestLocation(
    userLocation: { latitude: number; longitude: number },
    quest: Quest
  ): boolean {
    return LocationService.isWithinQuestRadius(
      userLocation,
      quest.coordinates,
      quest.radius
    );
  },

  // Get direction to quest
  getDirectionToQuest(
    userLocation: { latitude: number; longitude: number },
    quest: Quest
  ): string {
    return LocationService.getDirection(userLocation, quest.coordinates);
  },

  // Format distance for display
  formatDistance(distanceKm: number): string {
    return LocationService.formatDistance(distanceKm);
  },

  // Quest Type Filtering Functions

  // Get global quests (available to everyone)
  async getGlobalQuests(
    options: {
      limitCount?: number;
      userLocation?: { latitude: number; longitude: number };
    } = {}
  ): Promise<Quest[]> {
    let questsQuery = query(
      collection(db, "quests"),
      where("status", "==", "active"),
      where("questType", "==", "global"),
      where("visibility", "==", "public")
    );

    if (options.limitCount) {
      questsQuery = query(questsQuery, limit(options.limitCount));
    }

    const snapshot = await getDocs(questsQuery);
    let quests = snapshot.docs.map((doc) => doc.data() as Quest);

    // Sort by distance if user location provided
    if (options.userLocation) {
      quests = this.sortQuestsByDistance(quests, options.userLocation);
    }

    return quests;
  },

  // Get team-specific quests for a user
  async getTeamQuests(
    userId: string,
    options: {
      limitCount?: number;
      userLocation?: { latitude: number; longitude: number };
    } = {}
  ): Promise<Quest[]> {
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

      // Sort by distance if user location provided
      if (options.userLocation) {
        quests = this.sortQuestsByDistance(quests, options.userLocation);
      }

      return quests;
    } catch (error) {
      console.error("Error getting team quests:", error);
      return [];
    }
  },

  // LEGACY: Get group-specific quests for a user (for backward compatibility)
  async getGroupQuests(
    userId: string,
    options: {
      limitCount?: number;
      userLocation?: { latitude: number; longitude: number };
    } = {}
  ): Promise<Quest[]> {
    // Redirect to team quests for compatibility
    return this.getTeamQuests(userId, options);
  },

  // Get all accessible quests for a user (combines global and team quests)
  async getAllAccessibleQuests(
    userId: string,
    options: {
      limitCount?: number;
      userLocation?: { latitude: number; longitude: number };
    } = {}
  ): Promise<Quest[]> {
    try {
      const [globalQuests, teamQuests] = await Promise.all([
        this.getGlobalQuests(options),
        this.getTeamQuests(userId, options),
      ]);

      // Combine all quests and remove duplicates
      const allQuests = [...globalQuests, ...teamQuests];
      const uniqueQuests = allQuests.filter(
        (quest, index, self) =>
          index === self.findIndex((q) => q.questId === quest.questId)
      );

      // Sort by distance if user location provided
      if (options.userLocation) {
        return this.sortQuestsByDistance(uniqueQuests, options.userLocation);
      }

      // Otherwise sort by XP reward
      return uniqueQuests.sort((a, b) => b.xpReward - a.xpReward);
    } catch (error) {
      console.error("Error getting all accessible quests:", error);
      return [];
    }
  },

  // Create a new quest with proper type and access control
  async createQuest(
    quest: Omit<Quest, "questId">,
    creatorUserId: string
  ): Promise<string> {
    try {
      const creator = await this.getUser(creatorUserId);
      if (!creator) {
        throw new Error("Creator user not found");
      }

      // Validate user can create this quest type
      this.validateQuestCreationPermissions(quest.questType, creator);

      // Generate quest ID
      const questId = `quest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Set creator role and quest type
      const questWithMetadata: Quest = {
        ...quest,
        questId,
        createdBy: creatorUserId,
        creatorRole: creator.role as "admin" | "team_leader",
      };

      // Set appropriate visibility and target teams based on quest type
      if (questWithMetadata.questType === "global") {
        questWithMetadata.visibility = "public";
      } else if (questWithMetadata.questType === "team") {
        questWithMetadata.visibility = "team";
        // If no target teams specified, use creator's primary team
        if (!questWithMetadata.targetTeams && creator.primaryTeam) {
          questWithMetadata.targetTeams = [creator.primaryTeam];
        }
      }

      await setDoc(doc(db, "quests", questId), questWithMetadata);
      return questId;
    } catch (error) {
      console.error("Error creating quest:", error);
      throw error;
    }
  },

  // Validate if user can create a specific quest type
  validateQuestCreationPermissions(
    questType: "global" | "team",
    creator: User
  ): void {
    switch (questType) {
      case "global":
        if (creator.role !== "admin") {
          throw new Error("Only admin users can create global quests");
        }
        break;

      case "team":
        if (creator.role !== "team_leader") {
          throw new Error("Only team leaders can create team quests");
        }
        if (!creator.primaryTeam) {
          throw new Error(
            "Team leaders must be assigned to a team to create team quests"
          );
        }
        break;

      default:
        throw new Error("Invalid quest type");
    }
  },

  // Friends Management Functions

  // Search users by display name or email
  async searchUsers(
    searchTerm: string,
    currentUserId: string
  ): Promise<User[]> {
    try {
      const usersRef = collection(db, "users");
      const normalizedSearch = searchTerm.toLowerCase();

      // Search by display name (case insensitive)
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
  },

  // Send friend request
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
    try {
      const fromUser = await this.getUser(fromUserId);
      if (!fromUser) throw new Error("User not found");

      // Check if users are already friends
      const userFriends = await this.getUserFriends(fromUserId);
      const isAlreadyFriend = userFriends.some(
        (friend) => friend.friendId === toUserId
      );
      if (isAlreadyFriend) {
        throw new Error("Users are already friends");
      }

      // Check if there's already a pending request (simplified query)
      const existingRequestsQuery = query(
        collection(db, "friendRequests"),
        where("fromUserId", "==", fromUserId)
      );
      const existingRequestsSnapshot = await getDocs(existingRequestsQuery);
      const hasExistingRequest = existingRequestsSnapshot.docs.some((doc) => {
        const data = doc.data();
        return data.toUserId === toUserId && data.status === "pending";
      });

      if (hasExistingRequest) {
        throw new Error("Friend request already sent");
      }

      // Check for reverse request (simplified query)
      const reverseRequestsQuery = query(
        collection(db, "friendRequests"),
        where("fromUserId", "==", toUserId)
      );
      const reverseRequestsSnapshot = await getDocs(reverseRequestsQuery);
      const hasReverseRequest = reverseRequestsSnapshot.docs.some((doc) => {
        const data = doc.data();
        return data.toUserId === fromUserId && data.status === "pending";
      });

      if (hasReverseRequest) {
        throw new Error("This user has already sent you a friend request");
      }

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
  },

  // Get pending friend requests for a user
  async getFriendRequests(userId: string): Promise<any[]> {
    try {
      const requestsRef = collection(db, "friendRequests");
      // Simplified query - only filter by toUserId first
      const q = query(requestsRef, where("toUserId", "==", userId));

      const snapshot = await getDocs(q);
      const allRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by status in client and sort by createdAt
      const pendingRequests = allRequests
        .filter((req: any) => req.status === "pending")
        .sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return dateB - dateA;
        });

      return pendingRequests;
    } catch (error) {
      console.error("Error getting friend requests:", error);
      return [];
    }
  },

  // Get sent friend requests for a user
  async getSentFriendRequests(userId: string): Promise<any[]> {
    try {
      const requestsRef = collection(db, "friendRequests");
      // Simplified query - only filter by fromUserId first
      const q = query(requestsRef, where("fromUserId", "==", userId));

      const snapshot = await getDocs(q);
      const allRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by status in client and sort by createdAt
      const pendingRequests = allRequests
        .filter((req: any) => req.status === "pending")
        .sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return dateB - dateA;
        });

      return pendingRequests;
    } catch (error) {
      console.error("Error getting sent friend requests:", error);
      return [];
    }
  },

  // Accept friend request
  async acceptFriendRequest(
    requestId: string,
    fromUserId: string,
    toUserId: string
  ): Promise<void> {
    try {
      // Update request status
      const requestRef = doc(db, "friendRequests", requestId);
      await updateDoc(requestRef, { status: "accepted" });

      // Add friend to both users' friends lists
      const [fromUser, toUser] = await Promise.all([
        this.getUser(fromUserId),
        this.getUser(toUserId),
      ]);

      if (!fromUser || !toUser) throw new Error("Users not found");

      const fromUserFriend = {
        friendId: toUserId,
        displayName: toUser.displayName,
        profileImageUrl: toUser.profileImageUrl,
        level: toUser.level,
        status: "accepted" as const,
        addedAt: new Date(),
      };

      const toUserFriend = {
        friendId: fromUserId,
        displayName: fromUser.displayName,
        profileImageUrl: fromUser.profileImageUrl,
        level: fromUser.level,
        status: "accepted" as const,
        addedAt: new Date(),
      };

      // Update both users' friends arrays
      await Promise.all([
        updateDoc(doc(db, "users", fromUserId), {
          friends: [...(fromUser.friends || []), toUserFriend],
        }),
        updateDoc(doc(db, "users", toUserId), {
          friends: [...(toUser.friends || []), fromUserFriend],
        }),
      ]);
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw error;
    }
  },

  // Decline friend request
  async declineFriendRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, "friendRequests", requestId);
      await updateDoc(requestRef, { status: "declined" });
    } catch (error) {
      console.error("Error declining friend request:", error);
      throw error;
    }
  },

  // Remove friend
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      const [user, friend] = await Promise.all([
        this.getUser(userId),
        this.getUser(friendId),
      ]);

      if (!user || !friend) throw new Error("Users not found");

      // Remove from both users' friends lists
      const updatedUserFriends = (user.friends || []).filter(
        (f) => f.friendId !== friendId
      );
      const updatedFriendFriends = (friend.friends || []).filter(
        (f) => f.friendId !== userId
      );

      await Promise.all([
        updateDoc(doc(db, "users", userId), { friends: updatedUserFriends }),
        updateDoc(doc(db, "users", friendId), {
          friends: updatedFriendFriends,
        }),
      ]);
    } catch (error) {
      console.error("Error removing friend:", error);
      throw error;
    }
  },

  // Get user's friends
  async getUserFriends(userId: string): Promise<any[]> {
    try {
      const user = await this.getUser(userId);
      return user?.friends || [];
    } catch (error) {
      console.error("Error getting user friends:", error);
      return [];
    }
  },
};

export default FirestoreService;
