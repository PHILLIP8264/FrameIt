import { questService } from "./quest/QuestService";

const QuestServiceWrapper = {
  getQuest: questService.getQuest.bind(questService),
  createQuest: questService.createQuest.bind(questService),
  getActiveQuests: questService.getActiveQuests.bind(questService),
  getQuestsByCategory: questService.getQuestsByCategory.bind(questService),
  getQuestsByDifficulty: questService.getQuestsByDifficulty.bind(questService),
  getQuestsByCreator: questService.getQuestsByCreator.bind(questService),
  completeQuest: questService.completeQuest.bind(questService),
  getUserCompletions: questService.getUserCompletions.bind(questService),
  getTeamCompletions: questService.getTeamCompletions.bind(questService),
  verifyCompletion: questService.verifyCompletion.bind(questService),
  searchQuests: questService.searchQuests.bind(questService),
};

export default QuestServiceWrapper;
