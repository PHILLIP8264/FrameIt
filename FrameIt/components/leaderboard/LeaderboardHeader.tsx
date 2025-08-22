import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { leaderboardStyles as styles } from "../../styles";

interface LeaderboardHeaderProps {
  selectedPeriod: "globally" | "team" | "friends";
  onPeriodChange: (period: "globally" | "team" | "friends") => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showRefresh?: boolean;
}

export default function LeaderboardHeader({
  selectedPeriod,
  onPeriodChange,
  onRefresh,
  isRefreshing = false,
  showRefresh = false,
}: LeaderboardHeaderProps) {
  const periods = ["globally", "team", "friends"] as const;

  const getPeriodLabel = (period: (typeof periods)[number]) => {
    switch (period) {
      case "globally":
        return "Globally";
      case "team":
        return "Team";
      case "friends":
        return "Friends";
      default:
        return period;
    }
  };

  return (
    <View style={styles.headerControls}>
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activePeriodButton,
            ]}
            onLongPress={() => onPeriodChange(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText,
              ]}
            >
              {getPeriodLabel(period)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Refresh Button for Friends and Team */}
      {showRefresh && onRefresh && (
        <TouchableOpacity
          style={styles.refreshButton}
          onLongPress={onRefresh}
          disabled={isRefreshing}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={isRefreshing ? "#C7C7CC" : "#137CD8"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
