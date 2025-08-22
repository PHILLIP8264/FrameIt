import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { aboutStyles } from "../../styles/aboutStyles";
import { FEATURES } from "../../constants/aboutData";

interface FeatureCardProps {
  feature: (typeof FEATURES)[0];
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  return (
    <View style={aboutStyles.featureCard}>
      <View
        style={[
          aboutStyles.featureIcon,
          { backgroundColor: `${feature.color}20` },
        ]}
      >
        <Ionicons name={feature.icon as any} size={24} color={feature.color} />
      </View>
      <View style={aboutStyles.featureInfo}>
        <Text style={aboutStyles.featureTitle}>{feature.title}</Text>
        <Text style={aboutStyles.featureDescription}>
          {feature.description}
        </Text>
      </View>
    </View>
  );
};
