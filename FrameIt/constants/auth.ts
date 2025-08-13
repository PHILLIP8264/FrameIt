// Authentication constants
export const AUTH_ERRORS = {
  INVALID_EMAIL: "Please enter a valid email address",
  EMAIL_REQUIRED: "Email is required",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  DISPLAY_NAME_REQUIRED: "Display name is required",
  WEAK_PASSWORD: "Password is too weak",
  EMAIL_IN_USE: "Email is already in use",
  USER_NOT_FOUND: "No user found with this email",
  WRONG_PASSWORD: "Incorrect password",
  TOO_MANY_REQUESTS: "Too many failed attempts. Please try again later",
  NETWORK_ERROR: "Network error. Please check your connection",
  UNKNOWN_ERROR: "An unexpected error occurred",
} as const;

export const AUTH_SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: "Account created successfully!",
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "Signed out successfully",
  PASSWORD_RESET_SENT: "Password reset email sent",
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  DISPLAY_NAME_MIN_LENGTH: 2,
  DISPLAY_NAME_MAX_LENGTH: 30,
} as const;

export const SWIPE_CONFIG = {
  THRESHOLD: 50,
  MAX_TRANSLATION: 70,
  ANIMATION_DURATION: 200,
  SPRING_CONFIG: {
    tension: 150,
    friction: 12,
  },
} as const;
