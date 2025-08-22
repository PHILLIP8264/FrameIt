import React, { useRef, useState } from "react";
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  Vibration,
  Text,
} from "react-native";
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

interface SwipeableCardProps {
  children: React.ReactNode;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: any;
}

export const SwipeableCard = ({
  children,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  style,
}: SwipeableCardProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const leftActionOpacity = useRef(new Animated.Value(0)).current;
  const rightActionOpacity = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef<number | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) < 10;
    },

    onPanResponderGrant: (evt, gestureState) => {
      longPressTimer.current = setTimeout(() => {
        if (!isLongPressing && Math.abs(gestureState.dx) < 20) {
          setIsLongPressing(true);
          hapticFeedback("heavy");

          Animated.sequence([
            Animated.spring(scaleAnim, {
              toValue: 1.05,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.spring(scaleAnim, {
              toValue: 0.95,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
          ]).start();

          onLongPress && onLongPress();
        }
      }, 500);

      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    },

    onPanResponderMove: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        setIsLongPressing(false);
      }

      if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
        translateX.setValue(gestureState.dx);

        if (gestureState.dx > 0) {
          rightActionOpacity.setValue(
            Math.min(Math.abs(gestureState.dx) / 100, 1)
          );
          leftActionOpacity.setValue(0);
        } else if (gestureState.dx < 0) {
          leftActionOpacity.setValue(
            Math.min(Math.abs(gestureState.dx) / 100, 1)
          );
          rightActionOpacity.setValue(0);
        }
      }
    },

    onPanResponderRelease: (evt, gestureState) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const swipeThreshold = 100;
      const velocityThreshold = 0.3;

      if (
        gestureState.dx > swipeThreshold ||
        (gestureState.dx > 50 && gestureState.vx > velocityThreshold)
      ) {
        hapticFeedback("medium");
        onSwipeRight && onSwipeRight();

        Animated.parallel([
          Animated.timing(translateX, {
            toValue: Dimensions.get("window").width,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          translateX.setValue(0);
          scaleAnim.setValue(1);
          rightActionOpacity.setValue(0);
        });
      } else if (
        gestureState.dx < -swipeThreshold ||
        (gestureState.dx < -50 && gestureState.vx < -velocityThreshold)
      ) {
        hapticFeedback("medium");
        onSwipeLeft && onSwipeLeft();

        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -Dimensions.get("window").width,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          translateX.setValue(0);
          scaleAnim.setValue(1);
          leftActionOpacity.setValue(0);
        });
      } else if (
        !isLongPressing &&
        Math.abs(gestureState.dx) < 20 &&
        Math.abs(gestureState.dy) < 20
      ) {
        onLongPress && onLongPress();
        hapticFeedback("light");
      }

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(leftActionOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightActionOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setIsLongPressing(false);
    },
  });

  return (
    <View style={style}>
      {/* Left Action Indicator (Delete) */}
      <Animated.View
        style={{
          position: "absolute",
          right: 20,
          top: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          opacity: leftActionOpacity,
          zIndex: 1,
        }}
      >
        <View
          style={{
            backgroundColor: "#D61A66",
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </View>
        <Text style={{ color: "#D61A66", fontWeight: "600", marginTop: 8 }}>
          Delete
        </Text>
      </Animated.View>

      {/* Right Action Indicator (Share) */}
      <Animated.View
        style={{
          position: "absolute",
          left: 20,
          top: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          opacity: rightActionOpacity,
          zIndex: 1,
        }}
      >
        <View
          style={{
            backgroundColor: "#137CD8",
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="share-outline" size={24} color="white" />
        </View>
        <Text style={{ color: "#137CD8", fontWeight: "600", marginTop: 8 }}>
          Share
        </Text>
      </Animated.View>

      {/* Card Content */}
      <Animated.View
        style={{
          transform: [{ translateX: translateX }, { scale: scaleAnim }],
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};
