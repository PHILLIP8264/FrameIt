import React, { useState, useRef } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { leaderboardStyles as styles } from "../../styles";
import { User } from "../../types/database";
import { useLeaderboardManagement } from "../../hooks/useLeaderboardManagement";
import {
  LeaderboardHeader,
  LeaderboardTabContent,
} from "../../components/leaderboard";
import UserProfileModal from "../../components/profile/UserProfileModal";

const { width: screenWidth } = Dimensions.get("window");

interface ExplorerEntry extends User {
  questsCompleted: number;
  rank: number;
  title: string;
  badge: string;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const {
    selectedPeriod,
    explorerData,
    friendsData,
    teamData,
    loading,
    friendsLoading,
    teamLoading,
    handlePeriodChange,
    refreshCurrentTab,
  } = useLeaderboardManagement();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const periods = ["globally", "team", "friends"] as const;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    const newPeriod = periods[pageIndex];
    if (newPeriod && newPeriod !== selectedPeriod) {
      handlePeriodChange(newPeriod);
    }
  };

  const scrollToPage = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const handleUserPress = (userData: ExplorerEntry) => {
    if (userData.isCurrentUser) return;

    setSelectedUser(userData);
    setProfileModalVisible(true);
  };

  const handleChallenge = (userData: ExplorerEntry) => {};

  const closeProfileModal = () => {
    setProfileModalVisible(false);
    setSelectedUser(null);
  };

  const handlePeriodSelect = (period: "globally" | "team" | "friends") => {
    handlePeriodChange(period);
    const index = periods.indexOf(period);
    scrollToPage(index);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#137CD8" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { padding: 0 }]}>
      {/* Period Selector Header */}
      <LeaderboardHeader
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodSelect}
        onRefresh={refreshCurrentTab}
        isRefreshing={friendsLoading || teamLoading}
        showRefresh={selectedPeriod === "friends" || selectedPeriod === "team"}
      />

      {/* Swipeable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {periods.map((period) => (
          <LeaderboardTabContent
            key={period}
            period={period}
            screenWidth={screenWidth}
            explorerData={explorerData}
            friendsData={friendsData}
            teamData={teamData}
            loading={loading}
            friendsLoading={friendsLoading}
            teamLoading={teamLoading}
            onUserPress={handleUserPress}
            onChallenge={handleChallenge}
          />
        ))}
      </ScrollView>

      {/* User Profile Modal */}
      <UserProfileModal
        visible={profileModalVisible}
        user={selectedUser}
        onClose={closeProfileModal}
      />
    </View>
  );
}
