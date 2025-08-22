import React, { useState, useRef } from "react";
import { Text, View, TouchableOpacity, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { helpStyles } from "../../styles/helpStyles";
import { supportCategories } from "../../constants/helpData";

interface SupportCardProps {
  category: (typeof supportCategories)[0];
  onLongPress: () => void;
}

export const SupportCard: React.FC<SupportCardProps> = ({
  category,
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

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          helpStyles.supportCard,
          {
            transform: [{ translateX }, { scale: containerScale }],
          },
        ]}
      >
        <View style={helpStyles.cardContent}>
          <View style={helpStyles.cardLeft}>
            <Ionicons
              name={category.icon as any}
              size={20}
              color={category.color}
            />
            <View style={helpStyles.cardInfo}>
              <Text style={helpStyles.cardTitle}>{category.title}</Text>
              <Text style={helpStyles.cardDescription}>
                {category.description}
              </Text>
            </View>
          </View>
          <View style={helpStyles.slideHint}>
            <Text style={helpStyles.slideHintText}>Slide to explore</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </View>
        </View>

        {/* Sliding blob */}
        <Animated.View
          style={[
            helpStyles.slideBlob,
            {
              backgroundColor: category.color,
              transform: [{ translateX: blobTranslateX }, { scale: blobScale }],
            },
          ]}
        >
          <Ionicons name="help-circle" size={20} color="#fff" />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};
