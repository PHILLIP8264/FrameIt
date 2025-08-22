import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from "../../styles/commonStyles";

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  rightComponent,
  backgroundColor = colors.surface,
  titleColor = colors.text,
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onLongPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: titleColor + "80" }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56,
  },

  leftSection: {
    width: 40,
    alignItems: "flex-start",
  },

  centerSection: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },

  rightSection: {
    width: 40,
    alignItems: "flex-end",
  },

  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
  },

  title: {
    ...typography.h4,
    textAlign: "center",
  },

  subtitle: {
    ...typography.body2,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
