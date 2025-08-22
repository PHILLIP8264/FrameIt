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
exports.cleanupInvalidTokens = exports.cleanupOldNotifications = exports.sendDailyReminders = exports.sendBulkNotifications = exports.sendPushNotification = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
const firebase_functions_1 = require("firebase-functions");
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * Cloud Function triggered when a new notification is created
 * Sends push notification to the user's device
 */
exports.sendPushNotification = (0, firestore_1.onDocumentCreated)("notifications/{notificationId}", async (event) => {
    var _a, _b, _c;
    try {
        const notificationData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!notificationData) {
            firebase_functions_1.logger.error("No notification data found");
            return;
        }
        const { userId, title, body, type, data } = notificationData;
        // Get user's push token
        const tokenDoc = await admin
            .firestore()
            .collection("pushTokens")
            .doc(userId)
            .get();
        if (!tokenDoc.exists) {
            firebase_functions_1.logger.info(`No push token found for user: ${userId}`);
            return;
        }
        const tokenData = tokenDoc.data();
        const { token, platform } = tokenData;
        // Prepare notification payload
        const payload = {
            token,
            notification: {
                title,
                body,
            },
            data: Object.assign({ type, notificationId: event.params.notificationId }, data),
            android: {
                notification: {
                    channelId: getChannelForType(type),
                    priority: "high",
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    defaultLightSettings: true,
                },
                priority: "high",
            },
            apns: {
                payload: {
                    aps: {
                        alert: {
                            title,
                            body,
                        },
                        sound: "default",
                        badge: await getBadgeCount(userId),
                    },
                },
            },
        };
        // Send the notification
        const response = await admin.messaging().send(payload);
        firebase_functions_1.logger.info(`Successfully sent message: ${response}`);
        // Log the notification send
        await admin.firestore().collection("notification_logs").add({
            notificationId: event.params.notificationId,
            userId,
            token,
            platform,
            success: true,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            response,
        });
    }
    catch (error) {
        firebase_functions_1.logger.error("Error sending push notification:", error);
        // Log the error
        await admin.firestore().collection("notification_logs").add({
            notificationId: event.params.notificationId,
            userId: (_c = (_b = event.data) === null || _b === void 0 ? void 0 : _b.data()) === null || _c === void 0 ? void 0 : _c.userId,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
});
/**
 * Get notification channel based on type
 */
function getChannelForType(type) {
    switch (type) {
        case "quest_completion":
        case "daily_reminder":
            return "quests";
        case "team_invite":
        case "team_quest":
            return "teams";
        case "contest_result":
            return "contests";
        default:
            return "default";
    }
}
/**
 * Get unread notification count for badge
 */
async function getBadgeCount(userId) {
    try {
        const snapshot = await admin
            .firestore()
            .collection("notifications")
            .where("userId", "==", userId)
            .where("read", "==", false)
            .get();
        return snapshot.size;
    }
    catch (error) {
        firebase_functions_1.logger.error("Error getting badge count:", error);
        return 0;
    }
}
/**
 * Send bulk notifications to multiple users
 */
const sendBulkNotifications = async (userIds, title, body, data) => {
    try {
        // Get all push tokens for the users
        const tokenPromises = userIds.map((userId) => admin.firestore().collection("pushTokens").doc(userId).get());
        const tokenDocs = await Promise.all(tokenPromises);
        const validTokens = [];
        tokenDocs.forEach((doc) => {
            if (doc.exists) {
                const tokenData = doc.data();
                validTokens.push(tokenData.token);
            }
        });
        if (validTokens.length === 0) {
            firebase_functions_1.logger.info("No valid push tokens found for bulk notification");
            return;
        }
        // Prepare multicast message
        const message = {
            tokens: validTokens,
            notification: {
                title,
                body,
            },
            data: data || {},
            android: {
                notification: {
                    channelId: "default",
                    priority: "high",
                    defaultSound: true,
                },
            },
            apns: {
                payload: {
                    aps: {
                        alert: { title, body },
                        sound: "default",
                    },
                },
            },
        };
        // Send bulk notification
        const response = await admin.messaging().sendEachForMulticast(message);
        firebase_functions_1.logger.info(`Bulk notification sent. Success: ${response.successCount}, Failed: ${response.failureCount}`);
        // Handle failed tokens (they might be invalid)
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(validTokens[idx]);
                    firebase_functions_1.logger.error(`Failed to send to token: ${validTokens[idx]}`);
                }
            });
            // TODO: Remove invalid tokens from database
        }
    }
    catch (error) {
        firebase_functions_1.logger.error("Error sending bulk notifications:", error);
    }
};
exports.sendBulkNotifications = sendBulkNotifications;
/**
 * Scheduled function to send daily reminders
 */
const sendDailyReminders = async () => {
    try {
        firebase_functions_1.logger.info("Starting daily reminder notifications");
        // Get all users who have notifications enabled
        const usersSnapshot = await admin
            .firestore()
            .collection("users")
            .where("notificationSettings.dailyReminders", "==", true)
            .get();
        const userIds = usersSnapshot.docs.map((doc) => doc.id);
        if (userIds.length === 0) {
            firebase_functions_1.logger.info("No users with daily reminders enabled");
            return;
        }
        // Create notifications for each user
        const batch = admin.firestore().batch();
        const now = admin.firestore.FieldValue.serverTimestamp();
        userIds.forEach((userId) => {
            const notificationRef = admin
                .firestore()
                .collection("notifications")
                .doc();
            batch.set(notificationRef, {
                userId,
                type: "daily_reminder",
                title: "Don't forget your daily quest! 📸",
                body: "Complete your daily quest to earn XP and unlock new achievements!",
                data: {},
                read: false,
                createdAt: now,
            });
        });
        await batch.commit();
        firebase_functions_1.logger.info(`Created daily reminder notifications for ${userIds.length} users`);
    }
    catch (error) {
        firebase_functions_1.logger.error("Error sending daily reminders:", error);
    }
};
exports.sendDailyReminders = sendDailyReminders;
/**
 * Clean up old notifications (run weekly)
 */
const cleanupOldNotifications = async () => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const oldNotifications = await admin
            .firestore()
            .collection("notifications")
            .where("createdAt", "<", oneMonthAgo)
            .limit(500)
            .get();
        if (oldNotifications.empty) {
            firebase_functions_1.logger.info("No old notifications to clean up");
            return;
        }
        const batch = admin.firestore().batch();
        oldNotifications.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        firebase_functions_1.logger.info(`Cleaned up ${oldNotifications.size} old notifications`);
    }
    catch (error) {
        firebase_functions_1.logger.error("Error cleaning up old notifications:", error);
    }
};
exports.cleanupOldNotifications = cleanupOldNotifications;
/**
 * Handle invalid push tokens
 */
const cleanupInvalidTokens = async (invalidTokens) => {
    try {
        const batch = admin.firestore().batch();
        for (const token of invalidTokens) {
            // Find and delete the invalid token
            const tokenQuery = await admin
                .firestore()
                .collection("pushTokens")
                .where("token", "==", token)
                .limit(1)
                .get();
            tokenQuery.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
        }
        await batch.commit();
        firebase_functions_1.logger.info(`Cleaned up ${invalidTokens.length} invalid push tokens`);
    }
    catch (error) {
        firebase_functions_1.logger.error("Error cleaning up invalid tokens:", error);
    }
};
exports.cleanupInvalidTokens = cleanupInvalidTokens;
//# sourceMappingURL=pushNotifications.js.map