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
  totalXP?: number; // Total XP earned (for tag requirements)
  profileImageUrl: string;
  streakCount: number;
  level: number;
  friends?: Friend[];
  friendRequests?: FriendRequest[];
  notificationSettings?: NotificationSettings;
  privacySettings?: PrivacySettings;

  // Activity tracking fields
  lastActiveDate?: Date;
  lastLoginDate?: Date;
  sessionCount?: number;
  totalSessionTime?: number; // in minutes
  averageSessionTime?: number; // in minutes
  location?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Achievement-based tag system
  achievements?: string[]; // Array of earned achievement IDs
  unlockedTags?: string[]; // Array of unlocked tag IDs
  tagUnlockHistory?: {
    tagId: string;
    unlockedAt: string;
    triggerAchievement?: string;
  }[];
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
  icon: string;
  color: string;
  requirements: {
    achievements?: string[]; // Achievement IDs required
    questsCompleted?: number; // Minimum quests completed
    totalXP?: number; // Minimum XP required
    votes?: number; // Minimum votes received
    streakDays?: number; // Minimum streak days
    customConditions?: string[]; // For special admin-defined conditions
  };
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedMessage: string; // Message shown when tag is unlocked
  createdBy: string; // User ID of admin who created it
  createdAt: string;
  isActive: boolean; // Admins can enable/disable tags
  isDefault: boolean; // System default tags vs admin-created
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
  moderationStatus?: "approved" | "rejected" | "pending_review";
  moderationResult?: {
    isAppropriate: boolean;
    confidence: number;
    categories: {
      adult:
        | "VERY_UNLIKELY"
        | "UNLIKELY"
        | "POSSIBLE"
        | "LIKELY"
        | "VERY_LIKELY";
      violence:
        | "VERY_UNLIKELY"
        | "UNLIKELY"
        | "POSSIBLE"
        | "LIKELY"
        | "VERY_LIKELY";
      racy:
        | "VERY_UNLIKELY"
        | "UNLIKELY"
        | "POSSIBLE"
        | "LIKELY"
        | "VERY_LIKELY";
    };
    reason?: string;
  };
}

// Votes Subcollection
export interface Vote {
  userId: string;
  timestamp: Date;
}

// Daily Contest Collection
export interface DailyContest {
  contestId: string; // Format: YYYY-MM-DD
  date: string; // YYYY-MM-DD
  status: "upcoming" | "voting" | "completed";
  votingStartTime: string; // "18:00"
  votingEndTime: string; // "00:00"
  globalSubmissions: string[]; // submission IDs
  teamContests?: {
    [teamId: string]: {
      submissions: string[];
      votingPeriod?: {
        start: string;
        end: string;
      };
    };
  };
  winners?: {
    global?: {
      [category: string]: {
        winnerId: string;
        submissionId: string;
        finalScore: number;
      };
    };
    teams?: {
      [teamId: string]: {
        [category: string]: {
          winnerId: string;
          submissionId: string;
          finalScore: number;
        };
      };
    };
  };
}

// Submission Votes Collection
export interface SubmissionVote {
  voteId: string;
  submissionId: string;
  voterId: string;
  contestId: string; // YYYY-MM-DD
  votingContext: "global" | "team";
  teamId?: string; // if voting context is team

  // Photo quality rating (1-5 stars)
  photoQualityRating: number;

  // Requirement votes (yes/no for each requirement)
  requirementVotes: {
    [requirementKey: string]: boolean; // e.g., "hasStreetArt": true
  };

  // Calculated scores
  requirementScore: number; // number of requirements met
  totalRequirements: number; // total number of requirements
  finalScore: number; // weighted combination of quality + requirements

  timestamp: Date;

  // Prevent changes
  isLocked: boolean;
}

// Enhanced Submission interface for voting
export interface VotingSubmission extends Submission {
  // User information
  userName?: string;
  userProfilePhoto?: string;
  userDisplayName?: string;

