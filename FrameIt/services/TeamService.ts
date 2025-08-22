import { teamService } from "./team/TeamService";

const TeamServiceWrapper = {
  getTeam: teamService.getTeam.bind(teamService),
  createTeam: teamService.createTeam.bind(teamService),
  addMember: teamService.addMember.bind(teamService),
  removeMember: teamService.removeMember.bind(teamService),
  updateTeamScore: teamService.updateTeamScore.bind(teamService),
  addAchievement: teamService.addAchievement.bind(teamService),
  getTeamsByLeader: teamService.getTeamsByLeader.bind(teamService),
  getTeamsByMember: teamService.getTeamsByMember.bind(teamService),
  getPublicTeams: teamService.getPublicTeams.bind(teamService),
  searchTeams: teamService.searchTeams.bind(teamService),
};

export default TeamServiceWrapper;
