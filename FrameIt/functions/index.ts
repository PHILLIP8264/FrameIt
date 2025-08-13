import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Scheduled function to reset streaks daily
export const resetStreaks = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const usersSnapshot = await db.collection("users").get();

    usersSnapshot.forEach(
      async (userDoc: FirebaseFirestore.QueryDocumentSnapshot) => {
        const userData = userDoc.data();
        const streakCount = userData.streakCount || 0;

        // Reset streak if no quest completed today
        const lastCompletedQuest = await db
          .collection("users")
          .doc(userDoc.id)
          .collection("completedQuests")
          .orderBy("completedAt", "desc")
          .limit(1)
          .get();

        if (!lastCompletedQuest.empty) {
          const lastCompletedDate = lastCompletedQuest.docs[0]
            .data()
            .completedAt.toDate();
          const today = new Date();
          if (lastCompletedDate.toDateString() !== today.toDateString()) {
            await userDoc.ref.update({ streakCount: 0 });
          }
        } else {
          await userDoc.ref.update({ streakCount: 0 });
        }
      }
    );
  });

// Scheduled function to expire quests
export const expireQuests = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const expiredQuests = await db
      .collection("quests")
      .where("endDate", "<", now)
      .get();

    expiredQuests.forEach(
      async (questDoc: FirebaseFirestore.QueryDocumentSnapshot) => {
        await questDoc.ref.update({ status: "expired" });
      }
    );
  });
