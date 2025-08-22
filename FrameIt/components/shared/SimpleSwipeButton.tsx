import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

interface SimpleSwipeButtonProps {
  leftText: string;
  rightText: string;
  centerText?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  instructionText?: string;
}

export default function SimpleSwipeButton({
  leftText,
  rightText,
  centerText = "Swipe",
  onSwipeLeft,
  onSwipeRight,
  instructionText,
}: SimpleSwipeButtonProps) {
  // Animation value for the blob movement
  const translateX = useRef(new Animated.Value(0)).current;

  // Use a plain function for gesture event (Hermes compatible)
  const MAX_TRANSLATE = 120;
  const onGestureEvent = (event: any) => {
    if (event && event.nativeEvent) {
      // Clamp the translationX value
      const tx = event.nativeEvent.translationX;
      const clampedTx = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, tx));
      translateX.setValue(clampedTx);
    }
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX: tx } = event.nativeEvent;

      console.log("Simple swipe gesture:", tx);

      // Check swipe direction with a threshold
      if (tx > 50) {
        // Swipe right - animate to right then back
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 80,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 8,
          }),
        ]).start(() => {
          onSwipeRight();
        });
      } else if (tx < -50) {
        // Swipe left - animate to left then back
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -80,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 8,
          }),
        ]).start(() => {
          onSwipeLeft();
        });
      } else {
        // Return to center if swipe wasn't far enough
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }).start();
      }
    } else if (
      event.nativeEvent.state === State.CANCELLED ||
      event.nativeEvent.state === State.FAILED
    ) {
      // Return to center if gesture is cancelled
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      {instructionText && (
        <Text style={styles.instructionText}>{instructionText}</Text>
      )}

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <View style={styles.swipeArea}>
          <View style={styles.leftLabel}>
            <Text style={styles.labelText}>{leftText}</Text>
          </View>

          <Animated.View
            style={[
              styles.centerArea,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            <Text style={styles.centerText}>{centerText}</Text>
          </Animated.View>

          <View style={styles.rightLabel}>
            <Text style={styles.labelText}>{rightText}</Text>
          </View>
        </View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  instructionText: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginBottom: 12,
    fontStyle: "italic",
  },
  swipeArea: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E5E5EA",
    borderRadius: 30,
    height: 60,
    width: "100%",
    paddingHorizontal: 20,
  },
  leftLabel: {
    position: "absolute",
    left: 20,
    zIndex: 1,
  },
  rightLabel: {
    position: "absolute",
    right: 20,
    zIndex: 1,
  },
  centerArea: {
    position: "absolute",
    left: "50%",
    marginLeft: -22.5,
    width: 90,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  labelText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
  },
  centerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
