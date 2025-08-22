import React, { useState, useRef } from "react";
import { Text, View, TouchableOpacity, Switch, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { privacyStyles } from "../../styles/privacyStyles";

interface PrivacyToggleProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  color?: string;
  isRecommended?: boolean;
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  icon,
  title,
  description,
  value,
  onValueChange,
  color = "#137CD8",
  isRecommended = false,
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

          const scaleValue = 1 + (clampedTranslation / maxTranslation) * 0.1;
          blobScale.setValue(scaleValue);
        }
      },
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
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
          onValueChange(!value);

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
        });
      } else {
        // Return to start
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
          privacyStyles.privacyItem,
          isRecommended && privacyStyles.recommendedItem,
          {
            transform: [{ translateX }, { scale: containerScale }],
          },
        ]}
      >
        <View style={privacyStyles.privacyContent}>
          <View style={privacyStyles.privacyLeft}>
            <Ionicons name={icon as any} size={20} color={color} />
            <View style={privacyStyles.privacyInfo}>
              <View style={privacyStyles.titleRow}>
                <Text style={privacyStyles.privacyTitle}>{title}</Text>
                {isRecommended && (
                  <View style={privacyStyles.recommendedBadge}>
                    <Text style={privacyStyles.recommendedText}>
                      Recommended
                    </Text>
                  </View>
                )}
              </View>
              <Text style={privacyStyles.privacyDescription}>
                {description}
              </Text>
            </View>
          </View>
          <View style={privacyStyles.toggleContainer}>
            <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={{ false: "#E5E5EA", true: `${color}40` }}
              thumbColor={value ? color : "#FFFFFF"}
              ios_backgroundColor="#E5E5EA"
            />
          </View>
        </View>

        <Animated.View
          style={[
            privacyStyles.slideBlob,
            {
              backgroundColor: value ? color : "#E5E5EA",
              transform: [{ translateX: blobTranslateX }, { scale: blobScale }],
            },
          ]}
        >
          <Ionicons
            name={value ? "shield-checkmark" : "shield-outline"}
            size={20}
            color="#fff"
          />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};
