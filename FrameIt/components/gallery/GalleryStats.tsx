import React from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { galleryStyles as styles } from "../../styles";

interface StatsData {
  totalDiscoveries: number;
  totalXP: number;
  uniqueLocations: number;
  thisMonthCount: number;
}

interface GalleryStatsProps {
  stats: StatsData;
  loading?: boolean;
}

export const GalleryStats = ({ stats, loading }: GalleryStatsProps) => {
  if (loading) {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ActivityIndicator size="small" color="#137CD8" />
          <Text style={styles.statLabel}>Loading</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.totalDiscoveries}</Text>
        <Text style={styles.statLabel}>Photos</Text>
      </View>
      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: "#ffc107" }]}>
          {stats.totalXP}
        </Text>
        <Text style={styles.statLabel}>XP Earned</Text>
      </View>
      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: "#28a745" }]}>
          {stats.uniqueLocations}
        </Text>
        <Text style={styles.statLabel}>Locations</Text>
      </View>
      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: "#D61A66" }]}>
          {stats.thisMonthCount}
        </Text>
        <Text style={styles.statLabel}>This Month</Text>
      </View>
    </View>
  );
};
