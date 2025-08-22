// Default privacy settings
export const defaultPrivacySettings = {
  profileVisibility: "friends" as const,
  showLocation: false,
  showActivity: true,
  showAchievements: true,
  allowFriendRequests: true,
  showOnLeaderboard: true,
  shareCompletedChallenges: true,
  allowTagging: true,
  showEmail: "private" as const,
  showDisplayName: true,
  dataCollection: {
    analytics: true,
    performance: true,
    crashReports: true,
  },
  marketing: {
    emailMarketing: false,
    pushMarketing: false,
    thirdPartySharing: false,
  },
};

// Privacy option configurations
export const profileVisibilityOptions = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can see your profile",
  },
  {
    value: "friends",
    label: "Friends Only",
    description: "Only friends can see your profile",
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can see your profile",
  },
];

export const emailVisibilityOptions = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can see your email",
  },
  {
    value: "friends",
    label: "Friends Only",
    description: "Only friends can see your email",
  },
  {
    value: "private",
    label: "Private",
    description: "Email is hidden from everyone",
  },
];
