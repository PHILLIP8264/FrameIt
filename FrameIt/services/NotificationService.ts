import { Platform } from "react-native";
import {
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  collection,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface NotificationData {
  id: string;
  userId: string;
  type:
    | "quest_completion"
    | "contest_result"
    | "team_invite"
    | "friend_request"
    | "moderation_result"
    | "achievement_unlocked"
    | "daily_reminder"
    | "team_quest"
    | "level_up";
  title: string;
  body: string;
  data?: any;
  read: boolean;
  dismissed?: boolean;
  createdAt: Date;
}

class NotificationService {
  private static instance: NotificationService;
  private listeners: Map<string, () => void> = new Map();
  private notificationCallbacks: Set<(notification: NotificationData) => void> =
    new Set();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      console.log("In-app notification service initialized");
    } catch (error) {
      console.error("Error initializing notification service:", error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      console.log("In-app notifications enabled");
      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  /**
   * Register callback for new notifications
   */
  onNewNotification(
    callback: (notification: NotificationData) => void
  ): () => void {
    this.notificationCallbacks.add(callback);
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  /**
   * Trigger notification callbacks
   */
  private triggerNotificationCallbacks(notification: NotificationData): void {
    this.notificationCallbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error("Error in notification callback:", error);
      }
    });
  }

  /**
   * Listen for real-time notifications for a user
   */
  subscribeToUserNotifications(
    userId: string,
    onNotification: (notification: NotificationData) => void
  ): () => void {
    // Simplified query without composite index requirement
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Get all notifications and filter unread ones in client
      const allNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as NotificationData[];

      // Filter unread and sort by createdAt in client
      const unreadNotifications = allNotifications
        .filter((notif) => !notif.read)
        .sort((a, b) => {
          const dateA =
            a.createdAt instanceof Date
              ? a.createdAt
              : new Date(a.createdAt || 0);
          const dateB =
            b.createdAt instanceof Date
              ? b.createdAt
              : new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notificationData = {
            id: change.doc.id,
            ...change.doc.data(),
            createdAt: change.doc.data().createdAt?.toDate(),
          } as NotificationData;

          // Only process unread notifications
          if (!notificationData.read) {
            onNotification(notificationData);

            // Trigger UI callbacks for new notifications
            this.triggerNotificationCallbacks(notificationData);
          }
        }
      });
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Get recent notifications for a user
   */
  async getRecentNotifications(
    userId: string,
    limitCount: number = 5
  ): Promise<NotificationData[]> {
    try {
      // Simplified query without composite index requirement
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        limit(50) // Get more to sort and filter on client
      );

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as NotificationData[];

      // Sort by createdAt on client side, filter out dismissed, and limit
      return notifications
        .filter((notification) => !notification.dismissed)
        .sort((a, b) => {
          const dateA =
            a.createdAt instanceof Date
              ? a.createdAt
              : new Date(a.createdAt || 0);
          const dateB =
            b.createdAt instanceof Date
              ? b.createdAt
              : new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error getting recent notifications:", error);
      return [];
    }
  }

  /**
   * Create a notification in Firestore
   */
  async createNotification(
    userId: string,
    type: NotificationData["type"],
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type,
        title,
        body,
        data: data || {},
        read: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, {
          read: true,
          readAt: new Date(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  /**
   * Send quest completion notification
   */
  async notifyQuestCompletion(
    userId: string,
    questTitle: string,
    xpEarned: number
  ): Promise<void> {
    await this.createNotification(
      userId,
      "quest_completion",
      "Quest Completed! 🎉",
      `You completed "${questTitle}" and earned ${xpEarned} XP!`,
      { questTitle, xpEarned }
    );
  }

  /**
   * Send achievement unlocked notification
   */
  async notifyAchievementUnlocked(
    userId: string,
    achievementTitle: string,
    achievementDescription: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      "achievement_unlocked",
      "Achievement Unlocked! 🏆",
      `${achievementTitle}: ${achievementDescription}`,
      { achievementTitle, achievementDescription }
    );
  }

  /**
   * Send level up notification
   */
  async notifyLevelUp(
    userId: string,
    newLevel: number,
    xpTotal: number
  ): Promise<void> {
    await this.createNotification(
      userId,
      "level_up",
      "Level Up! 🚀",
      `Congratulations! You've reached level ${newLevel} with ${xpTotal} XP!`,
      { newLevel, xpTotal }
    );
  }

  /**
   * Send contest result notification
   */
  async notifyContestResult(
    userId: string,
    contestTitle: string,
    position: number,
    totalSubmissions: number
  ): Promise<void> {
    const positionText =
      position === 1
        ? "🥇 1st"
        : position === 2
        ? "🥈 2nd"
        : position === 3
        ? "🥉 3rd"
        : `#${position}`;

    await this.createNotification(
      userId,
      "contest_result",
      "Contest Results! 📊",
      `You placed ${positionText} out of ${totalSubmissions} in "${contestTitle}"!`,
      { contestTitle, position, totalSubmissions }
    );
  }

  /**
   * Send team invite notification
   */
  async notifyTeamInvite(
    userId: string,
    teamName: string,
    inviterName: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      "team_invite",
      "Team Invitation 👥",
      `${inviterName} invited you to join "${teamName}"!`,
      { teamName, inviterName }
    );
  }

  /**
   * Send team quest notification
   */
  async notifyTeamQuest(
    userIds: string[],
    questTitle: string,
    teamName: string
  ): Promise<void> {
    const promises = userIds.map((userId) =>
      this.createNotification(
        userId,
        "team_quest",
        "New Team Quest! 🎯",
        `Your team "${teamName}" has started "${questTitle}"!`,
        { questTitle, teamName }
      )
    );

    await Promise.all(promises);
  }

  /**
   * Send moderation result notification
   */
  async notifyModerationResult(
    userId: string,
    questTitle: string,
    approved: boolean,
    reason?: string
  ): Promise<void> {
    const title = approved ? "Photo Approved! ✅" : "Photo Needs Review 📷";
    const body = approved
      ? `Your photo for "${questTitle}" has been approved!`
      : `Your photo for "${questTitle}" needs revision. ${
          reason || "Please try again."
        }`;

    await this.createNotification(userId, "moderation_result", title, body, {
      questTitle,
      approved,
      reason,
    });
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false)
      );

      const snapshot = await getDocs(q);

      // Filter out dismissed notifications on client side
      const notifications = snapshot.docs.map((doc) => doc.data());
      const undismissedUnread = notifications.filter(
        (notification) => !notification.dismissed
      );

      return undismissedUnread.length;
    } catch (error) {
      console.error("Error getting badge count:", error);
      return 0;
    }
  }

  /**
   * Dismiss a notification
   */
  async dismissNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        dismissed: true,
        dismissedAt: new Date(),
      });
    } catch (error) {
      console.error("Error dismissing notification:", error);
      throw error;
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
    this.notificationCallbacks.clear();
  }
}

export default NotificationService.getInstance();
