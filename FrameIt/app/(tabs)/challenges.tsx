import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { challengesStyles as styles } from "../../styles";
import { useQuestManagement } from "../../hooks/useQuestManagement";
import QuestCard from "../../components/challenges/QuestCard";
import QuestFilters from "../../components/challenges/QuestFilters";
import QuestDiscoveryMap from "../../components/quest/QuestDiscoveryMap";
import MapViewSwipe from "../../components/map/MapViewSwipe";

export default function Challenges() {
  const {
    quests,
    loading,
    refreshing,
    userLocation,
    dailyQuestCount,
    loadQuests,
    onRefresh,
    toggleQuest,
    openQuestDetails,
  } = useQuestManagement();

  const [showMap, setShowMap] = useState(false);
  const [filter, setFilter] = useState<{
    category?: string;
    difficulty?: string;
    sort: "distance" | "xp" | "difficulty" | "alphabetical";
    showCompleted: boolean;
    maxDistance?: number;
    minXp?: number;
    maxXp?: number;
  }>({
    sort: "distance",
    showCompleted: false,
  });
  const [searchText, setSearchText] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Load quests when dependencies change
  useEffect(() => {
    loadQuests(filter, searchText);
  }, [userLocation, filter, searchText]);

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#137CD8" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading quests...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: "transparent" }]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!showMap}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => onRefresh(filter, searchText)}
        />
      }
    >
      {/* Daily Quest Limit Banner */}
      <View
        style={[
          styles.locationBanner,
          {
            backgroundColor: dailyQuestCount.canStartQuest
              ? "#4CAF50"
              : "#FF5722",
            opacity: 0.9,
            paddingVertical: 8,
            minHeight: 40,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons
            name={
              dailyQuestCount.canStartQuest ? "checkmark-circle" : "warning"
            }
            size={16}
            color="white"
          />
          <Text
            style={[
              styles.locationBannerText,
              { color: "white", fontSize: 12, marginLeft: 6 },
            ]}
          >
            Daily: {dailyQuestCount.attemptsToday}/
            {dailyQuestCount.maxDailyQuests}
            {!dailyQuestCount.canStartQuest && " (Limit Reached)"}
          </Text>
        </View>
        {!dailyQuestCount.canStartQuest && (
          <Text style={{ color: "white", fontSize: 10, opacity: 0.9 }}>
            Resets at midnight
          </Text>
        )}
      </View>

      {/* View Toggle */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <MapViewSwipe
          isMapView={showMap}
          onToggle={(isMapView) => setShowMap(isMapView)}
        />
      </View>

      {/* Filters */}
      <QuestFilters
        filter={filter}
        setFilter={setFilter}
        searchText={searchText}
        setSearchText={setSearchText}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
      />

      {/* Map or List View */}
      {showMap ? (
        <View style={{ height: 600 }}>
          <QuestDiscoveryMap
            quests={quests}
            userLocation={userLocation || undefined}
            onQuestPress={(quest) => {
              const questWithStatus = quests.find(
                (q) => q.questId === quest.questId
              );
              if (questWithStatus) {
                openQuestDetails(questWithStatus);
              }
            }}
            selectedQuestId={undefined}
          />
        </View>
      ) : (
        <View style={{ paddingBottom: 20 }}>
          {quests.map((quest) => (
            <View
              key={quest.questId}
              style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            >
              <QuestCard
                quest={quest}
                onOpenDetails={openQuestDetails}
                onToggleQuest={toggleQuest}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
