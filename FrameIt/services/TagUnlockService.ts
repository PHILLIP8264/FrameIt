import { FirestoreService } from "./index";
import { Tag, User, Achievement } from "../types/database";

export class TagUnlockService {
  /**
   * Check if a user meets the requirements for a specific tag
   */
  static async checkTagEligibility(userId: string, tag: Tag): Promise<boolean> {
    try {
      // Get user data
      const user = await FirestoreService.getUser(userId);
      if (!user) return false;

      const requirements = tag.requirements;

      // Check quest completion requirement
      if (requirements.questsCompleted && requirements.questsCompleted > 0) {
        const completedQuests = await FirestoreService.getCompletedQuests(
          userId
        );
        if (completedQuests.length < requirements.questsCompleted) {
          return false;
        }
      }

      // Check total XP requirement
      if (requirements.totalXP && requirements.totalXP > 0) {
        if ((user.totalXP || 0) < requirements.totalXP) {
          return false;
        }
      }

      // Check votes requirement
      if (requirements.votes && requirements.votes > 0) {
        const totalVotes = await this.getUserTotalVotes(userId);
        if (totalVotes < requirements.votes) {
          return false;
        }
      }

      // Check streak requirement
      if (requirements.streakDays && requirements.streakDays > 0) {
        if ((user.streakCount || 0) < requirements.streakDays) {
          return false;
        }
      }

      // Check achievement requirements
      if (requirements.achievements && requirements.achievements.length > 0) {
        const userAchievements = user.achievements || [];
        const hasAllAchievements = requirements.achievements.every((achId) =>
          userAchievements.includes(achId)
        );
        if (!hasAllAchievements) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking tag eligibility:", error);
      return false;
    }
  }

  /**
   * Check and unlock all eligible tags for a user
   */
  static async checkAndUnlockTags(userId: string): Promise<string[]> {
    try {
      // Get all active tags
      const allTags = await FirestoreService.getTags();
      const activeTags = allTags.filter((tag) => tag.isActive);

      // Get user's current unlocked tags
      const user = await FirestoreService.getUser(userId);
      if (!user) return [];

      const currentUnlockedTags = user.unlockedTags || [];
      const newlyUnlockedTags: string[] = [];

      // Check each tag for eligibility
      for (const tag of activeTags) {
        // Skip if already unlocked
        if (currentUnlockedTags.includes(tag.id)) continue;

        // Check if eligible
        const isEligible = await this.checkTagEligibility(userId, tag);
        if (isEligible) {
          newlyUnlockedTags.push(tag.id);
        }
      }

      // Update user's unlocked tags if there are new ones
      if (newlyUnlockedTags.length > 0) {
        const updatedUnlockedTags = [
          ...currentUnlockedTags,
          ...newlyUnlockedTags,
        ];
        const tagUnlockHistory = user.tagUnlockHistory || [];

        // Add to unlock history
        const newUnlockHistory = newlyUnlockedTags.map((tagId) => ({
          tagId,
          unlockedAt: new Date().toISOString(),
        }));

        await FirestoreService.setUser(userId, {
          ...user,
          unlockedTags: updatedUnlockedTags,
          tagUnlockHistory: [...tagUnlockHistory, ...newUnlockHistory],
        });

        console.log(`🏷️ User ${userId} unlocked tags:`, newlyUnlockedTags);
      }

      return newlyUnlockedTags;
    } catch (error) {
      console.error("Error checking and unlocking tags:", error);
      return [];
    }
  }

  /**
   * Get all unlocked tags for a user with tag details
   */
  static async getUserUnlockedTags(userId: string): Promise<Tag[]> {
    try {
      const user = await FirestoreService.getUser(userId);
      if (!user || !user.unlockedTags) return [];

      const allTags = await FirestoreService.getTags();
      return allTags.filter((tag) => user.unlockedTags!.includes(tag.id));
    } catch (error) {
      console.error("Error getting user unlocked tags:", error);
      return [];
    }
  }

  /**
   * Get tag unlock progress for a user
   */
  static async getTagProgress(
    userId: string,
    tagId: string
  ): Promise<{
    isUnlocked: boolean;
    progress: {
      questsCompleted: { current: number; required: number };
      totalXP: { current: number; required: number };
      achievements: { current: number; required: number };
      votes: { current: number; required: number };
      streakDays: { current: number; required: number };
    };
  }> {
    try {
      const user = await FirestoreService.getUser(userId);
      const allTags = await FirestoreService.getTags();
      const tag = allTags.find((t) => t.id === tagId);

      if (!user || !tag) {
        throw new Error("User or tag not found");
      }

      const isUnlocked = (user.unlockedTags || []).includes(tagId);
      const completedQuests = await FirestoreService.getCompletedQuests(userId);
      const userAchievements = user.achievements || [];
      const totalVotes = await this.getUserTotalVotes(userId);

      return {
        isUnlocked,
        progress: {
          questsCompleted: {
            current: completedQuests.length,
            required: tag.requirements.questsCompleted || 0,
          },
          totalXP: {
            current: user.totalXP || 0,
            required: tag.requirements.totalXP || 0,
          },
          achievements: {
            current: tag.requirements.achievements
              ? tag.requirements.achievements.filter((achId) =>
                  userAchievements.includes(achId)
                ).length
              : 0,
            required: tag.requirements.achievements?.length || 0,
          },
          votes: {
            current: totalVotes,
            required: tag.requirements.votes || 0,
          },
          streakDays: {
            current: user.streakCount || 0,
            required: tag.requirements.streakDays || 0,
          },
        },
      };
    } catch (error) {
      console.error("Error getting tag progress:", error);
      return {
        isUnlocked: false,
        progress: {
          questsCompleted: { current: 0, required: 0 },
          totalXP: { current: 0, required: 0 },
          achievements: { current: 0, required: 0 },
          votes: { current: 0, required: 0 },
          streakDays: { current: 0, required: 0 },
        },
      };
    }
  }

  /**
   * Manually unlock a tag for a user (admin function)
   */
  static async unlockTagForUser(userId: string, tagId: string): Promise<void> {
    try {
      const user = await FirestoreService.getUser(userId);
      if (!user) throw new Error("User not found");

      const currentUnlockedTags = user.unlockedTags || [];
      if (currentUnlockedTags.includes(tagId)) {
        throw new Error("Tag already unlocked");
      }

      const tagUnlockHistory = user.tagUnlockHistory || [];
      await FirestoreService.setUser(userId, {
        ...user,
        unlockedTags: [...currentUnlockedTags, tagId],
        tagUnlockHistory: [
          ...tagUnlockHistory,
          {
            tagId,
            unlockedAt: new Date().toISOString(),
            triggerAchievement: "admin_unlock",
          },
        ],
      });

      console.log(`🏷️ Admin unlocked tag ${tagId} for user ${userId}`);
    } catch (error) {
      console.error("Error manually unlocking tag:", error);
      throw error;
    }
  }

  /**
   * Get total votes received by a user across all submissions
   */
  private static async getUserTotalVotes(userId: string): Promise<number> {
    try {
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

      return totalVotes;
    } catch (error) {
      console.error("Error getting user total votes:", error);
      return 0;
    }
  }

  /**
   * Check tags that specifically require a certain achievement
   */
  static async checkTagsForAchievement(
    userId: string,
    achievementId: string
  ): Promise<string[]> {
    try {
      const allTags = await FirestoreService.getTags();
      const user = await FirestoreService.getUser(userId);

      if (!user) return [];

      const relevantTags = allTags.filter(
        (tag) =>
          tag.isActive &&
          tag.requirements.achievements?.includes(achievementId) &&
          !(user.unlockedTags || []).includes(tag.id)
      );

      const newlyUnlockedTags: string[] = [];

      for (const tag of relevantTags) {
        const isEligible = await this.checkTagEligibility(userId, tag);
        if (isEligible) {
          await this.unlockTagForUser(userId, tag.id);
          newlyUnlockedTags.push(tag.id);
          console.log(
            `🏷️ Achievement ${achievementId} unlocked tag: ${tag.name}`
          );
        }
      }

      return newlyUnlockedTags;
    } catch (error) {
      console.error("Error checking tags for achievement:", error);
      return [];
    }
  }
}

export default TagUnlockService;
