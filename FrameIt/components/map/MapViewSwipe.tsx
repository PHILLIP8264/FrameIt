import React, { useRef, useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface MapViewSwipeProps {
  isMapView: boolean;
  onToggle: (isMapView: boolean) => void;
  disabled?: boolean;
}

export default function MapViewSwipe({
  isMapView,
  onToggle,
  disabled = false,
}: MapViewSwipeProps) {
  // Track and slider dimensions
  const trackWidth = 300;
  const sliderWidth = 120;
  const maxTranslation = trackWidth - sliderWidth - 4; // Account for 2px padding on each side

  // Animation values
  const sliderPosition = useRef(new Animated.Value(isMapView ? 1 : 0)).current;
  const dragPosition = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);

  // Animate to the correct position when isMapView changes
  useEffect(() => {
    if (!isDragging) {
      Animated.timing(sliderPosition, {
        toValue: isMapView ? 1 : 0,
        duration: 200, // Fast, smooth transition without bounce
        useNativeDriver: false,
      }).start();
    }
  }, [isMapView, sliderPosition, isDragging]);

  // Gesture handler for swipe with real-time layout updates
  const onGestureEvent = useCallback(
    Animated.event([{ nativeEvent: { translationX: dragPosition } }], {
      useNativeDriver: false,
      listener: (event: any) => {
        if (!isDragging || disabled) return;

        const { translationX } = event.nativeEvent;

        // Determine which view should be showing based on drag direction
        const dragThreshold = 40; // How far to drag before switching

        if (translationX > dragThreshold && !isMapView) {
          // Dragging right - switch to map view
          onToggle(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (translationX < -dragThreshold && isMapView) {
          // Dragging left - switch to card view
          onToggle(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    }),
    [dragPosition, isDragging, disabled, isMapView, onToggle]
  );

  const onHandlerStateChange = useCallback(
    (event: any) => {
      if (disabled) return;

      const { state } = event.nativeEvent;

      if (state === State.BEGAN) {
        setIsDragging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (
        state === State.END ||
        state === State.CANCELLED ||
        state === State.FAILED
      ) {
        setIsDragging(false);

        // Immediately reset drag position since layout already changed during gesture
        dragPosition.setValue(0);
      }
    },
    [disabled, dragPosition]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Swipe left for cards, right for map view
      </Text>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={!disabled}
      >
        <Animated.View
          style={[styles.toggleContainer, disabled && styles.disabled]}
        >
          {/* Background track */}
          <View style={styles.track}>
            {/* Left label (Cards) */}
            <View style={styles.labelContainer}>
              <Ionicons
                name="grid"
                size={16}
                color={!isMapView ? "#fff" : "#8E8E93"}
              />
              <Text
                style={[
                  styles.labelText,
                  { color: !isMapView ? "#fff" : "#8E8E93" },
                ]}
              >
                Cards
              </Text>
            </View>

            {/* Right label (Map) */}
            <View style={styles.labelContainer}>
              <Ionicons
                name="map"
                size={16}
                color={isMapView ? "#fff" : "#8E8E93"}
              />
              <Text
                style={[
                  styles.labelText,
                  { color: isMapView ? "#fff" : "#8E8E93" },
                ]}
              >
                Map
              </Text>
            </View>
          </View>

          {/* Animated slider */}
          <Animated.View
            style={[
              styles.slider,
              {
                transform: [
                  {
                    translateX: Animated.add(
                      sliderPosition.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, maxTranslation + 2], // Move from left edge to right edge
                      }),
                      dragPosition // Always use dragPosition, whether dragging or animating back
                    ),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sliderContent}>
              <Ionicons
                name={isMapView ? "map" : "grid"}
                size={18}
                color="#007AFF"
              />
            </View>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 8,
  },
  instructionText: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginBottom: 8,
    fontStyle: "italic",
    opacity: 0.8,
  },
  toggleContainer: {
    position: "relative",
    width: 300, // trackWidth
    height: 50,
    backgroundColor: "#E5E5EA",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  track: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  slider: {
    position: "absolute",
    width: 120, // sliderWidth
    height: 46,
    backgroundColor: "#fff",
    borderRadius: 23,
    top: 2,
    left: 0, // Start at 0 since transform will handle positioning
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  sliderContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
