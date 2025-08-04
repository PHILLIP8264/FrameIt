import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const galleryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  filterList: {
    marginBottom: 20,
  },
  filterContainer: {
    paddingHorizontal: 5,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  activeFilterButton: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 5,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
  },

  gridContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  discoveryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: (width - 50) / 2,
  },
  discoveryImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  discoveryOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  xpText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 2,
  },
  discoveryInfo: {
    padding: 12,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 10,
    color: "#666",
    marginLeft: 2,
    flex: 1,
  },
  dateText: {
    fontSize: 10,
    color: "#999",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#999",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#CCC",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
