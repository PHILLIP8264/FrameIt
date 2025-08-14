import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

interface SwipeButtonProps {
  leftText: string;
  rightText: string;
  centerText?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  disabled?: boolean;
  loading?: boolean;
  instructionText?: string;
}

export interface SwipeButtonRef {
  resetToCenter: () => void;
}

const SwipeButton = forwardRef<SwipeButtonRef, SwipeButtonProps>(
  (
    {
      leftText,
      rightText,
      centerText = "Swipe Me",
      onSwipeLeft,
      onSwipeRight,
      disabled = false,
      loading = false,
      instructionText,
    },
    ref
  ) => {
    // Animation values for swipe gesture - use useRef to avoid recreating
    const translateX = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const blobTranslateX = useRef(new Animated.Value(0)).current;
    const [isDragging, setIsDragging] = useState(false);
    const [containerWidth, setContainerWidth] = useState(300);

    // Gesture handler for swipe - use useCallback to prevent recreation
    const onGestureEvent = useCallback(
      Animated.event(
        [
          {
            nativeEvent: {
              translationX: translateX,
            },
          },
        ],
        {
          useNativeDriver: true,
          listener: (event: any) => {
            // Only update blob position if it is actively dragging
            if (isDragging && !disabled) {
              const maxTranslation = 100; // reduced to prevent clipping outside track
              const clampedTranslation = Math.max(
                -maxTranslation,
                Math.min(maxTranslation, event.nativeEvent.translationX)
              );
              // Use requestAnimationFrame to avoid scheduling updates during render
              requestAnimationFrame(() => {
                blobTranslateX.setValue(clampedTranslation);
              });
            }
          },
        }
      ),
      [isDragging, translateX, blobTranslateX, disabled]
    );

    const onHandlerStateChange = useCallback(
      (event: any) => {
        if (disabled) return;

        if (event.nativeEvent.state === State.BEGAN) {
          // Start dragging - enable blob movement
          setIsDragging(true);

          // subtle scale effect when starting to drag
          Animated.spring(buttonScale, {
            toValue: 1.02,
            useNativeDriver: true,
            tension: 150,
            friction: 8,
          }).start();
        } else if (event.nativeEvent.state === State.END) {
          // Stop dragging
          setIsDragging(false);

          const { translationX: tx, velocityX } = event.nativeEvent;

          // Determine if it's a significant swipe (reduced thresholds for better responsiveness)
          const swipeThreshold = 50;
          const velocityThreshold = 250;

          if (tx > swipeThreshold || velocityX > velocityThreshold) {
            // Swipe right
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Animate blob to right edge first, then execute action
            Animated.timing(blobTranslateX, {
              toValue: 90, // Reduced to stay within track bounds
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              // Reset blob to center after action
              Animated.spring(blobTranslateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 150,
                friction: 12,
              }).start();
              onSwipeRight();
            });

            Animated.spring(buttonScale, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          } else if (tx < -swipeThreshold || velocityX < -velocityThreshold) {
            // Swipe left
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Animate blob to left edge then back to center before executing action
            Animated.sequence([
              Animated.timing(blobTranslateX, {
                toValue: -90,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.spring(blobTranslateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 120,
                friction: 10,
              }),
            ]).start(() => {
              onSwipeLeft();
            });

            // Reset scale
            Animated.spring(buttonScale, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          } else {
            // Always return blob to center position when letting go without completing swipe
            Animated.spring(blobTranslateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }).start();

            // Reset main translation and scale
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }).start();

            Animated.spring(buttonScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }).start();
          }
        } else if (
          event.nativeEvent.state === State.CANCELLED ||
          event.nativeEvent.state === State.FAILED
        ) {
          // Stop dragging and return to center if gesture is cancelled or fails
          setIsDragging(false);

          Animated.spring(blobTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }).start();

          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }).start();

          Animated.spring(buttonScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }).start();
        }
      },
      [
        buttonScale,
        blobTranslateX,
        translateX,
        onSwipeLeft,
        onSwipeRight,
        disabled,
      ]
    );

    // Reset blob to center (can be called externally)
    const resetBlob = useCallback(() => {
      Animated.spring(blobTranslateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 12,
      }).start();
    }, [blobTranslateX]);

    // Expose reset function via ref
    useImperativeHandle(
      ref,
      () => ({
        resetToCenter: resetBlob,
      }),
      [resetBlob]
    );

    return (
      <View style={styles.container}>
        {instructionText && (
          <Text style={styles.instructionText}>{instructionText}</Text>
        )}

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          enabled={!disabled}
        >
          <Animated.View
            style={[
              styles.sliderContainer,
              (loading || disabled) && styles.sliderContainerDisabled,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            {/* Background track with labels */}
            <View style={styles.sliderTrack}>
              <View style={styles.trackLabel}>
                <Text style={styles.trackText}>{leftText}</Text>
              </View>
              <View style={styles.trackLabel}>
                <Text style={styles.trackText}>{rightText}</Text>
              </View>
            </View>

            {/* Moving blob/pill */}
            <Animated.View
              style={[
                styles.sliderBlob,
                (loading || disabled) && styles.sliderBlobDisabled,
                {
                  transform: [{ translateX: blobTranslateX }],
                },
              ]}
            >
              <View style={styles.blobTouchable}>
                <Text style={styles.blobText}>
                  {loading ? "..." : centerText}
                </Text>
              </View>
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }
);

export default SwipeButton;

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
    opacity: 0.8,
  },
  sliderContainer: {
    position: "relative",
    backgroundColor: "#E5E5EA",
    borderRadius: 30,
    height: 60,
    width: "99%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "center",
    overflow: "hidden",
  },
  sliderContainerDisabled: {
    opacity: 0.6,
  },
  sliderTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
  },
  trackLabel: {
    alignItems: "center",
  },
  trackText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
  },
  sliderBlob: {
    position: "absolute",
    width: 90,
    height: 48,
    backgroundColor: "#007AFF",
    borderRadius: 24,
    left: "50%",
    marginLeft: -45,
    top: 6,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderBlobDisabled: {
    backgroundColor: "#999",
  },
  blobTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  blobText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
