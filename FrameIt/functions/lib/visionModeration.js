"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateImageWithVision = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const vision_1 = require("@google-cloud/vision");
// Initialize Vision AI client
const vision = new vision_1.ImageAnnotatorClient();
/**
 * Cloud Function to moderate images using Google Vision AI SafeSearch
 */
exports.moderateImageWithVision = functions.https.onCall(async (request, response) => {
    // Verify user is authenticated
    if (!request.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to moderate images.");
    }
    const { imageUrl } = request.data;
    if (!imageUrl || typeof imageUrl !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Missing or invalid imageUrl parameter.");
    }
    try {
        console.log("🔍 Starting Vision AI moderation for:", imageUrl.substring(0, 50) + "...");
        // Perform SafeSearch detection
        const [result] = await vision.safeSearchDetection(imageUrl);
        const detections = result.safeSearchAnnotation;
        if (!detections) {
            throw new Error("No SafeSearch detections returned from Vision AI");
        }
        console.log("📊 Vision AI detections:", detections);
        // Analyze the results
        const moderationResult = analyzeVisionResult(detections);
        console.log("✅ Vision AI moderation completed:", moderationResult);
        // Log the moderation action
        await logModerationToFirestore(request.auth.uid, imageUrl, moderationResult);
        return moderationResult;
    }
    catch (error) {
        console.error("❌ Vision AI moderation error:", error);
        // Return a conservative result if Vision AI fails
        const fallbackResult = {
            isAppropriate: false,
            confidence: 0.3,
            categories: {
                adult: "POSSIBLE",
                violence: "POSSIBLE",
                racy: "POSSIBLE",
                spoof: "UNLIKELY",
                medical: "UNLIKELY",
            },
            reason: `Vision AI service error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
        return fallbackResult;
    }
});
/**
 * Analyze Vision AI SafeSearch results
 */
function analyzeVisionResult(detections) {
    const { adult, spoof, medical, violence, racy } = detections;
    // Map Google's likelihood levels to our categories
    const categories = {
        adult: adult || "VERY_UNLIKELY",
        violence: violence || "VERY_UNLIKELY",
        racy: racy || "VERY_UNLIKELY",
        spoof: spoof || "VERY_UNLIKELY",
        medical: medical || "VERY_UNLIKELY",
    };
    // Determine if content is appropriate
    const highRiskLevels = ["LIKELY", "VERY_LIKELY"];
    const mediumRiskLevels = ["POSSIBLE"];
    const hasHighRisk = [adult, violence, racy].some((level) => highRiskLevels.includes(level));
    const hasMediumRisk = [adult, violence, racy].some((level) => mediumRiskLevels.includes(level));
    let isAppropriate = true;
    let confidence = 0.9; // High confidence from Vision AI
    let reason = "Analyzed by Google Vision AI SafeSearch";
    if (hasHighRisk) {
        isAppropriate = false;
        confidence = 0.9;
        reason = "High-risk content detected by Vision AI";
    }
    else if (hasMediumRisk) {
        isAppropriate = false;
        confidence = 0.6;
        reason = "Potentially inappropriate content detected by Vision AI";
    }
    return {
        isAppropriate,
        confidence,
        categories,
        reason,
    };
}
/**
 * Log moderation results to Firestore
 */
async function logModerationToFirestore(userId, imageUrl, result) {
    try {
        const logData = {
            userId,
            imageUrl,
            moderationType: "vision_ai",
            result,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            service: "google_vision_safesearch",
        };
        await admin.firestore().collection("visionModerationLogs").add(logData);
    }
    catch (error) {
        console.error("Failed to log Vision AI moderation:", error);
        // Don't throw - logging failure shouldn't break moderation
    }
}
//# sourceMappingURL=visionModeration.js.map