  // Additional voting-specific data
  questTitle: string;
  questCategory: string;
  questRequirements: {
    [key: string]: {
      description: string;
      type: "subject" | "style" | "time" | "technical";
    };
  };

  // Voting results
  totalVotes: number;
  averageQualityRating: number;
  requirementScores: {
    [requirementKey: string]: {
      yesVotes: number;
      totalVotes: number;
      percentage: number;
    };
  };
  overallScore: number;

  // Contest info
  contestId: string;
  isEligibleForVoting: boolean;
}

// Engagement tracking interfaces
export interface Engagement {
  engagementId: string;
  type: "like" | "comment" | "share" | "report";
  targetType: "quest" | "submission" | "user" | "team";
  targetId: string;
  userId: string;
  timestamp: Date;
  content?: string; // for comments
  reportReason?: string; // for reports
}

// App Analytics interface
export interface AppAnalytics {
  date: string; // YYYY-MM-DD
  dailyActiveUsers: number;
  newUserSignups: number;
  questsCompleted: number;
  submissionsCreated: number;
  engagementActions: {
    likes: number;
    comments: number;
    shares: number;
    reports: number;
  };
  sessionMetrics: {
    averageSessionTime: number;
    totalSessions: number;
  };
  retentionMetrics: {
    day1: number;
    day7: number;
    day30: number;
  };
}

// Communication interfaces
export interface Communication {
  id: string;
  type: "announcement" | "notification" | "email" | "alert";
  title: string;
  content: string;
  targetAudience: "all" | "active" | "teams" | "specific";
  targetUserIds?: string[]; // for specific targeting
  scheduledDate?: Date;
  sentAt?: Date;
  createdBy: string; // admin user ID
  status: "draft" | "scheduled" | "sent" | "failed";
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  metadata?: {
    templateId?: string;
    campaignId?: string;
    tags?: string[];
  };
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: "announcement" | "notification" | "email" | "alert";
  title: string;
  content: string;
  description?: string;
  category:
    | "achievement"
    | "quest"
    | "team"
    | "event"
    | "general"
    | "maintenance";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

// Team Challenge Interface
export interface TeamChallenge {
  challengeId: string;
  teamId: string;
  title: string;
  description: string;
  type: "xp" | "quests" | "locations" | "time";
  targetValue: number;
  currentValue: number;
  progress: number; // Calculated percentage (0-100)
  participants: string[]; // User IDs participating
  startDate: Date;
  deadline: Date;
  isActive: boolean;
  status: "active" | "completed" | "failed" | "paused";
  reward?: string;
  createdBy: string; // Team leader user ID
  createdAt: Date;
  completedAt?: Date;
  metadata: {
    difficulty: "easy" | "medium" | "hard";
    category:
      | "team_building"
      | "skill_development"
      | "exploration"
      | "competition";
    tags: string[];
  };
  statistics: {
    totalParticipants: number;
    activeParticipants: number;
    completionRate: number;
    averageContribution: number;
    completedBy: string[]; // User IDs who completed the challenge
    topContributors: { userId: string; contribution: number }[];
  };
}

// Team Challenge Participation Interface
export interface TeamChallengeParticipation {
  participationId: string;
  challengeId: string;
  userId: string;
  teamId: string;
  contribution: number; // User's contribution to the challenge
  joinedAt: Date;
  lastUpdated: Date;
  isActive: boolean;
  personalGoal?: number; // Optional personal goal within team challenge
  personalProgress?: number;
}

// Team Activity Interface for recent activities tracking
export interface TeamActivity {
  activityId: string;
  teamId: string;
  type:
    | "member_joined"
    | "member_left"
    | "challenge_created"
    | "challenge_completed"
    | "challenge_deleted"
    | "quest_created"
    | "quest_completed"
    | "quest_deleted"
    | "team_created"
    | "progress_update";
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  metadata?: {
    challengeId?: string;
    challengeName?: string;
    questId?: string;
    questName?: string;
    xpAmount?: number;
    progressValue?: number;
  };
}
