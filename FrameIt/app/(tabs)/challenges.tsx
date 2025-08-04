import React, { useState } from "react";
import { Text, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { challengesStyles as styles } from "../../styles";

interface Quest {
  id: string;
  title: string;
  description: string;
  location: string;
  completed: boolean;
  createdAt: Date;
  xp: number;
  difficulty: "explorer" | "adventurer" | "master";
  category: "urban" | "nature" | "architecture" | "street" | "creative";
}

export default function Challenges() {
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: "1",
      title: "Urban Explorer",
      description: "Capture a street art mural in your neighborhood",
      location: "Within 2km of your location",
      completed: false,
      createdAt: new Date(),
      xp: 150,
      difficulty: "explorer",
      category: "urban",
    },
    {
      id: "2",
      title: "Golden Hour Hunter",
      description: "Find and photograph a sunset reflection in glass buildings",
      location: "Downtown area",
      completed: true,
      createdAt: new Date(),
      xp: 300,
      difficulty: "adventurer",
      category: "architecture",
    },
    {
      id: "3",
      title: "Shadow Master",
      description:
        "Create an artistic shadow composition using natural elements",
      location: "Any park or outdoor space",
      completed: false,
      createdAt: new Date(),
      xp: 500,
      difficulty: "master",
      category: "creative",
    },
    {
      id: "4",
      title: "Market Stories",
      description: "Document the life and energy of a local market",
      location: "Nearest farmer's market",
      completed: false,
      createdAt: new Date(),
      xp: 200,
      difficulty: "explorer",
      category: "street",
    },
    {
      id: "5",
      title: "Nature's Geometry",
      description: "Find geometric patterns in natural landscapes",
      location: "Nature reserve or botanical garden",
      completed: false,
      createdAt: new Date(),
      xp: 350,
      difficulty: "adventurer",
      category: "nature",
    },
  ]);

  const toggleQuest = (id: string) => {
    setQuests(
      quests.map((quest) =>
        quest.id === id ? { ...quest, completed: !quest.completed } : quest
      )
    );
  };

  const deleteQuest = (id: string) => {
    Alert.alert("Delete Quest", "Are you sure you want to delete this quest?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setQuests(quests.filter((quest) => quest.id !== id)),
      },
    ]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "explorer":
        return "#4CAF50";
      case "adventurer":
        return "#FF9800";
      case "master":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "urban":
        return "business-outline";
      case "nature":
        return "leaf-outline";
      case "architecture":
        return "library-outline";
      case "street":
        return "walk-outline";
      case "creative":
        return "color-palette-outline";
      default:
        return "camera-outline";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "explorer":
        return "walk-outline";
      case "adventurer":
        return "bicycle-outline";
      case "master":
        return "rocket-outline";
      default:
        return "star-outline";
    }
  };

  const renderQuest = ({ item }: { item: Quest }) => (
    <View style={styles.questCard}>
      <View style={styles.questHeader}>
        <View style={styles.questTitleRow}>
          <Ionicons
            name={getCategoryIcon(item.category) as any}
            size={24}
            color="#007AFF"
            style={styles.categoryIcon}
          />
          <Text style={styles.questTitle}>{item.title}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) },
            ]}
          >
            <Ionicons
              name={getDifficultyIcon(item.difficulty) as any}
              size={12}
              color="white"
            />
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.questDescription}>{item.description}</Text>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>

      <View style={styles.questFooter}>
        <View style={styles.xpContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.xpText}>{item.xp} XP</Text>
        </View>

        <View style={styles.questActions}>
          <TouchableOpacity
            style={[
              styles.questButton,
              item.completed ? styles.completedButton : styles.startButton,
            ]}
            onPress={() => toggleQuest(item.id)}
          >
            <Ionicons
              name={item.completed ? "checkmark-circle" : "play-circle-outline"}
              size={20}
              color="white"
            />
            <Text style={styles.buttonText}>
              {item.completed ? "Completed" : "Start Quest"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteQuest(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Calculate stats
  const completedCount = quests.filter((quest) => quest.completed).length;
  const totalCount = quests.length;
  const totalXP = quests
    .filter((quest) => quest.completed)
    .reduce((sum, quest) => sum + quest.xp, 0);

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total Quests</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalXP}</Text>
          <Text style={styles.statLabel}>XP Earned</Text>
        </View>
      </View>

      {/* Current Location Banner */}
      <View style={styles.locationBanner}>
        <Ionicons name="location" size={20} color="#007AFF" />
        <Text style={styles.locationBannerText}>
          🗺️ Quests available in your area
        </Text>
      </View>

      {/* Quest List */}
      <FlatList
        data={quests}
        renderItem={renderQuest}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}
