import { StyleSheet } from "react-native";

// Comprehensive Design System Colors
export const colors = {
  // Primary Brand Colors
  primary: "#137CD8",
  primaryLight: "#3B92E8",
  primaryDark: "#0F5BA8",
  secondary: "#D61A66",
  secondaryLight: "#E8327B",
  secondaryDark: "#B11452",

  // Neutral Colors
  background: "#FFFFFF",
  backgroundLight: "#F8F9FA",
  backgroundDark: "#F1F3F4",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",

  // Text Colors
  text: "#1F2937",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  textDisabled: "#D1D5DB",

  // Semantic Colors
  success: "#10B981",
  successLight: "#34D399",
  warning: "#F59E0B",
  warningLight: "#FBBF24",
  error: "#EF4444",
  errorLight: "#F87171",
  info: "#3B82F6",
  infoLight: "#60A5FA",

  // Special Colors
  gold: "#F59E0B",
  xp: "#F59E0B",
  level: "#8B5CF6",

  // Border Colors
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  borderDark: "#D1D5DB",

  // Overlay Colors
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
  transparent: "transparent",
};

export const typography = {
  // Headings
  h1: { fontSize: 32, fontWeight: "bold" as const, lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: "bold" as const, lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: "bold" as const, lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: "600" as const, lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  h6: { fontSize: 16, fontWeight: "600" as const, lineHeight: 22 },

  // Body Text
  body1: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },

  // UI Text
  subtitle1: { fontSize: 16, fontWeight: "500" as const, lineHeight: 22 },
  subtitle2: { fontSize: 14, fontWeight: "500" as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
  overline: {
    fontSize: 10,
    fontWeight: "600" as const,
    lineHeight: 16,
    textTransform: "uppercase" as const,
  },

  // Button Text
  button: { fontSize: 16, fontWeight: "600" as const, lineHeight: 20 },
  buttonSmall: { fontSize: 14, fontWeight: "600" as const, lineHeight: 18 },
};

// Design System Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

// Design System Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 24,
  circle: 50,
};

// Design System Shadows
export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Standardized Common Styles
export const commonStyles = StyleSheet.create({
  // Container Styles
  screenContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },

  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },

  // Card Styles (Standardized)
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  cardSmall: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  cardLarge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    ...shadows.large,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Header Styles (Standardized)
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: "center",
  },

  headerSubtitle: {
    ...typography.subtitle2,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
  },

  // Typography Styles (Standardized)
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.md,
  },

  bodyText: {
    ...typography.body1,
    color: colors.textSecondary,
  },

  caption: {
    ...typography.caption,
    color: colors.textLight,
  },

  // Button Styles (Standardized)
  primaryButton: {
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

  primaryButtonText: {
    ...typography.button,
    color: colors.surface,
    marginLeft: spacing.sm,
  },

  secondaryButton: {
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

  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.sm,
  },

  smallButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  smallButtonText: {
    ...typography.buttonSmall,
    color: colors.surface,
    marginLeft: spacing.xs,
  },

  // Badge Styles
  levelBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.small,
  },

  levelBadgeText: {
    ...typography.buttonSmall,
    color: colors.surface,
  },

  statusBadge: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },

  statusBadgeText: {
    ...typography.caption,
    fontWeight: "600",
  },

  // Form Input Styles
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

  textInputError: {
    borderColor: colors.error,
  },

  // Progress Bar Styles
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

  // Avatar Styles
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    ...typography.buttonSmall,
    color: colors.surface,
  },

  // Stat Styles
  statContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },

  statValue: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  statLabel: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: "center",
  },

  // Layout Helpers
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  flex1: {
    flex: 1,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundLight,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },

  emptyStateText: {
    ...typography.body1,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.lg,
  },

  // Section Styles
  section: {
    marginBottom: spacing.xxl,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    ...typography.h5,
    color: colors.text,
  },

  sectionSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Modal Styles
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
});
