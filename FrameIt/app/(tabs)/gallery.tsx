import React, { useState } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { galleryStyles as styles } from "../../styles";

const { width } = Dimensions.get("window");

interface Discovery {
  id: string;
  imageUri: string;
  questTitle: string;
  location: string;
  xpEarned: number;
  dateDiscovered: Date;
  category: "urban" | "nature" | "architecture" | "street" | "creative";
}

export default function Gallery() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const discoveries: Discovery[] = [
    {
      id: "1",
      imageUri: "https://picsum.photos/400/400?random=1",
      questTitle: "Urban Explorer",
      location: "Downtown Arts District",
      xpEarned: 150,
      dateDiscovered: new Date(2025, 7, 3),
      category: "urban",
    },
    {
      id: "2",
      imageUri: "https://picsum.photos/400/400?random=2",
      questTitle: "Golden Hour Hunter",
      location: "Riverside Bridge",
      xpEarned: 300,
      dateDiscovered: new Date(2025, 7, 2),
      category: "architecture",
    },
    {
      id: "3",
      imageUri: "https://picsum.photos/400/400?random=3",
      questTitle: "Nature's Geometry",
      location: "Central Botanical Garden",
      xpEarned: 350,
      dateDiscovered: new Date(2025, 7, 1),
      category: "nature",
    },
    {
      id: "4",
      imageUri: "https://picsum.photos/400/400?random=4",
      questTitle: "Market Stories",
      location: "Saturday Farmer's Market",
      xpEarned: 200,
      dateDiscovered: new Date(2025, 6, 30),
      category: "street",
    },
    {
      id: "5",
      imageUri: "https://picsum.photos/400/400?random=5",
      questTitle: "Shadow Master",
      location: "City Park",
      xpEarned: 500,
      dateDiscovered: new Date(2025, 6, 29),
      category: "creative",
    },
    {
      id: "6",
      imageUri: "https://picsum.photos/400/400?random=6",
      questTitle: "Street Reflections",
      location: "Shopping Mall",
      xpEarned: 180,
      dateDiscovered: new Date(2025, 6, 28),
      category: "urban",
    },
  ];

  const filters = [
    { key: "all", label: "All", icon: "grid-outline" },
    { key: "urban", label: "Urban", icon: "business-outline" },
    { key: "nature", label: "Nature", icon: "leaf-outline" },
    { key: "architecture", label: "Buildings", icon: "library-outline" },
    { key: "street", label: "Street", icon: "walk-outline" },
    { key: "creative", label: "Creative", icon: "color-palette-outline" },
  ];

  const filteredDiscoveries =
    selectedFilter === "all"
      ? discoveries
      : discoveries.filter((d) => d.category === selectedFilter);

  const totalXP = discoveries.reduce(
    (sum, discovery) => sum + discovery.xpEarned,
    0
  );

  const renderDiscovery = ({ item }: { item: Discovery }) => (
    <TouchableOpacity style={styles.discoveryCard}>
      <Image source={{ uri: item.imageUri }} style={styles.discoveryImage} />
      <View style={styles.discoveryOverlay}>
        <View style={styles.xpBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.xpText}>{item.xpEarned}</Text>
        </View>
      </View>
      <View style={styles.discoveryInfo}>
        <Text style={styles.questTitle}>{item.questTitle}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <Text style={styles.dateText}>
          {item.dateDiscovered.toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilter = ({ item }: { item: (typeof filters)[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.key && styles.activeFilterButton,
      ]}
      onPress={() => setSelectedFilter(item.key)}
    >
      <Ionicons
        name={item.icon as any}
        size={16}
        color={selectedFilter === item.key ? "white" : "#007AFF"}
      />
      <Text
        style={[
          styles.filterText,
          selectedFilter === item.key && styles.activeFilterText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{discoveries.length}</Text>
          <Text style={styles.statLabel}>Discoveries</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalXP.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {new Set(discoveries.map((d) => d.location)).size}
          </Text>
          <Text style={styles.statLabel}>Locations</Text>
        </View>
      </View>

      {/* Filters */}
      <FlatList
        data={filters}
        renderItem={renderFilter}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterList}
      />

      {/* Discoveries Grid */}
      <FlatList
        data={filteredDiscoveries}
        renderItem={renderDiscovery}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
      />

      {/* Empty State */}
      {filteredDiscoveries.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="camera-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No Discoveries Yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete quests to fill your discovery gallery!
          </Text>
        </View>
      )}
    </View>
  );
}
