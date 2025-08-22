import { FirestoreService } from "./index";
import TagUnlockService from "./TagUnlockService";
import { Achievement } from "../types/database";

class AchievementService {
  async checkQuestAchievements(userId: string): Promise<string[]> {
    try {
      const [completedQuests, allAchievements, user] = await Promise.all([
        FirestoreService.getCompletedQuests(userId),
        FirestoreService.getAchievements(),
        FirestoreService.getUser(userId),
      ]);

      if (!user) return [];

      const questAchievements = allAchievements.filter(
        (ach) => ach.type === "quest"
      );
      const userAchievements = user.achievements || [];
      const newlyAwarded: string[] = [];

      for (const achievement of questAchievements) {
        // Skip if already has achievement
        if (userAchievements.includes(achievement.id)) continue;

        let shouldAward = false;

        // Check achievement requirements based on ID/name
        switch (achievement.id) {
          case "first-quest":
            shouldAward = completedQuests.length >= 1;
            break;
          case "explorer":
            shouldAward = completedQuests.length >= 10;
            break;
          case "dedicated-adventurer":
            shouldAward = completedQuests.length >= 50;
            break;
          // Add more quest-based achievements here
          default:
            // Generic quest count achievements
            if (achievement.description.includes("Complete")) {
              const questCount = this.extractNumberFromDescription(
                achievement.description
              );
              if (questCount && completedQuests.length >= questCount) {
                shouldAward = true;
              }
            }
            break;
        }

        if (shouldAward) {
          const awarded = await FirestoreService.awardAchievement(
            userId,
            achievement.id
          );
          if (awarded) {
            newlyAwarded.push(achievement.id);
          }
        }
      }

      // Check for tag unlocks triggered by new achievements
      if (newlyAwarded.length > 0) {
        for (const achievementId of newlyAwarded) {
          try {
            await TagUnlockService.checkTagsForAchievement(
              userId,
              achievementId
            );
          } catch (error) {
            console.error(
              `Error checking tags for achievement ${achievementId}:`,
              error
            );
          }
        }
      }

      return newlyAwarded;
    } catch (error) {
      console.error("Error checking quest achievements:", error);
      return [];
    }
  }

  /**
   * Check and award vote-based achievements
   */
  async checkVoteAchievements(userId: string): Promise<string[]> {
    try {
      const [allAchievements, user] = await Promise.all([
        FirestoreService.getAchievements(),
        FirestoreService.getUser(userId),
      ]);

      if (!user) return [];

      // Get total votes for user
      const submissions = await FirestoreService.getUserSubmissions(userId);
      let totalVotes = 0;

      for (const submission of submissions) {
        try {
          const votes = await FirestoreService.getSubmissionVotes(
            submission.subId
          );
          totalVotes += votes.length;
        } catch (error) {
          console.error(
            `Error getting votes for submission ${submission.subId}:`,
            error
          );
        }
      }

      const voteAchievements = allAchievements.filter(
        (ach) => ach.type === "vote"
      );
      const userAchievements = user.achievements || [];
      const newlyAwarded: string[] = [];

      for (const achievement of voteAchievements) {
        // Skip if already has achievement
        if (userAchievements.includes(achievement.id)) continue;

        let shouldAward = false;

        switch (achievement.id) {
          case "photographer":
            shouldAward = totalVotes >= 50;
            break;
          case "social-butterfly":
            shouldAward = totalVotes >= 100;
            break;
          // Add more vote-based achievements here
          default:
            // Generic vote count achievements
            const voteCount = this.extractNumberFromDescription(
              achievement.description
            );
            if (voteCount && totalVotes >= voteCount) {
              shouldAward = true;
            }
            break;
        }

        if (shouldAward) {
          const awarded = await FirestoreService.awardAchievement(
            userId,
            achievement.id
          );
          if (awarded) {
            newlyAwarded.push(achievement.id);
          }
        }
      }

      // Check for tag unlocks triggered by new achievements
      if (newlyAwarded.length > 0) {
        for (const achievementId of newlyAwarded) {
          try {
            await TagUnlockService.checkTagsForAchievement(
              userId,
              achievementId
            );
          } catch (error) {
            console.error(
              `Error checking tags for achievement ${achievementId}:`,
              error
            );
          }
        }
      }

      return newlyAwarded;
    } catch (error) {
      console.error("Error checking vote achievements:", error);
      return [];
    }
  }

  /**
   * Check and award streak-based achievements
   */
  async checkStreakAchievements(userId: string): Promise<string[]> {
    try {
      const [allAchievements, user] = await Promise.all([
        FirestoreService.getAchievements(),
        FirestoreService.getUser(userId),
      ]);

      if (!user) return [];

      const streakAchievements = allAchievements.filter(
        (ach) => ach.type === "streak"
      );
      const userAchievements = user.achievements || [];
      const currentStreak = user.streakCount || 0;
      const newlyAwarded: string[] = [];

      for (const achievement of streakAchievements) {
        // Skip if already has achievement
        if (userAchievements.includes(achievement.id)) continue;

        let shouldAward = false;

        switch (achievement.id) {
          case "streak-master":
            shouldAward = currentStreak >= 100;
            break;
          case "dedicated-adventurer":
            shouldAward = currentStreak >= 30;
            break;
          // Add more streak-based achievements here
          default:
            // Generic streak count achievements
            const streakCount = this.extractNumberFromDescription(
              achievement.description
            );
            if (streakCount && currentStreak >= streakCount) {
              shouldAward = true;
            }
            break;
        }

        if (shouldAward) {
          const awarded = await FirestoreService.awardAchievement(
            userId,
            achievement.id
          );
          if (awarded) {
            newlyAwarded.push(achievement.id);
          }
        }
      }

      // Check for tag unlocks triggered by new achievements
      if (newlyAwarded.length > 0) {
        for (const achievementId of newlyAwarded) {
          try {
            await TagUnlockService.checkTagsForAchievement(
              userId,
              achievementId
            );
          } catch (error) {
            console.error(
              `Error checking tags for achievement ${achievementId}:`,
              error
            );
          }
        }
      }

      return newlyAwarded;
    } catch (error) {
      console.error("Error checking streak achievements:", error);
      return [];
    }
  }

  /**
   * Check all achievement types for a user
   */
  async checkAllAchievements(userId: string): Promise<{
    questAchievements: string[];
    voteAchievements: string[];
    streakAchievements: string[];
    total: number;
  }> {
    const [questAchievements, voteAchievements, streakAchievements] =
      await Promise.all([
        this.checkQuestAchievements(userId),
        this.checkVoteAchievements(userId),
        this.checkStreakAchievements(userId),
      ]);

    return {
      questAchievements,
      voteAchievements,
      streakAchievements,
      total:
        questAchievements.length +
        voteAchievements.length +
        streakAchievements.length,
    };
  }

  /**
   * Extract a number from achievement description
   */
  private extractNumberFromDescription(description: string): number | null {
    const match = description.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Award a specific achievement manually (admin function)
   */
  async awardAchievementManually(
    userId: string,
    achievementId: string
  ): Promise<boolean> {
    try {
      const awarded = await FirestoreService.awardAchievement(
        userId,
        achievementId
      );

      if (awarded) {
        // Check for tag unlocks
        await TagUnlockService.checkTagsForAchievement(userId, achievementId);
      }

      return awarded;
    } catch (error) {
      console.error("Error manually awarding achievement:", error);
      return false;
    }
  }
}

export default new AchievementService();
