import { StyleSheet } from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "./commonStyles";

export const unifiedTeamStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },

  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: "center",
  },

  content: {
    flex: 1,
    padding: spacing.xl,
  },

  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },

  emptyStateText: {
    ...typography.h5,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  emptyStateSubtext: {
    ...typography.body1,
    color: colors.textLight,
    textAlign: "center",
  },

  // Team header
  teamHeader: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },

  teamHeaderContent: {
    alignItems: "center",
  },

  teamName: {
    ...typography.h3,
    color: colors.surface,
    marginBottom: spacing.sm,
    textAlign: "center",
  },

  teamDescription: {
    ...typography.body1,
    color: colors.surface,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: spacing.lg,
  },

  teamStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  statItem: {
    alignItems: "center",
  },

  statValue: {
    ...typography.h4,
    color: colors.surface,
    marginBottom: spacing.xs,
  },

  statLabel: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.8,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.lg,
  },

  teamSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  viewAllText: {
    ...typography.button,
    color: colors.primary,
  },

  // Quick actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  quickAction: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.medium,
  },

  quickActionText: {
    ...typography.button,
    color: colors.surface,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  // Challenge cards
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  challengeTitle: {
    ...typography.h6,
    color: colors.text,
    flex: 1,
  },

  challengeStatus: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },

  challengeStatusText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: "600",
  },

  challengeDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },

  challengeProgress: {
    marginTop: spacing.lg,
  },

  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },

  progressText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: "center",
  },

  // Activity items
  activityItem: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.lg,
  },

  activityContent: {
    flex: 1,
  },

  activityDescription: {
    ...typography.body2,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  activityTime: {
    ...typography.caption,
    color: colors.textLight,
  },

  // Base components
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  cardTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.lg,
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.medium,
  },

  buttonText: {
    ...typography.button,
    color: colors.surface,
  },

  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },

  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },

  text: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.md,
  },

  subtitle: {
    ...typography.subtitle1,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },

  // Info cards and items
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  infoLabel: {
    ...typography.subtitle2,
    color: colors.textSecondary,
  },

  infoValue: {
    ...typography.body2,
    color: colors.text,
    fontWeight: "600",
  },

  // Member styles
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  memberEmail: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  leaderBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: "flex-start",
  },

  leaderBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: "600",
  },

  // Quest styles
  questCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  questTitle: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  questDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  questLocation: {
    ...typography.body2,
    color: colors.primary,
    fontStyle: "italic",
  },

  // Create button styles
  createButton: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.medium,
  },

  createButtonText: {
    ...typography.button,
    color: colors.surface,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
  },

  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },

  // Header styles
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  backButton: {
    padding: spacing.sm,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerSubtitle: {
    ...typography.subtitle1,
    color: colors.textSecondary,
  },

  refreshButton: {
    padding: spacing.sm,
  },

  // Team selector styles
  teamSelector: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  teamSelectorItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundLight,
  },

  selectedTeam: {
    backgroundColor: colors.primary,
  },

  teamSelectorText: {
    ...typography.body2,
    color: colors.text,
  },

  selectedTeamText: {
    color: colors.surface,
  },

  // Tab styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  tabText: {
    ...typography.body2,
    fontWeight: "500",
  },
});
