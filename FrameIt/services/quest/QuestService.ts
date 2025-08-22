import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  arrayUnion,
} from "firebase/firestore";
import { BaseFirebaseService } from "../base/BaseFirebaseService";
import { db } from "../../config/firebase";

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  timeLimit?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  requirements: string[];
  rewards: {
    points: number;
    achievements?: string[];
    unlocks?: string[];
  };
  status: "active" | "inactive" | "draft";
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestCompletion {
  id: string;
  questId: string;
  userId: string;
  teamId?: string;
  completedAt: Date;
  evidence?: {
    photos: string[];
    description: string;
  };
  score: number;
  verified: boolean;
}

export class QuestService extends BaseFirebaseService {
  private completionsService: BaseFirebaseService;

  constructor() {
    super("quests");
    this.completionsService = new BaseFirebaseService("questCompletions");
  }

  async getQuest(questId: string): Promise<Quest | null> {
    return this.getById<Quest>(questId);
  }

  async createQuest(questId: string, questData: Partial<Quest>): Promise<void> {
    const quest: Partial<Quest> = {
      ...questData,
      status: questData.status || "draft",
      tags: questData.tags || [],
      requirements: questData.requirements || [],
      rewards: questData.rewards || { points: 0 },
    };
    return this.create(questId, quest);
  }

  async getActiveQuests(): Promise<Quest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as Quest);
    } catch (error) {
      console.error("Error getting active quests:", error);
      return [];
    }
  }

  async getQuestsByCategory(category: string): Promise<Quest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("category", "==", category),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as Quest);
    } catch (error) {
      console.error("Error getting quests by category:", error);
      return [];
    }
  }

  async getQuestsByDifficulty(
    difficulty: "easy" | "medium" | "hard"
  ): Promise<Quest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("difficulty", "==", difficulty),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as Quest);
    } catch (error) {
      console.error("Error getting quests by difficulty:", error);
      return [];
    }
  }

  async getQuestsByCreator(creatorId: string): Promise<Quest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("createdBy", "==", creatorId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as Quest);
    } catch (error) {
      console.error("Error getting quests by creator:", error);
      return [];
    }
  }

  async completeQuest(
    completionId: string,
    questId: string,
    userId: string,
    evidence?: any,
    teamId?: string
  ): Promise<void> {
    const completion: Partial<QuestCompletion> = {
      questId,
      userId,
      teamId,
      completedAt: new Date(),
      evidence,
      verified: false,
      score: 0,
    };
    return this.completionsService.create(completionId, completion);
  }

  async getUserCompletions(userId: string): Promise<QuestCompletion[]> {
    try {
      const q = query(
        collection(db, "questCompletions"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as QuestCompletion);
    } catch (error) {
      console.error("Error getting user completions:", error);
      return [];
    }
  }

  async getTeamCompletions(teamId: string): Promise<QuestCompletion[]> {
    try {
      const q = query(
        collection(db, "questCompletions"),
        where("teamId", "==", teamId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as QuestCompletion);
    } catch (error) {
      console.error("Error getting team completions:", error);
      return [];
    }
  }

  async verifyCompletion(completionId: string, score: number): Promise<void> {
    return this.completionsService.update(completionId, {
      verified: true,
      score,
    });
  }

  async searchQuests(searchTerm: string): Promise<Quest[]> {
    try {
      const quests = await this.getActiveQuests();
      return quests.filter(
        (quest) =>
          quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quest.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quest.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    } catch (error) {
      console.error("Error searching quests:", error);
      return [];
    }
  }
}

export const questService = new QuestService();
