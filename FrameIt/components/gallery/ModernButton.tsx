import React, { useRef } from "react";
import { Text, Pressable, Animated, Vibration } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Haptic feedback utility
const hapticFeedback = (type: "light" | "medium" | "heavy" = "light") => {
  try {
    if (type === "light") Vibration.vibrate(10);
    else if (type === "medium") Vibration.vibrate(20);
    else Vibration.vibrate(30);
  } catch (error) {
    // Fallback for platforms that don't support haptics
  }
};

interface ModernButtonProps {
  onLongPress: () => void;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "small" | "medium" | "large";
  icon?: keyof typeof Ionicons.glyphMap;
  style?: any;
}

export const ModernButton = ({
  onLongPress,
  children,
  variant = "primary",
  size = "medium",
  icon,
  style,
}: ModernButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    hapticFeedback("light");
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.94,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const variants = {
    primary: {
      backgroundColor: "#137CD8",
      color: "white",
      shadowColor: "#137CD8",
    },
    secondary: {
      backgroundColor: "#f8f9fa",
      color: "#333",
      shadowColor: "#000",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#137CD8",
      shadowColor: "transparent",
    },
  };

  const sizes = {
    small: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 12 },
    medium: { paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
    large: { paddingHorizontal: 20, paddingVertical: 12, fontSize: 16 },
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          }),
        },
        style,
      ]}
    >
      <Pressable
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: variants[variant].backgroundColor,
          ...sizes[size],
          borderRadius: 25,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: variants[variant].shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
        android_ripple={{
          color:
            variant === "primary"
              ? "rgba(255,255,255,0.3)"
              : "rgba(19, 124, 216, 0.1)",
          borderless: false,
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={sizes[size].fontSize}
            color={variants[variant].color}
            style={{ marginRight: children ? 8 : 0 }}
          />
        )}
        {children && (
          <Text
            style={{
              color: variants[variant].color,
              fontSize: sizes[size].fontSize,
              fontWeight: "600",
            }}
          >
            {children}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};
