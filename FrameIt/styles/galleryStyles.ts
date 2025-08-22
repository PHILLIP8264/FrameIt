import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const galleryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  // Enhanced Stats Container
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,

    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 8,
  },

  // Filter Styles
  filtersContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filtersScrollView: {
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  filterChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOpacity: 0.25,
  },
  filterChipIcon: {
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  filterChipTextActive: {
    color: "#fff",
  },

  // Sort Controls
  sortContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sortOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  sortOptionActive: {
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  sortOptionTextActive: {
    color: "#fff",
  },

  //  Discovery Card
  discoveryCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 6,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
    width: (width - 60) / 2,
  },
  discoveryImageContainer: {
    position: "relative",
    height: 160,
  },
  discoveryImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  discoveryOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#ffc107",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  xpText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: "rgba(0, 122, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  discoveryGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  discoveryContent: {
    padding: 16,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  discoveryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },

  // Photo Grid Layout
  gridContainer: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  gridCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 2,
  },
  viewToggleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewToggleOptionActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Photo Modal
  photoModal: {
    flex: 1,
    backgroundColor: "#000",
  },
  photoModalHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    zIndex: 100,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  photoModalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  photoModalClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoModalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photoModalImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 20,
  },
  photoModalFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  photoModalInfo: {
    marginBottom: 20,
  },
  photoModalQuestTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  photoModalLocation: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 16,
  },
  photoModalStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  photoModalStat: {
    alignItems: "center",
  },
  photoModalStatValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  photoModalStatLabel: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 4,
  },
  photoModalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  photoModalAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  photoModalActionPrimary: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  photoModalActionText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 16,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 2,
    borderColor: "#e3f2fd",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyAction: {
    backgroundColor: "#007AFF",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // Loading States
  skeletonCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 6,
    marginBottom: 16,
    overflow: "hidden",
    width: (width - 60) / 2,
  },
  skeletonImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f0f0f0",
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonText: {
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonTextLong: {
    width: "80%",
  },
  skeletonTextShort: {
    width: "60%",
  },

  // Gesture Hints
  gestureHints: {
    position: "absolute",
    bottom: 120,
    left: 24,
    right: 24,
    backgroundColor: "rgba(0, 122, 255, 0.95)",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  gestureHintsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  gestureHintsText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.9,
  },

  // Action Indicators for Swipe
  actionIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    zIndex: 10,
  },
  actionIndicatorLeft: {
    right: 20,
  },
  actionIndicatorRight: {
    left: 20,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionIconDelete: {
    backgroundColor: "#ff4757",
  },
  actionIconShare: {
    backgroundColor: "#007AFF",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionTextDelete: {
    color: "#ff4757",
  },
  actionTextShare: {
    color: "#007AFF",
  },

  // Pull to Refresh
  refreshControl: {
    backgroundColor: "transparent",
  },

  // Floating Action Button
  floatingActionButton: {
    position: "absolute",
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
