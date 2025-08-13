import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { galleryStyles as styles } from "../../styles";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { Submission } from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");

interface DiscoveryWithDetails extends Submission {
  id: string;
  questTitle: string;
  location: string;
  category: string;
}

export default function Gallery() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [discoveries, setDiscoveries] = useState<DiscoveryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for user's submissions
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const submissionsQuery = query(
      collection(db, "submissions"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        const submissionsData = snapshot.docs.map((doc) => {
          const submission = doc.data() as Submission;
          return {
            ...submission,
            id: doc.id,
            questTitle: getQuestTitleFromId(submission.questId),
            location: getLocationFromCategory(submission.questId),
            category: getCategoryFromQuestId(submission.questId),
          } as DiscoveryWithDetails;
        });

        setDiscoveries(submissionsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching submissions:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Helper functions to get quest details (you can enhance these to fetch from quests collection)
  const getQuestTitleFromId = (questId: string) => {
    const questTitles: { [key: string]: string } = {
      quest1: "Urban Explorer",
      quest2: "Street Art Hunter",
      quest3: "Architecture Seeker",
      quest4: "Nature's Beauty",
      quest5: "Golden Hour Magic",
    };
    return questTitles[questId] || "Quest Discovery";
  };

  const getLocationFromCategory = (questId: string) => {
    const locations: { [key: string]: string } = {
      quest1: "Downtown",
      quest2: "Arts District",
      quest3: "Business District",
      quest4: "Riverside Park",
      quest5: "Various Locations",
    };
    return locations[questId] || "Unknown Location";
  };

  const getCategoryFromQuestId = (questId: string) => {
    const categories: { [key: string]: string } = {
      quest1: "urban",
      quest2: "creative",
      quest3: "architecture",
      quest4: "nature",
      quest5: "creative",
    };
    return categories[questId] || "urban";
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Loading your discoveries...
        </Text>
      </View>
    );
  }

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
    (sum, discovery) => sum + discovery.votes * 10, // Assuming 10 XP per vote as example
    0
  );

  const renderDiscovery = ({ item }: { item: DiscoveryWithDetails }) => (
    <TouchableOpacity style={styles.discoveryCard}>
      <Image source={{ uri: item.subUrl }} style={styles.discoveryImage} />
      <View style={styles.discoveryOverlay}>
        <View style={styles.xpBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.xpText}>{item.votes * 10}</Text>
        </View>
      </View>
      <View style={styles.discoveryInfo}>
        <Text style={styles.questTitle}>{item.questTitle}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.timestamp).toLocaleDateString()}
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
