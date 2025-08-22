import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { aboutStyles } from "../../styles/aboutStyles";
import { TEAM_MEMBERS } from "../../constants/aboutData";

interface TeamMemberProps {
  member: (typeof TEAM_MEMBERS)[0];
}

export const TeamMemberCard: React.FC<TeamMemberProps> = ({ member }) => {
  return (
    <View style={aboutStyles.teamCard}>
      <View style={aboutStyles.avatarContainer}>
        <Ionicons name={member.avatar as any} size={24} color="#137CD8" />
      </View>
      <View style={aboutStyles.memberInfo}>
        <Text style={aboutStyles.memberName}>{member.name}</Text>
        <Text style={aboutStyles.memberRole}>{member.role}</Text>
        <Text style={aboutStyles.memberDescription}>{member.description}</Text>
      </View>
    </View>
  );
};
