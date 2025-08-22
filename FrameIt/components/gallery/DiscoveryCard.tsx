import React, { useCallback } from "react";
import { Text, View, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SwipeableCard } from "./SwipeableCard";
import { galleryStyles as styles } from "../../styles";
import { Quest, Submission } from "../../types/database";

interface DiscoveryWithDetails extends Submission {
  id: string;
  quest?: Quest;
  questTitle: string;
  location: string;
  category: string;
  xp?: number;
  photoUrl: string;
}

interface DiscoveryCardProps {
  item: DiscoveryWithDetails;
  onLongPress: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

const formatTimestamp = (timestamp: any): string => {
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString();
  }
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString();
  }
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  return "Unknown date";
};

export const DiscoveryCard = React.memo(
  ({ item, onLongPress, onDelete, onShare }: DiscoveryCardProps) => {
    const handleLongPress = useCallback(() => {
      Alert.alert(
        "Photo Options",
        `What would you like to do with "${item.questTitle}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Share",
            onPress: () => onShare && onShare(),
            style: "default",
          },
          {
            text: "Delete",
            onPress: () => {
              Alert.alert(
                "Delete Photo",
                "Are you sure you want to delete this photo? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete && onDelete(),
                  },
                ]
              );
            },
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    }, [item.questTitle, onShare, onDelete]);

    return (
      <SwipeableCard
        onLongPress={handleLongPress}
        onSwipeLeft={() => {
          Alert.alert(
            "Delete Photo",
            "Are you sure you want to delete this photo?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => onDelete && onDelete(),
              },
            ]
          );
        }}
        onSwipeRight={() => onShare && onShare()}
        style={styles.discoveryCard}
      >
        <View style={styles.discoveryImageContainer}>
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.discoveryImage}
            resizeMode="cover"
          />

          {/*  Overlays */}
          <View style={styles.discoveryOverlay}>
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.xpText}>+{item.xp || 0}</Text>
            </View>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.discoveryGradient}
          />
        </View>

        {/*  Content */}
        <View style={styles.discoveryContent}>
          <Text style={styles.questTitle} numberOfLines={2}>
            {item.questTitle}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.discoveryFooter}>
            <Text style={styles.dateText}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
      </SwipeableCard>
    );
  }
);
