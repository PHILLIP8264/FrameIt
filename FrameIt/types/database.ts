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

// Users Collection
export interface User {
  userId: string;
  displayName: string;
  email: string;
  password: string;
  group: string | null;
  role: "basic" | "admin" | "management";
  signedUpDate: Date;
  tag: string | null;
  xp: number;
  profileImageUrl: string;
  streakCount: number;
  level: number;
  notificationSettings?: NotificationSettings;
  privacySettings?: PrivacySettings;
}

// Groups Collection
export interface Group {
  groupId: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
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
