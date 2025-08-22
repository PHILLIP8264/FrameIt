import { BaseFirebaseService } from "../base/BaseFirebaseService";
import { User } from "../../types/database";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";

export type { User } from "../../types/database";

export interface UserProfile {
  bio?: string;
  location?: string;
  interests: string[];
  socialLinks: Record<string, string>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: Date;
}

export class UserService extends BaseFirebaseService {
  constructor() {
    super("users");
  }

  async getUser(userId: string): Promise<User | null> {
    return this.getById<User>(userId);
  }

  async setUser(userId: string, userData: User): Promise<void> {
    return this.create(userId, userData);
  }

  async getAllUsers(): Promise<User[]> {
    return this.getAll<User>();
  }

  async updateUserRole(
    userId: string,
    newRole: "basic" | "team_leader" | "admin"
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
    } catch (error) {
      this.handleError("updateUserRole", error);
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
      if (userAchievements.includes(achievementId)) {
        return false;
      }

      await this.update(userId, {
        achievements: [...userAchievements, achievementId],
      });

      console.log(`🏆 Achievement awarded: ${achievementId} to user ${userId}`);
      return true;
    } catch (error) {
      this.handleError("awardAchievement", error);
      return false;
    }
  }

  async updateUserActivity(userId: string): Promise<void> {
    try {
      await this.update(userId, {
        lastActiveDate: new Date(),
        lastLoginDate: new Date(),
      });
    } catch (error) {
      this.handleError("updateUserActivity", error);
    }
  }

  async searchUsers(
    searchTerm: string,
    currentUserId: string
  ): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      const normalizedSearch = searchTerm.toLowerCase();

      return allUsers
        .filter(
          (user) =>
            user.userId !== currentUserId &&
            (user.displayName.toLowerCase().includes(normalizedSearch) ||
              user.email.toLowerCase().includes(normalizedSearch))
        )
        .slice(0, 10);
    } catch (error) {
      this.handleError("searchUsers", error);
      return [];
    }
  }

  calculateLevel(xp: number): number {
    const baseXP = 500;
    let level = 1;
    let xpRequired = baseXP;

    while (xp >= xpRequired) {
      level++;
      xpRequired += baseXP * Math.pow(1.3, level - 2);
    }

    return level;
  }

  async getUserFriends(userId: string): Promise<any[]> {
    try {
      const user = await this.getUser(userId);
      return user?.friends || [];
    } catch (error) {
      this.handleError("getUserFriends", error);
      return [];
    }
  }
}

export const userService = new UserService();
