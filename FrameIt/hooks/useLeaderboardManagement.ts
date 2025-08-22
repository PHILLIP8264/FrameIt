import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { User } from "../types/database";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services";

interface ExplorerEntry extends User {
  questsCompleted: number;
  rank: number;
  title: string;
  badge: string;
  isCurrentUser?: boolean;
}

interface TeamLeaderboardData {
  teamId: string;
  teamName: string;
  members: ExplorerEntry[];
}

export function useLeaderboardManagement() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "globally" | "team" | "friends"
  >("globally");
  const [explorerData, setExplorerData] = useState<ExplorerEntry[]>([]);
  const [friendsData, setFriendsData] = useState<ExplorerEntry[]>([]);
  const [teamData, setTeamData] = useState<TeamLeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);

  const getBadgeFromLevel = (level: number) => {
    if (level >= 15) return "ribbon";
    if (level >= 10) return "trophy";
    if (level >= 5) return "star";
    if (level >= 3) return "medal";
    return "folder";
  };

  // Real-time listener for global leaderboard
  useEffect(() => {
    const usersQuery = query(
      collection(db, "users"),
      orderBy("xp", "desc"),
      limit(50) // Top 50 users
    );

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc, index) => {
          const userData = doc.data() as User;
          return {
            ...userData,
            questsCompleted: 0,
            rank: index + 1,
            title: (userData.tag || "explorer") as string,
            badge: getBadgeFromLevel(userData.level),
            isCurrentUser: doc.id === user?.uid,
          } as ExplorerEntry;
        });

        setExplorerData(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Load friends leaderboard data
  const loadFriendsData = async () => {
    if (!user?.uid) return;

    setFriendsLoading(true);
    try {
      // Get user's friends list
      const userFriends = await FirestoreService.getUserFriends(user.uid);

      if (userFriends.length === 0) {
        setFriendsData([]);
        setFriendsLoading(false);
        return;
      }

      // Get detailed user data for each friend
      const friendsDetails = await Promise.all(
        userFriends.map(async (friend) => {
          const friendData = await FirestoreService.getUser(friend.friendId);
          return friendData;
        })
      );

      // Filter out null results and include current user
      const validFriends = friendsDetails.filter(
        (friend) => friend !== null
      ) as User[];

      // Add current user to the mix for comparison
      const currentUserData = await FirestoreService.getUser(user.uid);
      if (currentUserData) {
        validFriends.push(currentUserData);
      }

      // Sort by XP and add ranking
      const sortedFriends = validFriends
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .map(
          (friend, index) =>
            ({
              ...friend,
              questsCompleted: 0,
              rank: index + 1,
              title: (friend.tag || "explorer") as string,
              badge: getBadgeFromLevel(friend.level || 1),
              isCurrentUser: friend.userId === user.uid,
            } as ExplorerEntry)
        );

      setFriendsData(sortedFriends);
    } catch (error) {
      console.error("Error loading friends data:", error);
      setFriendsData([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  // Load team leaderboard data
  const loadTeamData = async () => {
    if (!user?.uid) return;

    setTeamLoading(true);
    try {
      // Get current user data to find all their teams
      const currentUserData = await FirestoreService.getUser(user.uid);

      if (!currentUserData?.teams || currentUserData.teams.length === 0) {
        setTeamData([]);
        setTeamLoading(false);
        return;
      }

      // Load data for all teams the user belongs to
      const allTeamsData: TeamLeaderboardData[] = [];

      for (const teamId of currentUserData.teams) {
        try {
          // Get team info
          const team = await FirestoreService.getTeam(teamId);
          if (!team || !team.isActive) continue;

          // Get team members
          const teamMembers = await FirestoreService.getTeamMembers(teamId);

          if (teamMembers.length === 0) continue;

          // Sort by XP and add ranking
          const sortedTeamMembers = teamMembers
            .sort((a, b) => (b.xp || 0) - (a.xp || 0))
            .map(
              (member, index) =>
                ({
                  ...member,
                  questsCompleted: 0,
                  rank: index + 1,
                  title: (member.tag || "explorer") as string,
                  badge: getBadgeFromLevel(member.level || 1),
                  isCurrentUser: member.userId === user.uid,
                } as ExplorerEntry)
            );

          allTeamsData.push({
            teamId: team.teamId,
            teamName: team.name,
            members: sortedTeamMembers,
          });
        } catch (teamError) {
          console.error(`Error loading team ${teamId}:`, teamError);
        }
      }

      setTeamData(allTeamsData);
    } catch (error) {
      console.error("Error loading team data:", error);
      setTeamData([]);
    } finally {
      setTeamLoading(false);
    }
  };

  // Load friends data when tab is selected
  useEffect(() => {
    if (selectedPeriod === "friends" && user?.uid) {
      loadFriendsData();
    }
  }, [selectedPeriod, user?.uid]);

  // Load team data when tab is selected
  useEffect(() => {
    if (selectedPeriod === "team" && user?.uid) {
      loadTeamData();
    }
  }, [selectedPeriod, user?.uid]);

  const refreshCurrentTab = () => {
    switch (selectedPeriod) {
      case "friends":
        loadFriendsData();
        break;
      case "team":
        loadTeamData();
        break;
      // Global data is already real-time, no need to refresh
    }
  };

  const handlePeriodChange = (period: "globally" | "team" | "friends") => {
    setSelectedPeriod(period);

    // Auto-refresh data when switching to friends or team tab
    if (period === "friends") {
      loadFriendsData();
    } else if (period === "team") {
      loadTeamData();
    }
  };

  return {
    selectedPeriod,
    explorerData,
    friendsData,
    teamData,
    loading,
    friendsLoading,
    teamLoading,
    handlePeriodChange,
    refreshCurrentTab,
  };
}
