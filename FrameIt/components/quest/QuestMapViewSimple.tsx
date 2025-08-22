import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { Quest, QuestAttempt } from "../../types/database";

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface QuestMapViewProps {
  quest: Quest;
  attempt: QuestAttempt;
  userLocation: LocationCoords | null;
  isInQuestArea: boolean;
  distance: number;
  onOpenExternalMap: () => void;
}

export function QuestMapView({
  quest,
  attempt,
  userLocation,
  isInQuestArea,
  distance,
}: QuestMapViewProps) {
  const formatDistance = (distanceInMeters: number): string => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  };

  // HTML map using OpenStreetMap
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quest Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system; }
            #map { height: 100vh; width: 100vw; }
            .status { 
                position: absolute; 
                top: 10px; 
                left: 10px; 
                right: 10px; 
                background: white; 
                padding: 10px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                z-index: 1000; 
                text-align: center;
                font-weight: bold;
            }
            .in-area { background: #e8f5e8; color: #4caf50; border: 2px solid #4caf50; }
        </style>
    </head>
    <body>
        
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            function initMap() {
                try {
                    // Map center coordinates
                    const questLat = ${quest.coordinates.latitude};
                    const questLng = ${quest.coordinates.longitude};
                    const userLat = ${
                      userLocation?.latitude || quest.coordinates.latitude
                    };
                    const userLng = ${
                      userLocation?.longitude || quest.coordinates.longitude
                    };
                    
                    // Initialize map
                    const map = L.map('map').setView([userLat, userLng], 16);
                    
                    // Add tile layer
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap'
                    }).addTo(map);
                    
                    // Quest marker (blue)
                    const questIcon = L.divIcon({
                        html: '<div style="background:#007AFF;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
                        iconSize: [26, 26],
                        iconAnchor: [13, 13]
                    });
                    
                    L.marker([questLat, questLng], { icon: questIcon })
                        .addTo(map)
                        .bindPopup('${quest.title}<br>${quest.location}');
                    
                    // Quest area circle
                    L.circle([questLat, questLng], {
                        color: '#007AFF',
                        fillColor: '#007AFF',
                        fillOpacity: 0.1,
                        radius: ${quest.radius}
                    }).addTo(map);
                    
                    ${
                      userLocation
                        ? `
                    // User marker (green)
                    const userIcon = L.divIcon({
                        html: '<div style="background:#4CAF50;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(76,175,80,0.6);"></div>',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    });
                    
                    L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
                    
                    // Fit both markers
                    const group = L.featureGroup([
                        L.marker([questLat, questLng]),
                        L.marker([userLat, userLng])
                    ]);
                    map.fitBounds(group.getBounds().pad(0.1));
                    `
                        : ""
                    }
                    
                } catch (error) {
                    document.getElementById('map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;">Map loading failed</div>';
                }
            }
            
            // Initialize when page loads
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initMap);
            } else {
                initMap();
            }
        </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {userLocation ? (
        <WebView
          style={styles.map}
          source={{ html: mapHtml }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading map...</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Getting location...</Text>
        </View>
      )}
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});
