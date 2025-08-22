import React, { useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { aboutStyles } from "../../styles/aboutStyles";

interface InfoCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onLongPress?: () => void;
  color?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  subtitle,
  onLongPress,
  color = "#137CD8",
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
        if (isDragging && onLongPress) {
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
    if (!onLongPress) return;

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

  const CardContent = (
    <View style={aboutStyles.infoCard}>
      <View style={aboutStyles.cardContent}>
        <View style={aboutStyles.cardLeft}>
          <Ionicons name={icon as any} size={20} color={color} />
          <View style={aboutStyles.cardInfo}>
            <Text style={aboutStyles.cardTitle}>{title}</Text>
            <Text style={aboutStyles.cardSubtitle}>{subtitle}</Text>
          </View>
        </View>
        {onLongPress && (
          <View style={aboutStyles.slideHint}>
            <Text style={aboutStyles.slideHintText}>Slide to open</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </View>
        )}
      </View>

      {onLongPress && (
        <Animated.View
          style={[
            aboutStyles.slideBlob,
            {
              backgroundColor: color,
              transform: [{ translateX: blobTranslateX }, { scale: blobScale }],
            },
          ]}
        >
          <Ionicons name="open-outline" size={20} color="#fff" />
        </Animated.View>
      )}
    </View>
  );

  if (onLongPress) {
    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            {
              transform: [{ scale: containerScale }],
            },
          ]}
        >
          {CardContent}
        </Animated.View>
      </PanGestureHandler>
    );
  }

  return CardContent;
};
