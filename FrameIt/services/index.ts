export { BaseFirebaseService } from "./base/BaseFirebaseService";

export {
  UserService,
  userService,
  type User,
  type UserProfile,
  type Achievement,
} from "./user/UserService";
export { TeamService, teamService, type Team } from "./team/TeamService";
export {
  QuestService,
  questService,
  type Quest,
  type QuestCompletion,
} from "./quest/QuestService";
export {
  AnalyticsService,
  analyticsService,
  type AnalyticsEvent,
  type UserStats,
  type TeamStats,
} from "./analytics/AnalyticsService";
export {
  SecurityService,
  securityService,
  type UserRole,
  type SecurityLog,
  type BannedUser,
} from "./security/SecurityService";

export {
  ModernFirestoreService,
  modernFirestoreService,
} from "./ModernFirestoreService";

export { modernFirestoreService as FirestoreService } from "./ModernFirestoreService";
