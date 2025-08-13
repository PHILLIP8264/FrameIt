import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { Quest } from "../types/database";
import LocationService, { LocationCoords } from "../services/LocationService";

interface QuestMapProps {
  quest: Quest;
  userLocation?: LocationCoords;
  onLocationUpdate?: (location: LocationCoords) => void;
}

export default function QuestMap({
  quest,
  userLocation,
  onLocationUpdate,
}: QuestMapProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(
    userLocation || null
  );
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [watchId, setWatchId] = useState<any>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    initializeLocation();
    return () => {
      if (watchId) {
        LocationService.clearWatch(watchId);
      }
    };
  }, []);

  const initializeLocation = async () => {
    try {
      const hasPermission = await LocationService.requestLocationPermission();
      if (hasPermission) {
        setIsLocationEnabled(true);
        const location = await LocationService.getCurrentLocation();
        setCurrentLocation(location);
        onLocationUpdate?.(location);

        // Start watching location changes
        const id = LocationService.watchLocation(
          (newLocation) => {
            setCurrentLocation(newLocation);
            onLocationUpdate?.(newLocation);
            updateMapLocation(newLocation);
          },
          (error) => {
            console.error("Location watch error:", error);
          }
        );
        setWatchId(id);
      }
    } catch (error: any) {
      console.error("Location initialization error:", error);
    }
  };

  const updateMapLocation = (location: LocationCoords) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "updateLocation",
          latitude: location.latitude,
          longitude: location.longitude,
        })
      );
    }
  };

  const refreshLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      setCurrentLocation(location);
      onLocationUpdate?.(location);
      updateMapLocation(location);
    } catch (error: any) {
      Alert.alert("Location Error", error.message);
    }
  };

  const isWithinQuestRadius = () => {
    if (!currentLocation) return false;
    return LocationService.isWithinQuestRadius(
      currentLocation,
      quest.coordinates,
      quest.radius || 50
    );
  };

  const getDistance = () => {
    if (!currentLocation) return null;
    return LocationService.calculateDistance(
      currentLocation,
      quest.coordinates
    );
  };

  const getDifficultyColor = () => {
    switch (quest.difficulty.toLowerCase()) {
      case "easy":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "hard":
        return "#F44336";
      default:
        return "#2196F3";
    }
  };

  const getCategoryIcon = () => {
    switch (quest.category.toLowerCase()) {
      case "architecture":
        return "🏛️";
      case "nature":
        return "🌿";
      case "street":
        return "🏙️";
      case "portrait":
        return "👤";
      case "landscape":
        return "🌄";
      case "urban":
        return "🌆";
      default:
        return "📸";
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .quest-popup { text-align: center; font-family: Arial, sans-serif; }
        .user-popup { text-align: center; font-family: Arial, sans-serif; color: #007AFF; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        const map = L.map('map').setView([${quest.coordinates.latitude}, ${
    quest.coordinates.longitude
  }], 16);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Quest marker
        const questIcon = L.divIcon({
          html: '<div style="background-color: ${getDifficultyColor()}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${getCategoryIcon()}</div>',
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const questMarker = L.marker([${quest.coordinates.latitude}, ${
    quest.coordinates.longitude
  }], {icon: questIcon})
          .addTo(map)
          .bindPopup('<div class="quest-popup"><strong>${
            quest.title
          }</strong><br>📍 ${quest.location}<br>🎯 ${quest.category} - ${
    quest.difficulty
  }</div>');

        // Quest radius circle
        const questCircle = L.circle([${quest.coordinates.latitude}, ${
    quest.coordinates.longitude
  }], {
          color: '#007AFF',
          fillColor: '#007AFF',
          fillOpacity: 0.1,
          radius: ${quest.radius || 50}
        }).addTo(map);

        // User location marker (will be updated)
        let userMarker = null;
        let userCircle = null;

        function updateUserLocation(lat, lng) {
          if (userMarker) {
            map.removeLayer(userMarker);
          }
          if (userCircle) {
            map.removeLayer(userCircle);
          }

          const userIcon = L.divIcon({
            html: '<div style="background-color: #007AFF; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            className: 'user-location-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          userMarker = L.marker([lat, lng], {icon: userIcon})
            .addTo(map)
            .bindPopup('<div class="user-popup"><strong>📍 Your Location</strong></div>');

          userCircle = L.circle([lat, lng], {
            color: '#007AFF',
            fillColor: '#007AFF',
            fillOpacity: 0.2,
            radius: 10
          }).addTo(map);

          // Fit bounds to show both user and quest
          const group = new L.featureGroup([questMarker, userMarker]);
          map.fitBounds(group.getBounds().pad(0.1));
        }

        // Initial user location if available
        ${
          currentLocation
            ? `updateUserLocation(${currentLocation.latitude}, ${currentLocation.longitude});`
            : ""
        }

        // Listen for messages from React Native
        window.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'updateLocation') {
              updateUserLocation(data.latitude, data.longitude);
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        });

        // For Android WebView
        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'updateLocation') {
              updateUserLocation(data.latitude, data.longitude);
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        });
      </script>
    </body>
    </html>
  `;

  const distance = getDistance();
  const withinRadius = isWithinQuestRadius();

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onMessage={(event) => {
          // Handle messages from WebView if needed
        }}
        onError={(error) => {
          console.error("WebView error:", error);
        }}
        onLoadEnd={() => {
          // Update location after map loads
          if (currentLocation) {
            updateMapLocation(currentLocation);
          }
        }}
      />

      {/* Location Info Overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.questInfo}>
          <Text style={styles.questTitle}>
            {getCategoryIcon()} {quest.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.questLocation}> {quest.location}</Text>
          </View>
          {distance && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="resize"
                size={12}
                color={withinRadius ? "#4CAF50" : "#666"}
              />
              <Text
                style={[
                  styles.distance,
                  { color: withinRadius ? "#4CAF50" : "#666", marginLeft: 4 },
                ]}
              >
                {LocationService.formatDistance(distance)} away
              </Text>
            </View>
          )}
          {withinRadius && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
              <Text style={[styles.withinRadius, { marginLeft: 4 }]}>
                You're within the quest area!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={refreshLocation}
          >
            <Ionicons name="locate" size={20} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() =>
              LocationService.openInMaps(quest.coordinates, quest.title)
            }
          >
            <Ionicons name="navigate" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quest Details Bottom Panel */}
      <View style={styles.questDetails}>
        <View style={styles.questHeader}>
          <Text style={styles.questCategory}>
            {getCategoryIcon()} {quest.category}
          </Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor() },
            ]}
          >
            <Text style={styles.difficultyText}>{quest.difficulty}</Text>
          </View>
        </View>

        <Text style={styles.questDescription} numberOfLines={2}>
          {quest.description}
        </Text>

        <View style={styles.questStats}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="trophy" size={12} color="#FFD700" />
            <Text style={[styles.questStat, { marginLeft: 4 }]}>
              {quest.xpReward || 0} XP
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="camera" size={12} color="#007AFF" />
            <Text style={[styles.questStat, { marginLeft: 4 }]}>
              Photography Quest
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location" size={12} color="#007AFF" />
            <Text style={[styles.questStat, { marginLeft: 4 }]}>
              {quest.radius || 50}m radius
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoOverlay: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  questInfo: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  questLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  distance: {
    fontSize: 14,
    fontWeight: "bold",
  },
  withinRadius: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: 5,
  },
  controls: {
    flexDirection: "column",
  },
  controlButton: {
    backgroundColor: "white",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questDetails: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  questCategory: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
  },
  questDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
  questStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  questStat: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
