import React from "react";
import { View, Text } from "react-native";
import { contestStyles as styles } from "../../styles";
import ContestTimer from "./ContestTimer";

interface ContestHeaderProps {
  contestStatus: string;
  isVotingActive: boolean;
}

const ContestHeader: React.FC<ContestHeaderProps> = ({
  contestStatus,
  isVotingActive,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Daily Photo Contest</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
      <ContestTimer contestStatus={contestStatus} isActive={isVotingActive} />
    </View>
  );
};

export default ContestHeader;
