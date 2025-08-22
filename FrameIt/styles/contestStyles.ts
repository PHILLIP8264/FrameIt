import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export const contestStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },

  // Header Section
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },

  // Timer Component
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  timerContainerActive: {
    backgroundColor: "#e8f5e8",
    borderColor: "#4CAF50",
  },
  timerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  timerTextActive: {
    color: "#4CAF50",
  },
  timerIcon: {
    marginLeft: 8,
  },

  // Tab Selector
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#f0f2f5",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  activeTabButton: {
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  activeTabButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  disabledTabText: {
    color: "#ccc",
  },

  // Submissions Container
  submissionsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  submissionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Submission Card
  submissionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f2f5",
  },
  submissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  submissionUserInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  submissionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  submissionAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  submissionUserDetails: {
    flex: 1,
  },
  submissionUserName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  submissionQuestTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  submissionRank: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#007AFF20",
  },
  submissionRankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#007AFF",
    marginLeft: 4,
  },

  // Submission Image
  submissionImage: {
    width: "100%",
    height: 280,
    backgroundColor: "#f5f5f5",
  },

  // Submission Stats
  submissionStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Vote Button
  voteButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  voteButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  voteButtonDisabled: {
    backgroundColor: "#e1e5e9",
    shadowOpacity: 0,
    elevation: 0,
  },
  voteButtonVoted: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },

  // Voting Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 0,
    maxHeight: "90%",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },

  // Quality Rating
  qualityRatingSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
    lineHeight: 22,
  },
  starRating: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  star: {
    marginHorizontal: 8,
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    color: "#007AFF",
    textAlign: "center",
    fontWeight: "600",
  },

  // Requirements Section
  requirementsSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    marginRight: 16,
    lineHeight: 20,
    fontWeight: "500",
  },
  requirementButtons: {
    flexDirection: "row",
  },
  requirementButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: "#e9ecef",
    backgroundColor: "#fff",
    minWidth: 70,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requirementButtonYes: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.2,
  },
  requirementButtonNo: {
    backgroundColor: "#f44336",
    borderColor: "#f44336",
    shadowColor: "#f44336",
    shadowOpacity: 0.2,
  },
  requirementButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  requirementButtonTextActive: {
    color: "#fff",
  },

  // Submit Button
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 24,
    marginVertical: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#e1e5e9",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  // Vote Summary
  voteSummary: {
    backgroundColor: "#f0f8ff",
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e3f2fd",
  },
  voteSummaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 12,
  },
  voteSummaryText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // Voting Modal Image
  votingImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  votingImage: {
    width: "100%",
    height: 240,
    backgroundColor: "#f5f5f5",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  submissionInfo: {
    flexDirection: "column",
  },
  votingSubmissionUserName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  votingSubmissionQuestTitle: {
    fontSize: 14,
    color: "#e9ecef",
    fontWeight: "500",
  },
});
