import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { BaseFirebaseService } from "../base/BaseFirebaseService";
import { db } from "../../config/firebase";

export interface UserRole {
  userId: string;
  role: "user" | "moderator" | "admin" | "super_admin";
  permissions: string[];
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

export interface SecurityLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

export interface BannedUser {
  userId: string;
  reason: string;
  bannedBy: string;
  bannedAt: Date;
  expiresAt?: Date;
  permanent: boolean;
}

export class SecurityService extends BaseFirebaseService {
  private rolesService: BaseFirebaseService;
  private securityLogsService: BaseFirebaseService;
  private bannedUsersService: BaseFirebaseService;

  constructor() {
    super("security");
    this.rolesService = new BaseFirebaseService("userRoles");
    this.securityLogsService = new BaseFirebaseService("securityLogs");
    this.bannedUsersService = new BaseFirebaseService("bannedUsers");
  }

  async getUserRole(userId: string): Promise<UserRole | null> {
    return this.rolesService.getById<UserRole>(userId);
  }

  async setUserRole(
    userId: string,
    role: UserRole["role"],
    permissions: string[] = [],
    assignedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    const userRole: Partial<UserRole> = {
      userId,
      role,
      permissions,
      assignedBy,
      assignedAt: new Date(),
      expiresAt,
    };
    return this.rolesService.create(userId, userRole);
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole) return false;

      // Check if role has expired
      if (userRole.expiresAt && userRole.expiresAt < new Date()) {
        return false;
      }

      // Admin has all permissions
      if (userRole.role === "admin" || userRole.role === "super_admin") {
        return true;
      }

      return userRole.permissions.includes(permission);
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      return userRole?.role === "admin" || userRole?.role === "super_admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  async isModerator(userId: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      return (
        userRole?.role === "moderator" ||
        userRole?.role === "admin" ||
        userRole?.role === "super_admin"
      );
    } catch (error) {
      console.error("Error checking moderator status:", error);
      return false;
    }
  }

  async logSecurityEvent(
    userId: string,
    action: string,
    details: any = {},
    severity: SecurityLog["severity"] = "low",
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const logId = `${userId}_${action}_${Date.now()}`;
    const securityLog: Partial<SecurityLog> = {
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      severity,
    };
    return this.securityLogsService.create(logId, securityLog);
  }

  async getSecurityLogs(
    userId?: string,
    severity?: SecurityLog["severity"]
  ): Promise<SecurityLog[]> {
    try {
      let q = collection(db, "securityLogs");

      if (userId && severity) {
        q = query(
          q,
          where("userId", "==", userId),
          where("severity", "==", severity)
        ) as any;
      } else if (userId) {
        q = query(q, where("userId", "==", userId)) as any;
      } else if (severity) {
        q = query(q, where("severity", "==", severity)) as any;
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as SecurityLog);
    } catch (error) {
      console.error("Error getting security logs:", error);
      return [];
    }
  }

  async banUser(
    userId: string,
    reason: string,
    bannedBy: string,
    duration?: number,
    permanent: boolean = false
  ): Promise<void> {
    const expiresAt = duration
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      : undefined;

    const bannedUser: Partial<BannedUser> = {
      userId,
      reason,
      bannedBy,
      bannedAt: new Date(),
      expiresAt: permanent ? undefined : expiresAt,
      permanent,
    };

    await this.bannedUsersService.create(userId, bannedUser);

    // Log the ban action
    await this.logSecurityEvent(
      bannedBy,
      "USER_BANNED",
      { targetUserId: userId, reason, duration, permanent },
      "high"
    );
  }

  async unbanUser(userId: string, unbannedBy: string): Promise<void> {
    await this.bannedUsersService.delete(userId);

    await this.logSecurityEvent(
      unbannedBy,
      "USER_UNBANNED",
      { targetUserId: userId },
      "medium"
    );
  }

  async isUserBanned(userId: string): Promise<boolean> {
    try {
      const bannedUser = await this.bannedUsersService.getById<BannedUser>(
        userId
      );
      if (!bannedUser) return false;

      // Check if ban has expired
      if (
        !bannedUser.permanent &&
        bannedUser.expiresAt &&
        bannedUser.expiresAt < new Date()
      ) {
        // Auto-unban expired user
        await this.bannedUsersService.delete(userId);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking ban status:", error);
      return false;
    }
  }

  async getBannedUsers(): Promise<BannedUser[]> {
    try {
      return this.bannedUsersService.getAll<BannedUser>();
    } catch (error) {
      console.error("Error getting banned users:", error);
      return [];
    }
  }

  async getAllUserRoles(): Promise<UserRole[]> {
    try {
      return this.rolesService.getAll<UserRole>();
    } catch (error) {
      console.error("Error getting user roles:", error);
      return [];
    }
  }

  async revokeUserRole(userId: string, revokedBy: string): Promise<void> {
    await this.rolesService.delete(userId);

    // Log the role revocation
    await this.logSecurityEvent(
      revokedBy,
      "ROLE_REVOKED",
      { targetUserId: userId },
      "medium"
    );
  }

  async validateSession(
    userId: string,
    sessionToken: string
  ): Promise<boolean> {
    try {
      // Check if user is banned
      if (await this.isUserBanned(userId)) {
        await this.logSecurityEvent(
          userId,
          "BANNED_USER_ACCESS_ATTEMPT",
          { sessionToken },
          "high"
        );
        return false;
      }

      // Log successful session validation
      await this.logSecurityEvent(
        userId,
        "SESSION_VALIDATED",
        { sessionToken },
        "low"
      );

      return true;
    } catch (error) {
      console.error("Error validating session:", error);
      return false;
    }
  }
}

export const securityService = new SecurityService();
