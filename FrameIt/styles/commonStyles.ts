import { StyleSheet } from "react-native";

// Common colors used throughout the app
export const colors = {
  primary: "#4F46E5",
  secondary: "#6B7280",
  background: "#FFFFFF",
  backgroundLight: "#F8F9FA",
  gold: "#F59E0B",
  green: "#10B981",
  orange: "#F97316",
  text: "#1F2937",
  lightText: "#6B7280",
  error: "#DC2626",
  transparent: "transparent",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
};

// Common style patterns used across multiple screens
export const commonStyles = StyleSheet.create({
  // Container styles
  screenContainer: {
    flex: 1,
    backgroundColor: colors.transparent,
    padding: 24,
  },

  // Card styles
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  smallCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Text styles
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
  },

  bodyText: {
    fontSize: 16,
    color: colors.lightText,
    lineHeight: 22,
  },

  smallText: {
    fontSize: 12,
    color: colors.lightText,
  },

  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
    letterSpacing: 0.3,
  },

  secondaryButton: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },

  // Badge styles
  levelBadge: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  levelBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Progress bar styles
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  // Stat styles
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 8,
  },

  statLabel: {
    fontSize: 12,
    color: colors.lightText,
    textAlign: "center",
    marginTop: 4,
  },

  // Layout helpers
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
});
