import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { contestStyles as styles } from "../../styles";

interface ContestTabsProps {
  selectedTab: "global" | "team";
  onTabSelect: (tab: "global" | "team") => void;
  userTeamId: string | null;
}

const ContestTabs: React.FC<ContestTabsProps> = ({
  selectedTab,
  onTabSelect,
  userTeamId,
}) => {
  return (
    <View style={styles.tabSelector}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTab === "global" && styles.activeTabButton,
        ]}
        onLongPress={() => onTabSelect("global")}
      >
        <Ionicons
          name="globe-outline"
          size={20}
          color={selectedTab === "global" ? "#137CD8" : "#666"}
        />
        <Text
          style={[
            styles.tabButtonText,
            selectedTab === "global" && styles.activeTabButtonText,
          ]}
        >
          Global Contest
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTab === "team" && styles.activeTabButton,
        ]}
        onLongPress={() => onTabSelect("team")}
        disabled={!userTeamId}
      >
        <Ionicons
          name="people-outline"
          size={20}
          color={selectedTab === "team" ? "#137CD8" : "#666"}
        />
        <Text
          style={[
            styles.tabButtonText,
            selectedTab === "team" && styles.activeTabButtonText,
            !userTeamId && styles.disabledTabText,
          ]}
        >
          Team Contest {!userTeamId && "(Join a team)"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContestTabs;
