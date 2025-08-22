import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../../styles/commonStyles";

interface StandardButtonProps {
  title: string;
  onLongPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const StandardButton: React.FC<StandardButtonProps> = ({
  title,
  onLongPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];

    // Size styles
    switch (size) {
      case "small":
        baseStyle.push(styles.smallButton as ViewStyle);
        break;
      case "large":
        baseStyle.push(styles.largeButton as ViewStyle);
        break;
      default:
        baseStyle.push(styles.mediumButton as ViewStyle);
    }

    // Variant styles
    switch (variant) {
      case "secondary":
        baseStyle.push(styles.secondaryButton as ViewStyle);
        break;
      case "danger":
        baseStyle.push(styles.dangerButton as ViewStyle);
        break;
      case "success":
        baseStyle.push(styles.successButton as ViewStyle);
        break;
      default:
        baseStyle.push(styles.primaryButton as ViewStyle);
    }

    // State styles
    if (disabled || loading) {
      baseStyle.push(styles.disabledButton as ViewStyle);
    }

    if (fullWidth) {
      baseStyle.push(styles.fullWidth as ViewStyle);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.buttonText];

    // Size text styles
    switch (size) {
      case "small":
        baseStyle.push(styles.smallButtonText as TextStyle);
        break;
      case "large":
        baseStyle.push(styles.largeButtonText as TextStyle);
        break;
      default:
        baseStyle.push(styles.mediumButtonText as TextStyle);
    }

    // Variant text styles
    switch (variant) {
      case "secondary":
        baseStyle.push(styles.secondaryButtonText as TextStyle);
        break;
      case "danger":
        baseStyle.push(styles.dangerButtonText as TextStyle);
        break;
      case "success":
        baseStyle.push(styles.successButtonText as TextStyle);
        break;
      default:
        baseStyle.push(styles.primaryButtonText as TextStyle);
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabledButtonText as TextStyle);
    }

    return baseStyle;
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "large":
        return 24;
      default:
        return 20;
    }
  };

  const getIconColor = () => {
    if (disabled || loading) return colors.textDisabled;

    switch (variant) {
      case "secondary":
        return colors.primary;
      case "danger":
        return colors.surface;
      case "success":
        return colors.surface;
      default:
        return colors.surface;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === "small" ? "small" : "small"}
          color={getIconColor()}
        />
      );
    }

    return (
      <>
        {icon && iconPosition === "left" && (
          <Ionicons
            name={icon}
            size={getIconSize()}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        {icon && iconPosition === "right" && (
          <Ionicons
            name={icon}
            size={getIconSize()}
            color={getIconColor()}
            style={styles.rightIcon}
          />
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onLongPress={onLongPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.round,
    marginBottom: spacing.lg,
  },

  // Size styles
  smallButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },

  mediumButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    ...shadows.medium,
  },

  largeButton: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    ...shadows.large,
  },

  // Variant styles
  primaryButton: {
    backgroundColor: colors.primary,
  },

  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  dangerButton: {
    backgroundColor: colors.error,
  },

  successButton: {
    backgroundColor: colors.success,
  },

  disabledButton: {
    backgroundColor: colors.textDisabled,
    borderColor: colors.textDisabled,
  },

  fullWidth: {
    width: "100%",
  },

  // Text styles
  buttonText: {
    textAlign: "center",
  },

  smallButtonText: {
    ...typography.buttonSmall,
  },

  mediumButtonText: {
    ...typography.button,
  },

  largeButtonText: {
    ...typography.button,
    fontSize: 18,
  },

  primaryButtonText: {
    color: colors.surface,
  },

  secondaryButtonText: {
    color: colors.primary,
  },

  dangerButtonText: {
    color: colors.surface,
  },

  successButtonText: {
    color: colors.surface,
  },

  disabledButtonText: {
    color: colors.surface,
  },

  // Icon styles
  leftIcon: {
    marginRight: spacing.sm,
  },

  rightIcon: {
    marginLeft: spacing.sm,
  },
});
