// Default notification settings
export const defaultNotificationSettings = {
  pushNotifications: true,
  newChallenges: true,
  friendActivity: true,
  achievements: true,
  weeklyDigest: false,
  locationReminders: true,
  challengeReminders: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
  },
};

// Notification type configurations
export const notificationTypeConfig = {
  quest_completion: {
    icon: "trophy",
    color: "#34C759",
  },
  contest_result: {
    icon: "medal",
    color: "#FF9500",
  },
  team_invite: {
    icon: "people",
    color: "#137CD8",
  },
  friend_request: {
    icon: "person-add",
    color: "#AF52DE",
  },
  moderation_result: {
    icon: "image",
    color: "#FF3B30",
  },
  default: {
    icon: "notifications",
    color: "#8E8E93",
  },
};
