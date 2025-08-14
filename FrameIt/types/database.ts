// TypeScript interfaces for Firestore schema

// Notification Settings Interface
export interface NotificationSettings {
  pushNotifications: boolean;
  newChallenges: boolean;
  friendActivity: boolean;
  achievements: boolean;
  weeklyDigest: boolean;
  locationReminders: boolean;
  challengeReminders: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

// Privacy Settings Interface
export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private";
  showLocation: boolean;
  showActivity: boolean;
  showAchievements: boolean;
  allowFriendRequests: boolean;
  showOnLeaderboard: boolean;
  shareCompletedChallenges: boolean;
  allowTagging: boolean;
  showEmail: "public" | "friends" | "private";
  showDisplayName: boolean;
  dataCollection: {
    analytics: boolean;
    performance: boolean;
    crashReports: boolean;
  };
  marketing: {
    emailMarketing: boolean;
    pushMarketing: boolean;
    thirdPartySharing: boolean;
  };
}

// Friends Collection
export interface Friend {
  friendId: string;
  displayName: string;
  profileImageUrl?: string;
  level: number;
  status: "accepted" | "pending" | "blocked";
  addedAt: Date;
}

// Friend Request Interface
export interface FriendRequest {
  requestId: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  fromUserImage?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

// Users Collection
export interface User {
  userId: string;
  displayName: string;
  email: string;
  password: string;
  teams: string[]; // Array of team IDs the user is a member of
  primaryTeam?: string | null; // Primary team (for display purposes)
  role: "basic" | "team_leader" | "admin";
  signedUpDate: Date;
  tag: string | null;
  xp: number;
  profileImageUrl: string;
  streakCount: number;
  level: number;
  friends?: Friend[];
  friendRequests?: FriendRequest[];
  notificationSettings?: NotificationSettings;
  privacySettings?: PrivacySettings;
}

// Teams Collection
export interface Team {
  teamId: string;
  name: string;
  description?: string;
  createdBy: string; // User ID of the team leader who created the team
  leaderId: string; // Current team leader (can be different from creator if leadership is transferred)
  members: string[]; // Array of user IDs in the team
  createdAt: Date;
  maxMembers?: number; // Optional limit on team size
  isActive: boolean; // Whether team is active or disbanded
  inviteCode?: string; // 6-character invite code for joining
  codeGeneratedAt?: Date; // When the code was generated
  codeExpiresAt?: Date; // When the code expires (24 hours from generation)
}

// Legacy Groups Collection (for backward compatibility)
export interface Group {
  groupId: string;
  name: string;
  description?: string;
  createdBy: string; // User ID of the group leader who created the group
  leaderId: string; // Current group leader (can be different from creator if leadership is transferred)
  members: string[]; // Array of user IDs in the group
  createdAt: Date;
  maxMembers?: number; // Optional limit on group size
  isActive: boolean; // Whether group is active or disbanded
  inviteCode?: string; // 6-character invite code for joining
  codeGeneratedAt?: Date; // When the code was generated
  codeExpiresAt?: Date; // When the code expires (24 hours from generation)
}

// CompletedQuests Subcollection
export interface CompletedQuest {
  questId: string;
  completedAt: Date;
  xpEarned: number;
}

// Tags Collection
export interface Tag {
  id: string;
  name: string;
  description: string;
}

// Achievements Collection
export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: "quest" | "streak" | "vote";
}

// Quests Collection
export interface Quest {
  questId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  addressDetails: {
    street?: string;
    city: string;
    state: string;
    country: string;
  };
  endDate: string;
  startDate: string;
  xpReward: number;
  createdBy: string;
  status: "active" | "completed" | "expired";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  minLevel: number;
  estimatedDuration: number; // minutes

  // Quest Type and Access Control
  questType: "global" | "team";
  visibility: "public" | "team";
  targetTeams?: string[]; // Team IDs that can access this quest (for team quests)
  creatorRole: "admin" | "team_leader";

  photoRequirements: {
    subjects: string[]; // ["street art", "people", "architecture"]
    style?: string; // "portrait", "landscape", "close-up"
    timeOfDay?: "morning" | "afternoon" | "evening" | "golden-hour" | "any";
    minResolution?: { width: number; height: number };
  };
  rewards: {
    baseXP: number;
    bonusXP: {
      speedBonus: number; // extra XP for fast completion
      qualityBonus: number; // extra XP for high-voted photos
      firstTime: number; // bonus for first completion
    };
    badges?: string[]; // achievement IDs
  };
  availableHours?: {
    start: string; // "06:00"
    end: string; // "20:00"
  };
  isRecurring: boolean;
  maxAttempts?: number;
  moderationRequired: boolean;
  statistics: {
    totalParticipants: number;
    successRate: number;
    averageCompletionTime: number;
  };
}

// Quest Analytics Collection
export interface QuestAnalytics {
  questId: string;
  totalAttempts: number;
  totalCompletions: number;
  averageCompletionTime: number; // minutes
  averageRating: number;
  popularityScore: number;
  lastUpdated: string;
}

// Quest Attempts Collection
export interface QuestAttempt {
  attemptId: string;
  questId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  status: "in-progress" | "completed" | "abandoned" | "failed";
  location?: { latitude: number; longitude: number };
  submissionId?: string;
}

// Quest Reviews Collection
export interface QuestReview {
  reviewId: string;
  questId: string;
  userId: string;
  rating: number; // 1-5 stars
  comment: string;
  helpfulVotes: number;
  timestamp: string;
}

// Submissions Collection
export interface Submission {
  subId: string;
  userId: string;
  subUrl: string;
  questId: string;
  timestamp: Date;
  votes: number;
}

// Votes Subcollection
export interface Vote {
  userId: string;
  timestamp: Date;
}
