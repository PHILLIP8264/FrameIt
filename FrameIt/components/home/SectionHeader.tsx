import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { homeStyles } from "../../styles";

interface SectionHeaderProps {
  title: string;
  linkHref?: string;
  linkText?: string;
  onLongPress?: () => void;
}

export const SectionHeader = ({
  title,
  linkHref,
  linkText = "See All",
  onLongPress,
}: SectionHeaderProps) => {
  return (
    <View style={homeStyles.sectionHeader}>
      <Text style={homeStyles.sectionTitle}>{title}</Text>
      {linkHref ? (
        <Link href={linkHref as any} asChild>
          <TouchableOpacity>
            <Text style={homeStyles.seeAllButton}>{linkText}</Text>
          </TouchableOpacity>
        </Link>
      ) : onLongPress ? (
        <TouchableOpacity onLongPress={onLongPress}>
          <Text style={homeStyles.seeAllButton}>{linkText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
