import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { Quest } from "../../types/database";
import LocationService, {
  LocationCoords,
} from "../../services/LocationService";

interface QuestDiscoveryMapProps {
  quests: Quest[];
  userLocation?: LocationCoords;
  onQuestPress?: (quest: Quest) => void;
  selectedQuestId?: string;
}

export default function QuestDiscoveryMap({
  quests,
  userLocation,
  onQuestPress,
  selectedQuestId,
}: QuestDiscoveryMapProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(
    userLocation || null
  );
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (userLocation) {
      setCurrentLocation(userLocation);
      updateMapLocation(userLocation);
    }
  }, [userLocation]);

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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  const getMapCenter = () => {
    if (quests.length === 0) {
      return currentLocation || { latitude: 40.7128, longitude: -74.006 };
    }

    if (currentLocation) {
      return currentLocation;
    }

    // Calculate center of all quests
    const avgLat =
      quests.reduce((sum, quest) => sum + quest.coordinates.latitude, 0) /
      quests.length;
    const avgLng =
      quests.reduce((sum, quest) => sum + quest.coordinates.longitude, 0) /
      quests.length;

    return { latitude: avgLat, longitude: avgLng };
  };

  const mapCenter = getMapCenter();

  const generateQuestMarkers = () => {
    return quests
      .map((quest) => {
        const distance = currentLocation
          ? LocationService.calculateDistance(
              currentLocation,
              quest.coordinates
            )
          : null;

        return `
        const marker_${quest.questId.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )} = L.marker([${quest.coordinates.latitude}, ${
          quest.coordinates.longitude
        }], {
          icon: L.divIcon({
            html: '<div style="background-color: ${getDifficultyColor(
              quest.difficulty
            )}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); ${
          selectedQuestId === quest.questId
            ? "border-color: #FF6B35; border-width: 3px;"
            : ""
        }">${getCategoryIcon(quest.category)}</div>',
            className: 'quest-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        })
        .addTo(map)
        .bindPopup(\`
          <div style="text-align: center; font-family: Arial, sans-serif; min-width: 200px;">
            <strong>${quest.title}</strong><br>
            <em>${quest.category} - ${quest.difficulty}</em><br>
            📍 ${quest.location}<br>
            🏆 ${quest.xpReward || 0} XP<br>
            ${
              distance
                ? `📏 ${LocationService.formatDistance(distance)} away<br>`
                : ""
            }
            <button onclick="selectQuest('${
              quest.questId
            }')" style="background: #007AFF; color: white; border: none; padding: 8px 16px; border-radius: 5px; margin-top: 5px; cursor: pointer;">
              Select Quest
            </button>
          </div>
        \`)
        .on('click', function() {
          selectQuest('${quest.questId}');
        });
      `;
      })
      .join("\n");
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
        .quest-marker { cursor: pointer; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        const map = L.map('map').setView([${mapCenter.latitude}, ${
    mapCenter.longitude
  }], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Quest markers
        ${generateQuestMarkers()}

        // User location marker
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
            .bindPopup('<div style="text-align: center; font-family: Arial, sans-serif;"><strong>📍 Your Location</strong></div>');

          userCircle = L.circle([lat, lng], {
            color: '#007AFF',
            fillColor: '#007AFF',
            fillOpacity: 0.2,
            radius: 10
          }).addTo(map);
        }

        // Function to handle quest selection
        function selectQuest(questId) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'questSelected',
            questId: questId
          }));
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
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "questSelected" && onQuestPress) {
              const selectedQuest = quests.find(
                (q) => q.questId === data.questId
              );
              if (selectedQuest) {
                onQuestPress(selectedQuest);
              }
            }
          } catch (e) {
            console.error("Error handling message:", e);
          }
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

      {/* Map Info Overlay */}
      <View style={styles.mapInfo}>
        <View style={styles.infoPanel}>
          <Ionicons name="map" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            {quests.length} quest{quests.length !== 1 ? "s" : ""} nearby
          </Text>
        </View>

        {currentLocation && (
          <TouchableOpacity
            style={styles.locationButton}
            onLongPress={() => {
              // Re-center map on user location
              updateMapLocation(currentLocation);
            }}
          >
            <Ionicons name="locate" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
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
  mapInfo: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoPanel: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  locationButton: {
    backgroundColor: "white",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
