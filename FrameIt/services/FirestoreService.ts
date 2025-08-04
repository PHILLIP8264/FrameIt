import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  level: number;
  totalPoints: number;
  challengesCompleted: number;
  framesCreated: number;
  photosFramed: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  userId: string;
}

export interface FramedPhoto {
  id: string;
  originalPhotoURL: string;
  framedPhotoURL: string;
  frameId: string;
  frameName: string;
  userId: string;
  createdAt: Timestamp;
}

export class FirestoreService {
  // User Profile Methods
  static async createUserProfile(
    userData: Omit<UserProfile, "createdAt" | "updatedAt">
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userData.uid);
      const now = Timestamp.now();

      await setDoc(userRef, {
        ...userData,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  static async updateUserProfile(
    uid: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  // Challenge Methods
  static async createChallenge(
    challengeData: Omit<Challenge, "id" | "createdAt">
  ): Promise<string> {
    try {
      const challengesRef = collection(db, "challenges");
      const docRef = await addDoc(challengesRef, {
        ...challengeData,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating challenge:", error);
      throw error;
    }
  }

  static async getUserChallenges(userId: string): Promise<Challenge[]> {
    try {
      const challengesRef = collection(db, "challenges");
      const q = query(
        challengesRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Challenge)
      );
    } catch (error) {
      console.error("Error getting user challenges:", error);
      throw error;
    }
  }

  static async updateChallenge(
    challengeId: string,
    updates: Partial<Challenge>
  ): Promise<void> {
    try {
      const challengeRef = doc(db, "challenges", challengeId);
      await updateDoc(challengeRef, updates);
    } catch (error) {
      console.error("Error updating challenge:", error);
      throw error;
    }
  }

  static async deleteChallenge(challengeId: string): Promise<void> {
    try {
      const challengeRef = doc(db, "challenges", challengeId);
      await deleteDoc(challengeRef);
    } catch (error) {
      console.error("Error deleting challenge:", error);
      throw error;
    }
  }

  // Framed Photo Methods
  static async saveFramedPhoto(
    photoData: Omit<FramedPhoto, "id" | "createdAt">
  ): Promise<string> {
    try {
      const photosRef = collection(db, "framedPhotos");
      const docRef = await addDoc(photosRef, {
        ...photoData,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error saving framed photo:", error);
      throw error;
    }
  }

  static async getUserFramedPhotos(userId: string): Promise<FramedPhoto[]> {
    try {
      const photosRef = collection(db, "framedPhotos");
      const q = query(
        photosRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as FramedPhoto)
      );
    } catch (error) {
      console.error("Error getting user framed photos:", error);
      throw error;
    }
  }

  static async deleteFramedPhoto(photoId: string): Promise<void> {
    try {
      const photoRef = doc(db, "framedPhotos", photoId);
      await deleteDoc(photoRef);
    } catch (error) {
      console.error("Error deleting framed photo:", error);
      throw error;
    }
  }

  // Leaderboard Methods
  static async getLeaderboard(limitCount: number = 50): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        orderBy("totalPoints", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as UserProfile);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      throw error;
    }
  }

  // Update user stats after completing challenges or creating frames
  static async updateUserStats(
    userId: string,
    pointsToAdd: number,
    type: "challenge" | "frame" | "photo"
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const updates: Partial<UserProfile> = {
          totalPoints: userData.totalPoints + pointsToAdd,
          updatedAt: Timestamp.now(),
        };

        if (type === "challenge") {
          updates.challengesCompleted = userData.challengesCompleted + 1;
        } else if (type === "frame") {
          updates.framesCreated = userData.framesCreated + 1;
        } else if (type === "photo") {
          updates.photosFramed = userData.photosFramed + 1;
        }

        // Level up logic (every 1000 points = 1 level)
        const newLevel = Math.floor(updates.totalPoints! / 1000) + 1;
        if (newLevel > userData.level) {
          updates.level = newLevel;
        }

        await updateDoc(userRef, updates);
      }
    } catch (error) {
      console.error("Error updating user stats:", error);
      throw error;
    }
  }
}
