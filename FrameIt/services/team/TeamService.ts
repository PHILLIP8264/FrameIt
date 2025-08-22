import {
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { BaseFirebaseService } from "../base/BaseFirebaseService";
import { db } from "../../config/firebase";

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[];
  leaderId: string;
  maxMembers: number;
  score: number;
  achievements: string[];
  inviteCodes: string[];
  isPublic: boolean;
  tags: string[];
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TeamService extends BaseFirebaseService {
  constructor() {
    super("teams");
  }

  async getTeam(teamId: string): Promise<Team | null> {
    return this.getById<Team>(teamId);
  }

  async createTeam(teamId: string, teamData: Partial<Team>): Promise<void> {
    const team: Partial<Team> = {
      ...teamData,
      members: teamData.members || [],
      score: 0,
      achievements: [],
      inviteCodes: [],
      isPublic: teamData.isPublic ?? true,
      tags: teamData.tags || [],
      maxMembers: teamData.maxMembers || 10,
    };
    return this.create(teamId, team);
  }

  async addMember(teamId: string, userId: string): Promise<void> {
    return this.update(teamId, {
      members: arrayUnion(userId),
    });
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    return this.update(teamId, {
      members: arrayRemove(userId),
    });
  }

  async updateTeamScore(teamId: string, points: number): Promise<void> {
    return this.update(teamId, {
      score: increment(points),
    });
  }

  async addAchievement(teamId: string, achievement: string): Promise<void> {
    return this.update(teamId, {
      achievements: arrayUnion(achievement),
    });
  }

  async getTeamsByLeader(leaderId: string): Promise<Team[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("leaderId", "==", leaderId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as Team);
    } catch (error) {
      console.error("Error getting teams by leader:", error);
      return [];
    }
  }

  async getTeamsByMember(userId: string): Promise<Team[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("members", "array-contains", userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as Team);
    } catch (error) {
      console.error("Error getting teams by member:", error);
      return [];
    }
  }

  async getPublicTeams(): Promise<Team[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("isPublic", "==", true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as Team);
    } catch (error) {
      console.error("Error getting public teams:", error);
      return [];
    }
  }

  async searchTeams(searchTerm: string): Promise<Team[]> {
    try {
      const teams = await this.getAll<Team>();
      return teams.filter(
        (team) =>
          team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    } catch (error) {
      console.error("Error searching teams:", error);
      return [];
    }
  }
}

export const teamService = new TeamService();
