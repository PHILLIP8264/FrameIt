import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

interface QuestLocationSwipeButtonProps {
  isInQuestArea: boolean;
  distance: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const formatDistance = (distanceInMeters: number) => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m away`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km away`;
  }
};

export default function QuestLocationSwipeButton({
  isInQuestArea,
  distance,
  onSwipeLeft,
  onSwipeRight,
}: QuestLocationSwipeButtonProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const MAX_TRANSLATE = 240;

  const onGestureEvent = (event: any) => {
    // Only allow gesture if in quest area
    if (!isInQuestArea) return;

    if (event && event.nativeEvent) {
      const tx = event.nativeEvent.translationX;
      const clampedTx = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, tx));
      translateX.setValue(clampedTx);
    }
  };

  const onHandlerStateChange = (event: any) => {
    // Only respond to gestures if in quest area
    if (!isInQuestArea) return;

    if (event.nativeEvent.state === State.END) {
      const { translationX: tx } = event.nativeEvent;

      if (tx > 50) {
        // Swipe right - Take Photo
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
        // Swipe left - Exit
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
      {/* Swipe Button */}
      <View style={styles.swipeButtonContainer}>
        <Text style={styles.instructionText}>
          {isInQuestArea
            ? "Swipe right to take photo, left to exit"
            : "Get closer to the quest location"}
        </Text>

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          enabled={isInQuestArea}
        >
          <View
            style={[
              styles.swipeArea,
              !isInQuestArea && styles.swipeAreaDisabled,
            ]}
          >
            {/* Left Label - only show when in quest area */}
            {isInQuestArea && <View style={styles.leftLabel}></View>}

            {/* Center Moving Area - starts on the left */}
            <Animated.View
              style={[
                styles.centerArea,
                isInQuestArea
                  ? styles.centerAreaActive
                  : styles.centerAreaDisabled,
                {
                  transform: [{ translateX }],
                },
              ]}
            >
              <Text
                style={[
                  styles.centerText,
                  !isInQuestArea && styles.centerTextDisabled,
                ]}
              >
                {isInQuestArea ? (
                  <Ionicons name="camera" size={22} color="white" />
                ) : (
                  formatDistance(distance)
                )}
              </Text>
            </Animated.View>

            {/* Right Label - only show when in quest area */}
            {isInQuestArea && (
              <View style={styles.rightLabel}>
                <Text style={styles.labelText}>Photo</Text>
              </View>
            )}
          </View>
        </PanGestureHandler>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  statusCardActive: {
    backgroundColor: "#E8F5E8",
    borderColor: "#4CAF50",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B35",
    marginLeft: 10,
  },
  statusTextActive: {
    color: "#4CAF50",
  },
  swipeButtonContainer: {
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
  swipeAreaDisabled: {
    backgroundColor: "#F5F5F5",
    opacity: 0.7,
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
    left: 5,
    top: 6,
    width: 90,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  centerAreaActive: {
    backgroundColor: "#4CAF50",
  },
  centerAreaDisabled: {
    backgroundColor: "#FF6B35",
  },
  labelText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
  },
  centerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  centerTextDisabled: {
    color: "white",
    fontSize: 12,
  },
});
