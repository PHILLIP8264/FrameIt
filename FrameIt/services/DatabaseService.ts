import { db } from "../config/firebase"; // Import Firestore instance
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { Group, Tag, Vote } from "../types/database";

// Service for managing Firestore operations
const DatabaseService = {
  // Votes
  async addVote(submissionId: string, vote: Vote): Promise<void> {
    const voteRef = doc(
      collection(db, "submissions", submissionId, "votes"),
      vote.userId
    );
    await setDoc(voteRef, vote);
  },

  // Groups
  async createGroup(group: Group): Promise<void> {
    const groupRef = doc(collection(db, "groups"), group.groupId);
    await setDoc(groupRef, group);
  },

  async addUserToGroup(groupId: string, userId: string): Promise<void> {
    const groupRef = doc(collection(db, "groups"), groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
    });
  },

  // Completed Quests
  async addCompletedQuest(
    userId: string,
    quest: { questId: string }
  ): Promise<void> {
    const questRef = doc(
      collection(db, "users", userId, "completedQuests"),
      quest.questId
    );
    await setDoc(questRef, quest);
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    const tagsSnapshot = await getDocs(collection(db, "tags"));
    return tagsSnapshot.docs.map((doc) => doc.data() as Tag);
  },
};

export default DatabaseService;
