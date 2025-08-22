import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: screenWidth } = Dimensions.get("window");

interface SwipeableCardProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  onSwipeRight: () => void;
  children?: React.ReactNode;
  swipeText?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  onSwipeRight,
  children,
  swipeText = "Swipe right to open",
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
          const progress = Math.min(gestureState.dx / (screenWidth * 0.3), 1);
          opacity.setValue(progress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > screenWidth * 0.25) {
          // Trigger swipe action
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSwipeRight();
        }

        // Reset position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 8,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${iconColor}20` },
              ]}
            >
              <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
          {children}
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.swipeIndicator,
          {
            opacity,
          },
        ]}
      >
        <Ionicons name="arrow-forward" size={24} color={iconColor} />
        <Text style={[styles.swipeText, { color: iconColor }]}>
          {swipeText}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#D61A66",
  },
  swipeIndicator: {
    position: "absolute",
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  swipeText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SwipeableCard;
