import { userService } from "./user/UserService";

const UserServiceWrapper = {
  getUser: userService.getUser.bind(userService),
  setUser: userService.setUser.bind(userService),
  getAllUsers: userService.getAllUsers.bind(userService),
  updateUserRole: userService.updateUserRole.bind(userService),
  awardAchievement: userService.awardAchievement.bind(userService),
  updateUserActivity: userService.updateUserActivity.bind(userService),
  searchUsers: userService.searchUsers.bind(userService),
  getUserFriends: userService.getUserFriends.bind(userService),
};

export default UserServiceWrapper;
