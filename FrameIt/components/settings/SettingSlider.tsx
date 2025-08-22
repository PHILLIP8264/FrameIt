import React, { useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { settingsStyles } from "../../styles/settingsStyles";

interface SettingSliderProps {
  icon: string;
  label: string;
  value: string;
  onLongPress: () => void;
}

export const SettingSlider: React.FC<SettingSliderProps> = ({
  icon,
  label,
  value,
  onLongPress,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const blobTranslateX = useRef(new Animated.Value(0)).current;
  const blobScale = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        if (isDragging) {
          const maxTranslation = 80;
          const clampedTranslation = Math.max(
            0,
            Math.min(maxTranslation, event.nativeEvent.translationX)
          );
          blobTranslateX.setValue(clampedTranslation);

          // Scale the blob slightly as it moves
          const scaleValue = 1 + (clampedTranslation / maxTranslation) * 0.1;
          blobScale.setValue(scaleValue);
        }
      },
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
      // Subtle scale up when starting to drag
      Animated.spring(containerScale, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }).start();
    } else if (event.nativeEvent.state === State.END) {
      setIsDragging(false);
      const { translationX: tx, velocityX } = event.nativeEvent;

      if (tx > 50 || velocityX > 300) {
        // Trigger action with enhanced animation
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Animated.parallel([
          Animated.timing(blobTranslateX, {
            toValue: 100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(blobScale, {
            toValue: 1.2,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Reset animations
          Animated.parallel([
            Animated.spring(blobTranslateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }),
            Animated.spring(blobScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }),
            Animated.spring(containerScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }),
          ]).start();
          onLongPress();
        });
      } else {
        // Return to start with enhanced animation
        Animated.parallel([
          Animated.spring(blobTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }),
          Animated.spring(blobScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }),
          Animated.spring(containerScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }),
        ]).start();
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 12,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          settingsStyles.settingSlider,
          {
            transform: [{ translateX }, { scale: containerScale }],
          },
        ]}
      >
        <View style={settingsStyles.settingSliderContent}>
          <View style={settingsStyles.settingLeft}>
            <Ionicons name={icon as any} size={22} color="#137CD8" />
            <View style={settingsStyles.settingInfo}>
              <Text style={settingsStyles.settingLabel}>{label}</Text>
              <Text style={settingsStyles.settingValue}>{value}</Text>
            </View>
          </View>
          <View style={settingsStyles.slideHint}>
            <Text style={settingsStyles.slideHintText}>Slide to edit</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </View>

        {/* Sliding blob */}
        <Animated.View
          style={[
            settingsStyles.slideBlob,
            {
              transform: [{ translateX: blobTranslateX }, { scale: blobScale }],
            },
          ]}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};
