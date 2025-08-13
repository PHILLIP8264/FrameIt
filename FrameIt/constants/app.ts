// App-wide constants
export const APP_CONFIG = {
  NAME: "FrameIt",
  VERSION: "1.0.0",
  SUPPORT_EMAIL: "support@frameit.com",
} as const;

export const NAVIGATION = {
  SCREENS: {
    LOGIN: "/login",
    SIGNUP: "/signup",
    HOME: "/(tabs)/",
    PROFILE: "/profile",
    SETTINGS: "/settings",
    ADMIN: "/admin",
    SPLASH: "/splash",
  },
  TABS: {
    HOME: "/(tabs)/",
    CHALLENGES: "/(tabs)/challenges",
    GALLERY: "/(tabs)/gallery",
    LEADERBOARD: "/(tabs)/leaderboard",
  },
} as const;

export const STORAGE_KEYS = {
  USER_PREFERENCES: "@frameit_user_preferences",
  AUTH_TOKEN: "@frameit_auth_token",
  OFFLINE_DATA: "@frameit_offline_data",
} as const;

export const API_ENDPOINTS = {
  // Add API endpoints here if you have any
} as const;
