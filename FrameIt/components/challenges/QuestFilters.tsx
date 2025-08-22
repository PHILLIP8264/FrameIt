import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { challengesStyles as styles } from "../../styles";

interface FilterState {
  category?: string;
  difficulty?: string;
  sort: "distance" | "xp" | "difficulty" | "alphabetical";
  showCompleted: boolean;
  maxDistance?: number;
  minXp?: number;
  maxXp?: number;
}

interface QuestFiltersProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  searchText: string;
  setSearchText: (text: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
}

const QuestFilters: React.FC<QuestFiltersProps> = ({
  filter,
  setFilter,
  searchText,
  setSearchText,
  showAdvancedFilters,
  setShowAdvancedFilters,
}) => {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search quests..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          onLongPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={styles.filterButton}
        >
          <Ionicons
            name={showAdvancedFilters ? "options" : "filter"}
            size={20}
            color="#137CD8"
          />
        </TouchableOpacity>
      </View>

      {/* Quick Sort Options */}
      <View style={styles.quickFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: "distance", label: "Distance", icon: "location" },
            { key: "xp", label: "XP Reward", icon: "trophy" },
            { key: "difficulty", label: "Difficulty", icon: "fitness" },
            { key: "alphabetical", label: "A-Z", icon: "text" },
          ].map((sortOption) => (
            <TouchableOpacity
              key={sortOption.key}
              style={[
                styles.quickFilterButton,
                filter.sort === sortOption.key && styles.activeFilterButton,
              ]}
              onLongPress={() =>
                setFilter((prev) => ({
                  ...prev,
                  sort: sortOption.key as any,
                }))
              }
            >
              <Ionicons
                name={sortOption.icon as any}
                size={16}
                color={filter.sort === sortOption.key ? "#fff" : "#137CD8"}
              />
              <Text
                style={[
                  styles.quickFilterText,
                  filter.sort === sortOption.key && styles.activeFilterText,
                ]}
              >
                {sortOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <View style={styles.advancedFilters}>
          {/* Show Completed Toggle */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Show Completed</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                filter.showCompleted && styles.toggleActive,
              ]}
              onLongPress={() =>
                setFilter((prev) => ({
                  ...prev,
                  showCompleted: !prev.showCompleted,
                }))
              }
            >
              <Text
                style={[
                  styles.toggleText,
                  filter.showCompleted && styles.toggleTextActive,
                ]}
              >
                {filter.showCompleted ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Distance Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Max Distance (km)</Text>
            <View style={styles.distanceButtons}>
              {[1, 5, 10, 25].map((distance) => (
                <TouchableOpacity
                  key={distance}
                  style={[
                    styles.distanceButton,
                    filter.maxDistance === distance &&
                      styles.activeDistanceButton,
                  ]}
                  onLongPress={() =>
                    setFilter((prev) => ({
                      ...prev,
                      maxDistance:
                        prev.maxDistance === distance ? undefined : distance,
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.distanceButtonText,
                      filter.maxDistance === distance &&
                        styles.activeDistanceButtonText,
                    ]}
                  >
                    {distance}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* XP Range Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>XP Range</Text>
            <View style={styles.xpRangeContainer}>
              <TextInput
                style={styles.xpInput}
                placeholder="Min XP"
                value={filter.minXp?.toString() || ""}
                onChangeText={(text) =>
                  setFilter((prev) => ({
                    ...prev,
                    minXp: text ? parseInt(text) : undefined,
                  }))
                }
                keyboardType="numeric"
              />
              <Text style={styles.xpSeparator}>to</Text>
              <TextInput
                style={styles.xpInput}
                placeholder="Max XP"
                value={filter.maxXp?.toString() || ""}
                onChangeText={(text) =>
                  setFilter((prev) => ({
                    ...prev,
                    maxXp: text ? parseInt(text) : undefined,
                  }))
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Clear Filters */}
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onLongPress={() =>
              setFilter({
                sort: "distance",
                showCompleted: false,
              })
            }
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default QuestFilters;
