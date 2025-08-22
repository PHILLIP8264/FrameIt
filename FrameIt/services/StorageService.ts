import { storage, db } from "../config/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import ContentModerationService, {
  ModerationResult,
} from "./ContentModerationService";

// Upload result with moderation info
export interface UploadResult {
  downloadURL: string;
  moderationResult: ModerationResult;
  status: "approved" | "rejected" | "pending_review";
  uploadPath: string;
}

const StorageService = {
  // Upload a file to Firebase Storage with content moderation
  async uploadFile(filePath: string, file: File | Blob): Promise<string> {
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // Upload with moderation (new method)
  async uploadWithModeration(
    filePath: string,
    file: File | Blob,
    userId: string,
    questId?: string
  ): Promise<UploadResult> {
    try {
      // First upload to storage
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Moderate the content
      const moderationResult = await ContentModerationService.moderateImage(
        downloadURL
      );

      // Determine status based on moderation
      let status: "approved" | "rejected" | "pending_review";

      if (ContentModerationService.shouldBlockContent(moderationResult)) {
        status = "rejected";
        // Delete the file from storage
        await deleteObject(storageRef);

        // Log the rejection
        await this.logModerationAction({
          userId,
          filePath,
          downloadURL,
          action: "rejected",
          moderationResult,
          questId,
          timestamp: new Date(),
        });

        throw new Error("Content rejected: Inappropriate content detected");
      } else if (ContentModerationService.needsManualReview(moderationResult)) {
        status = "pending_review";

        // Log for manual review
        await this.logModerationAction({
          userId,
          filePath,
          downloadURL,
          action: "flagged_for_review",
          moderationResult,
          questId,
          timestamp: new Date(),
        });
      } else {
        status = "approved";

        // Log the approval
        await this.logModerationAction({
          userId,
          filePath,
          downloadURL,
          action: "approved",
          moderationResult,
          questId,
          timestamp: new Date(),
        });
      }

      return {
        downloadURL,
        moderationResult,
        status,
        uploadPath: filePath,
      };
    } catch (error) {
      console.error("Upload with moderation failed:", error);

      // delete file if it was uploaded
      try {
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }

      throw error;
    }
  },

  // Log moderation actions for audit trail
  async logModerationAction(logData: {
    userId: string;
    filePath: string;
    downloadURL: string;
    action: "approved" | "rejected" | "flagged_for_review";
    moderationResult: ModerationResult;
    questId?: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      const logId = `${logData.userId}_${Date.now()}`;
      const logRef = doc(db, "moderationLogs", logId);

      await setDoc(logRef, {
        ...logData,
        logId,
      });

      // If flagged for review, add to review queue
      if (logData.action === "flagged_for_review") {
        const reviewRef = doc(db, "moderationQueue", logId);
        await setDoc(reviewRef, {
          ...logData,
          reviewStatus: "pending",
          reviewedBy: null,
          reviewedAt: null,
          finalDecision: null,
        });
      }
    } catch (error) {
      console.error("Failed to log moderation action:", error);
    }
  },

  // Manual review methods (for admin use)
  async approveContent(
    moderationLogId: string,
    reviewerId: string
  ): Promise<void> {
    const reviewRef = doc(db, "moderationQueue", moderationLogId);

    // Get the moderation log to find the associated submission
    const reviewDoc = await getDoc(reviewRef);
    if (!reviewDoc.exists()) {
      throw new Error("Moderation log not found");
    }

    const reviewData = reviewDoc.data();

    // Update the moderation queue
    await updateDoc(reviewRef, {
      reviewStatus: "approved",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      finalDecision: "approved",
    });

    // Find and update the associated submission
    if (reviewData.questId) {
      console.log("Looking for submission with:", {
        questId: reviewData.questId,
        userId: reviewData.userId,
        subUrl: reviewData.downloadURL,
      });

      const submissionsQuery = query(
        collection(db, "submissions"),
        where("questId", "==", reviewData.questId),
        where("userId", "==", reviewData.userId),
        where("subUrl", "==", reviewData.downloadURL)
      );

      const submissionSnapshot = await getDocs(submissionsQuery);
      console.log("Found submissions:", submissionSnapshot.docs.length);

      submissionSnapshot.docs.forEach(async (doc: any) => {
        console.log("Updating submission:", doc.id, "to approved");
        await updateDoc(doc.ref, {
          moderationStatus: "approved",
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        });
      });
    }
  },

  async rejectContent(
    moderationLogId: string,
    reviewerId: string,
    reason: string
  ): Promise<void> {
    const reviewRef = doc(db, "moderationQueue", moderationLogId);

    // Get the moderation log to find the associated submission
    const reviewDoc = await getDoc(reviewRef);
    if (!reviewDoc.exists()) {
      throw new Error("Moderation log not found");
    }

    const reviewData = reviewDoc.data();

    // Update the moderation queue
    await updateDoc(reviewRef, {
      reviewStatus: "rejected",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      finalDecision: "rejected",
      rejectionReason: reason,
    });

    // Find and update the associated submission
    if (reviewData.questId) {
      console.log("Looking for submission to reject with:", {
        questId: reviewData.questId,
        userId: reviewData.userId,
        subUrl: reviewData.downloadURL,
      });

      const submissionsQuery = query(
        collection(db, "submissions"),
        where("questId", "==", reviewData.questId),
        where("userId", "==", reviewData.userId),
        where("subUrl", "==", reviewData.downloadURL)
      );

      const submissionSnapshot = await getDocs(submissionsQuery);
      console.log(
        "Found submissions to reject:",
        submissionSnapshot.docs.length
      );

      submissionSnapshot.docs.forEach(async (doc: any) => {
        console.log("Updating submission:", doc.id, "to rejected");
        await updateDoc(doc.ref, {
          moderationStatus: "rejected",
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: reason,
        });
      });
    }

    // TODO: Notify user and potentially delete content
  },

  // Get a file's download URL
  async getFileURL(filePath: string): Promise<string> {
    const storageRef = ref(storage, filePath);
    return await getDownloadURL(storageRef);
  },

  // Delete a file from Firebase Storage
  async deleteFile(filePath: string): Promise<void> {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  },

  // Batch moderate existing content (admin function)
  async moderateExistingContent(submissionIds: string[]): Promise<void> {
    console.log(
      `Starting batch moderation for ${submissionIds.length} submissions`
    );

    try {
      const moderationResults = [];

      for (const submissionId of submissionIds) {
        try {
          // Get submission data
          const submissionRef = doc(db, "submissions", submissionId);
          const submissionDoc = await getDoc(submissionRef);

          if (!submissionDoc.exists()) {
            console.warn(`Submission ${submissionId} not found, skipping`);
            continue;
          }

          const submissionData = submissionDoc.data();
          const imageUrl = submissionData.subUrl;

          if (!imageUrl) {
            console.warn(
              `No image URL found for submission ${submissionId}, skipping`
            );
            continue;
          }

          // Moderate the content
          const moderationResult = await ContentModerationService.moderateImage(
            imageUrl
          );

          // Determine new status
          let newStatus: "approved" | "rejected" | "pending_review";

          if (ContentModerationService.shouldBlockContent(moderationResult)) {
            newStatus = "rejected";

            // Delete the file from storage for rejected content
            try {
              const path = imageUrl.split("/o/")[1]?.split("?")[0];
              if (path) {
                const decodedPath = decodeURIComponent(path);
                await this.deleteFile(decodedPath);
                console.log(`Deleted rejected file: ${decodedPath}`);
              }
            } catch (deleteError) {
              console.error(
                `Failed to delete file for submission ${submissionId}:`,
                deleteError
              );
            }
          } else if (
            ContentModerationService.needsManualReview(moderationResult)
          ) {
            newStatus = "pending_review";
          } else {
            newStatus = "approved";
          }

          // Update submission with moderation results
          await updateDoc(submissionRef, {
            moderationStatus: newStatus,
            moderationResult: {
              isAppropriate: moderationResult.isAppropriate,
              confidence: moderationResult.confidence,
              categories: moderationResult.categories,
              reason: moderationResult.reason,
            },
            moderatedAt: new Date(),
          });

          // Log the action
          await this.logModerationAction({
            userId: submissionData.userId,
            filePath: imageUrl,
            downloadURL: imageUrl,
            action:
              newStatus === "rejected"
                ? "rejected"
                : newStatus === "pending_review"
                ? "flagged_for_review"
                : "approved",
            moderationResult,
            questId: submissionData.questId,
            timestamp: new Date(),
          });

          moderationResults.push({
            submissionId,
            status: newStatus,
            confidence: moderationResult.confidence,
          });
        } catch (error) {
          console.error(`Error moderating submission ${submissionId}:`, error);
          moderationResults.push({
            submissionId,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      console.log(`Batch moderation completed. Results:`, {
        total: submissionIds.length,
        approved: moderationResults.filter((r) => r.status === "approved")
          .length,
        rejected: moderationResults.filter((r) => r.status === "rejected")
          .length,
        pending: moderationResults.filter((r) => r.status === "pending_review")
          .length,
        errors: moderationResults.filter((r) => r.status === "error").length,
      });
    } catch (error) {
      console.error("Batch moderation failed:", error);
      throw error;
    }
  },
};

export default StorageService;
