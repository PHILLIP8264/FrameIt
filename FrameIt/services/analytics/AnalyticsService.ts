import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  writeBatch,
  increment,
  doc,
} from "firebase/firestore";
import { BaseFirebaseService } from "../base/BaseFirebaseService";
import { db } from "../../config/firebase";

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
  sessionId?: string;
  platform?: string;
  version?: string;
}

export interface UserStats {
  userId: string;
  questsCompleted: number;
  totalPoints: number;
  achievementsUnlocked: number;
  teamsJoined: number;
  loginStreak: number;
  lastActiveDate: Date;
  totalSessions: number;
  avgSessionDuration: number;
}

export interface TeamStats {
  teamId: string;
  totalMembers: number;
  totalPoints: number;
  questsCompleted: number;
  achievementsUnlocked: number;
  avgMemberActivity: number;
  createdDate: Date;
}

export class AnalyticsService extends BaseFirebaseService {
  private userStatsService: BaseFirebaseService;
  private teamStatsService: BaseFirebaseService;

  constructor() {
    super("analyticsEvents");
    this.userStatsService = new BaseFirebaseService("userStats");
    this.teamStatsService = new BaseFirebaseService("teamStats");
  }

  async trackEvent(
    userId: string,
    eventType: string,
    eventData: any = {},
    sessionId?: string
  ): Promise<void> {
    const eventId = `${userId}_${eventType}_${Date.now()}`;
    const event: Partial<AnalyticsEvent> = {
      userId,
      eventType,
      eventData,
      timestamp: new Date(),
      sessionId,
      platform: "mobile",
    };
    return this.create(eventId, event);
  }

  async getUserEvents(
    userId: string,
    limitCount?: number
  ): Promise<AnalyticsEvent[]> {
    try {
      const q = limitCount
        ? query(
            collection(db, this.collectionName),
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            firestoreLimit(limitCount)
          )
        : query(
            collection(db, this.collectionName),
            where("userId", "==", userId),
            orderBy("timestamp", "desc")
          );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as AnalyticsEvent);
    } catch (error) {
      console.error("Error getting user events:", error);
      return [];
    }
  }

  async getEventsByType(
    eventType: string,
    limitCount?: number
  ): Promise<AnalyticsEvent[]> {
    try {
      const q = limitCount
        ? query(
            collection(db, this.collectionName),
            where("eventType", "==", eventType),
            orderBy("timestamp", "desc"),
            firestoreLimit(limitCount)
          )
        : query(
            collection(db, this.collectionName),
            where("eventType", "==", eventType),
            orderBy("timestamp", "desc")
          );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as AnalyticsEvent);
    } catch (error) {
      console.error("Error getting events by type:", error);
      return [];
    }
  }

  async updateUserStats(
    userId: string,
    updates: Partial<UserStats>
  ): Promise<void> {
    return this.userStatsService.update(userId, {
      ...updates,
      lastActiveDate: new Date(),
    });
  }

  async incrementUserStat(
    userId: string,
    statField: string,
    amount: number = 1
  ): Promise<void> {
    return this.userStatsService.update(userId, {
      [statField]: increment(amount),
      lastActiveDate: new Date(),
    });
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    return this.userStatsService.getById<UserStats>(userId);
  }

  async updateTeamStats(
    teamId: string,
    updates: Partial<TeamStats>
  ): Promise<void> {
    return this.teamStatsService.update(teamId, updates);
  }

  async incrementTeamStat(
    teamId: string,
    statField: string,
    amount: number = 1
  ): Promise<void> {
    return this.teamStatsService.update(teamId, {
      [statField]: increment(amount),
    });
  }

  async getTeamStats(teamId: string): Promise<TeamStats | null> {
    return this.teamStatsService.getById<TeamStats>(teamId);
  }

  async getTopUsers(
    statField: keyof UserStats,
    limitCount: number = 10
  ): Promise<UserStats[]> {
    try {
      const q = query(
        collection(db, "userStats"),
        orderBy(statField as string, "desc"),
        firestoreLimit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as UserStats);
    } catch (error) {
      console.error("Error getting top users:", error);
      return [];
    }
  }

  async getTopTeams(
    statField: keyof TeamStats,
    limitCount: number = 10
  ): Promise<TeamStats[]> {
    try {
      const q = query(
        collection(db, "teamStats"),
        orderBy(statField as string, "desc"),
        firestoreLimit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as TeamStats);
    } catch (error) {
      console.error("Error getting top teams:", error);
      return [];
    }
  }

  async initializeUserStats(userId: string): Promise<void> {
    const initialStats: Partial<UserStats> = {
      userId,
      questsCompleted: 0,
      totalPoints: 0,
      achievementsUnlocked: 0,
      teamsJoined: 0,
      loginStreak: 1,
      lastActiveDate: new Date(),
      totalSessions: 1,
      avgSessionDuration: 0,
    };
    return this.userStatsService.create(userId, initialStats);
  }

  async initializeTeamStats(teamId: string): Promise<void> {
    const initialStats: Partial<TeamStats> = {
      teamId,
      totalMembers: 1,
      totalPoints: 0,
      questsCompleted: 0,
      achievementsUnlocked: 0,
      avgMemberActivity: 0,
      createdDate: new Date(),
    };
    return this.teamStatsService.create(teamId, initialStats);
  }

  // Batch analytics operations for performance
  async batchTrackEvents(
    events: Array<{
      userId: string;
      eventType: string;
      eventData?: any;
      sessionId?: string;
    }>
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const timestamp = new Date();

      events.forEach((event, index) => {
        const eventId = `${event.userId}_${
          event.eventType
        }_${timestamp.getTime()}_${index}`;
        const docRef = doc(db, this.collectionName, eventId);
        batch.set(docRef, {
          ...event,
          timestamp,
          platform: "mobile",
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error batch tracking events:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
