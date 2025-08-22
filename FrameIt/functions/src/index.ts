import * as admin from "firebase-admin";

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export all functions
export { moderateImageWithVision } from "./visionModerationBasic";
