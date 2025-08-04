import { StyleSheet } from "react-native";

// Common colors used throughout the app
export const colors = {
  primary: "#007AFF",
  secondary: "#666",
  background: "rgba(255, 255, 255, 0.95)",
  gold: "#FFD700",
  green: "#4CAF50",
  orange: "#FF5722",
  text: "#333",
  lightText: "#666",
  error: "#FF3B30",
  transparent: "transparent",
};

// Common style patterns used across multiple screens
export const commonStyles = StyleSheet.create({
  // Container styles
  screenContainer: {
    flex: 1,
    backgroundColor: colors.transparent,
    padding: 20,
  },

  // Card styles
  card: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  smallCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

  secondaryButton: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
