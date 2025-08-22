import React from "react";
import { Text, View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { galleryStyles as styles } from "../../styles";

interface Filter {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface GalleryFiltersProps {
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
  sortBy: "recent" | "xp";
  onSortChange: (sort: "recent" | "xp") => void;
}

const filters: Filter[] = [
  { id: "all", name: "All", icon: "grid-outline" },
  { id: "urban", name: "Urban", icon: "business-outline" },
  { id: "nature", name: "Nature", icon: "leaf-outline" },
  { id: "historical", name: "History", icon: "library-outline" },
  { id: "adventure", name: "Adventure", icon: "flash-outline" },
];

const sortOptions = [
  {
    id: "recent",
    name: "Recent",
    icon: "time-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "xp",
    name: "XP",
    icon: "star-outline" as keyof typeof Ionicons.glyphMap,
  },
];

export const GalleryFilters = ({
  selectedFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}: GalleryFiltersProps) => {
  return (
    <View style={styles.filtersContainer}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScrollView}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          return (
            <Pressable
              key={filter.id}
              onLongPress={() => onFilterChange(filter.id)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={isSelected ? "#fff" : "#333"}
                style={styles.filterChipIcon}
              />
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {filter.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {sortOptions.map((sort) => {
          const isSelected = sortBy === sort.id;
          return (
            <Pressable
              key={sort.id}
              onLongPress={() => onSortChange(sort.id as "recent" | "xp")}
              style={[styles.sortOption, isSelected && styles.sortOptionActive]}
            >
              <Ionicons
                name={sort.icon}
                size={16}
                color={isSelected ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  isSelected && styles.sortOptionTextActive,
                ]}
              >
                {sort.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
