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
exports.cleanupInvalidTokens = exports.cleanupOldNotifications = exports.sendDailyReminders = exports.sendBulkNotifications = exports.sendPushNotification = exports.moderateImageWithVision = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp();
}
// Export all functions
var visionModerationBasic_1 = require("./visionModerationBasic");
Object.defineProperty(exports, "moderateImageWithVision", { enumerable: true, get: function () { return visionModerationBasic_1.moderateImageWithVision; } });
var pushNotifications_1 = require("./pushNotifications");
Object.defineProperty(exports, "sendPushNotification", { enumerable: true, get: function () { return pushNotifications_1.sendPushNotification; } });
Object.defineProperty(exports, "sendBulkNotifications", { enumerable: true, get: function () { return pushNotifications_1.sendBulkNotifications; } });
Object.defineProperty(exports, "sendDailyReminders", { enumerable: true, get: function () { return pushNotifications_1.sendDailyReminders; } });
Object.defineProperty(exports, "cleanupOldNotifications", { enumerable: true, get: function () { return pushNotifications_1.cleanupOldNotifications; } });
Object.defineProperty(exports, "cleanupInvalidTokens", { enumerable: true, get: function () { return pushNotifications_1.cleanupInvalidTokens; } });
//# sourceMappingURL=index.js.map