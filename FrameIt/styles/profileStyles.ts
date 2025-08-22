import { StyleSheet } from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "./commonStyles";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: spacing.xl,
  },

  loadingText: {
    ...typography.h6,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    textAlign: "center",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: spacing.xl,
  },

  errorText: {
    ...typography.body1,
    color: colors.error,
    textAlign: "center",
  },

  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    backgroundColor: "white",
    borderBottomWidth: 0,
    elevation: 8,
  },

  headerTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: "center",
    flex: 1,
    fontWeight: "700",
  },

  backButton: {
    padding: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundLight,
    ...shadows.small,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  settingsButton: {
    padding: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    ...shadows.medium,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContainer: {
    paddingHorizontal: 0,
    paddingBottom: spacing.massive,
    paddingTop: spacing.sm,
  },

  // Profile section
  profileSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    alignItems: "center",
    ...shadows.large,
    borderWidth: 0,
    elevation: 12,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: spacing.xl,
  },

  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadows.medium,
  },

  avatarText: {
    ...typography.h1,
    color: colors.surface,
    fontWeight: "700",
  },

  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: colors.primary,
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
    borderWidth: 3,
    borderColor: colors.surface,
  },

  userName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
    fontWeight: "700",
  },

  userTitle: {
    ...typography.h6,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: "center",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  userEmail: {
    ...typography.subtitle1,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },

  joinDate: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: "center",
  },

  // XP Section
  xpSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.large,
    borderWidth: 0,
    elevation: 8,
  },

  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  xpText: {
    ...typography.h4,
    color: colors.text,
    fontWeight: "600",
  },

  // Stats section
  statsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.large,
    borderWidth: 0,
    elevation: 8,
  },

  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: "600",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    width: "48%",
    marginBottom: spacing.lg,
    ...shadows.medium,
    elevation: 6,
    borderWidth: 0,
  },

  statNumber: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: "700",
  },

  statLabel: {
    ...typography.subtitle2,
    color: colors.textLight,
    textAlign: "center",
    fontWeight: "500",
  },

  // Achievements section
  achievementsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.large,
    borderWidth: 0,
    elevation: 8,
  },

  achievementCount: {
    ...typography.subtitle1,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  achievementCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    width: "48%",
    marginBottom: spacing.lg,
    ...shadows.medium,
    elevation: 6,
    borderWidth: 0,
  },

  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadows.small,
  },

  achievementTitle: {
    ...typography.subtitle2,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
    fontWeight: "600",
  },

  earnedBadge: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
    ...shadows.small,
  },

  earnedText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: "600",
  },

  lockedAchievement: {
    opacity: 0.5,
  },

  lockedIcon: {
    backgroundColor: colors.textLight,
  },

  lockedText: {
    color: colors.textLight,
  },

  tapHint: {
    ...typography.body2,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.lg,
    fontStyle: "italic",
  },

  cardHint: {
    ...typography.body2,
    color: colors.textLight,
    fontStyle: "italic",
  },

  // Logout section
  logoutCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.large,
    borderWidth: 0,
    elevation: 8,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  cardLabel: {
    ...typography.h6,
    color: colors.text,
    marginLeft: spacing.md,
    fontWeight: "600",
  },

  bottomSpacing: {
    height: spacing.massive * 2,
  },

  // Profile card
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: "center",
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  profileImageText: {
    ...typography.h2,
    color: colors.surface,
  },

  profileName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  profileEmail: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },

  // User info cards
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  infoCardTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.lg,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.xl,
  },

  statItem: {
    alignItems: "center",
    flex: 1,
  },

  statValue: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  // Level and progress
  levelContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  levelText: {
    ...typography.h5,
    color: colors.text,
  },

  levelBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.medium,
    elevation: 6,
    minWidth: 60,
  },

  levelBadgeText: {
    ...typography.h6,
    color: colors.surface,
    fontWeight: "700",
  },

  progressContainer: {
    marginBottom: spacing.lg,
  },

  progressLabel: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },

  progressBar: {
    height: 12,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    marginBottom: spacing.sm,
    ...shadows.small,
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },

  progressText: {
    ...typography.body2,
    color: colors.textLight,
    textAlign: "center",
    fontWeight: "500",
  },

  // Action buttons
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    ...shadows.medium,
  },

  actionButtonText: {
    ...typography.button,
    color: colors.surface,
    marginLeft: spacing.sm,
  },

  secondaryActionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },

  secondaryActionButtonText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.sm,
  },

  // Edit profile modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },

  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "100%",
    maxHeight: "80%",
    ...shadows.xl,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    ...typography.h5,
    color: colors.text,
  },

  modalCloseButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
  },

  // Form inputs
  inputContainer: {
    marginBottom: spacing.lg,
  },

  inputLabel: {
    ...typography.subtitle2,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...typography.body1,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },

  textInputFocused: {
    borderColor: colors.primary,
    ...shadows.small,
  },

  // Empty states
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },

  emptyText: {
    ...typography.body1,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});

export default profileStyles;
