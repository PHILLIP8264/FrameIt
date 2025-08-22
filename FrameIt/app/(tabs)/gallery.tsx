import React from "react";
import {
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { galleryStyles as styles } from "../../styles";
import { useGalleryManagement } from "../../hooks/useGalleryManagement";
import {
  DiscoveryCard,
  GalleryFilters,
  GalleryStats,
  PhotoViewerModal,
} from "../../components/gallery";

export default function Gallery() {
  const {
    selectedFilter,
    sortBy,
    discoveries,
    loading,
    refreshing,
    showHint,
    photoViewer,
    stats,
    setSelectedFilter,
    setSortBy,
    getFilteredDiscoveries,
    deletePhoto,
    sharePhoto,
    onRefresh,
    openPhotoViewer,
    closePhotoViewer,
  } = useGalleryManagement();

  const renderDiscovery = ({ item }: { item: any }) => (
    <DiscoveryCard
      item={item}
      onLongPress={() => openPhotoViewer(item)}
      onShare={() => sharePhoto(item)}
      onDelete={() => deletePhoto(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <GalleryStats stats={stats} loading={true} />

          <View style={styles.gridContainer}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {Array(6)
                .fill({})
                .map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.skeletonCard,
                      { width: "48%", marginBottom: 16 },
                    ]}
                  >
                    <View style={styles.skeletonImage} />
                    <View style={styles.skeletonContent}>
                      <View
                        style={[styles.skeletonText, styles.skeletonTextLong]}
                      />
                      <View
                        style={[styles.skeletonText, styles.skeletonTextShort]}
                      />
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#137CD8"]}
            tintColor="#137CD8"
            style={styles.refreshControl}
          />
        }
      >
        {/* Stats */}
        <GalleryStats stats={stats} />

        {/* Filters & Sort */}
        <GalleryFilters
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Header with count */}
        {discoveries.length > 0 && (
          <View style={styles.gridHeader}>
            <Text style={styles.gridCount}>
              {getFilteredDiscoveries().length} photos
            </Text>
          </View>
        )}

        {/* Enhanced Gallery Grid */}
        <View style={styles.gridContainer}>
          {getFilteredDiscoveries().length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="camera-outline" size={48} color="#137CD8" />
              </View>
              <Text style={styles.emptyTitle}>No photos yet</Text>
              <Text style={styles.emptySubtitle}>
                Complete quests to capture amazing moments and build your
                gallery
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {getFilteredDiscoveries().map((item, index) => (
                <View key={item.id} style={{ width: "48%", marginBottom: 16 }}>
                  <DiscoveryCard
                    item={item}
                    onLongPress={() => openPhotoViewer(item)}
                    onShare={() => sharePhoto(item)}
                    onDelete={() => deletePhoto(item)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Gesture Hint Overlay */}
        {showHint && (
          <Animated.View style={styles.gestureHints}>
            <Text style={styles.gestureHintsTitle}>💡 Pro Tips</Text>
            <Text style={styles.gestureHintsText}>
              Tap photos to view • Long press for options{"\n"}
              Swipe right to share • Swipe left to delete{"\n"}
              Try different filters and sorting options
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Enhanced Photo Viewer Modal */}
      <PhotoViewerModal
        photoViewer={photoViewer}
        onClose={closePhotoViewer}
        onShare={sharePhoto}
      />
    </SafeAreaView>
  );
}
