import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
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
  CompletedQuest,
  Tag,
  Achievement,
  Submission,
  Quest,
  QuestAttempt,
  QuestReview,
  QuestAnalytics,
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
};

export default FirestoreService;
