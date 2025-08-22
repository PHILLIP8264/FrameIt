import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const challengesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 0,
    paddingBottom: 0,
  },
  backgroundImage: {
    opacity: 1,
    resizeMode: "cover",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  locationBannerText: {
    fontSize: 15,
    color: "#FFFFFF",
    marginLeft: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  listContainer: {
    paddingBottom: 24,
  },

  questCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
    overflow: "hidden",
  },

  questImageHeader: {
    height: 140,
    position: "relative",
    overflow: "hidden",
  },

  questHeaderGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  questHeaderContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: "space-between",
  },

  questHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  questCategoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: "blur(10px)",
  },

  questCategoryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  questStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  questCompletedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.9)",
  },

  questLockedBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
  },

  questAvailableBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
  },

  questStatusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  questHeaderBottom: {
    alignItems: "flex-start",
  },

  questTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  questLocationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  questLocationText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  questBody: {
    padding: 20,
  },

  questDescription: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: "400",
  },

  questInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  questInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },

  questInfoText: {
    fontSize: 12,
    color: "#475569",
    marginLeft: 6,
    fontWeight: "500",
  },

  questStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  questStat: {
    alignItems: "center",
  },

  questStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },

  questStatLabel: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },

  questFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },

  questRewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },

  questXpText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#d97706",
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  questBonusText: {
    fontSize: 11,
    color: "#ea580c",
    marginLeft: 8,
    fontWeight: "600",
    backgroundColor: "#fed7aa",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  questActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  questStartButton: {
    backgroundColor: "#2563eb",
  },

  questCompletedButton: {
    backgroundColor: "#059669",
  },

  questLockedButton: {
    backgroundColor: "#64748b",
  },

  questButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  questDeleteButton: {
    padding: 12,
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
  },

  questEligibilityWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },

  questEligibilityText: {
    fontSize: 12,
    color: "#92400e",
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
  },

  mapToggleButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },

  // Difficulty colors helpers
  difficultyBeginner: {
    backgroundColor: "#059669",
  },
  difficultyIntermediate: {
    backgroundColor: "#d97706",
  },
  difficultyAdvanced: {
    backgroundColor: "#dc2626",
  },
  difficultyExpert: {
    backgroundColor: "#7c2d12",
  },

  // Advanced Filtering Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f9ff",
  },
  quickFilters: {
    marginBottom: 12,
  },
  quickFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  activeFilterButton: {
    backgroundColor: "#007AFF",
  },
  quickFilterText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
  },
  advancedFilters: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  toggleActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  toggleText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#fff",
  },
  distanceButtons: {
    flexDirection: "row",
    gap: 8,
  },
  distanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  activeDistanceButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  distanceButtonText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  activeDistanceButtonText: {
    color: "#fff",
  },
  xpRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  xpInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minWidth: 80,
    textAlign: "center",
  },
  xpSeparator: {
    fontSize: 14,
    color: "#D61A66",
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f87171",
    alignItems: "center",
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
});
