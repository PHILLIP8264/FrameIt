import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Web-compatible map component fallback
interface WebMapViewProps {
  style?: any;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChange?: (region: any) => void;
  children?: React.ReactNode;
}

export const WebMapView: React.FC<WebMapViewProps> = ({
  style,
  region,
  onRegionChange,
  children,
}) => {
  const googleMapsUrl = region
    ? `https://www.google.com/maps?q=${region.latitude},${region.longitude}&z=15`
    : "https://www.google.com/maps";

  return (
    <View style={[styles.webMapContainer, style]}>
      <View style={styles.webMapHeader}>
        <Ionicons name="map" size={24} color="#007AFF" />
        <Text style={styles.webMapTitle}>Map View</Text>
      </View>

      {region && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            📍 Lat: {region.latitude.toFixed(4)}, Lng:{" "}
            {region.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      <View style={styles.webMapContent}>
        <Ionicons name="location" size={48} color="#007AFF" />
        <Text style={styles.webMapText}>
          Interactive maps are not available on web.
        </Text>
        <Text style={styles.webMapSubtext}>
          Use the mobile app for full map functionality.
        </Text>

        {region && (
          <Text
            style={styles.webMapLink}
            onLongPress={() => window.open(googleMapsUrl, "_blank")}
          >
            🗺️ Open in Google Maps
          </Text>
        )}
      </View>

      {children}
    </View>
  );
};

export const WebMarker: React.FC<{
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  children?: React.ReactNode;
}> = ({ coordinate, title, description, children }) => {
  return (
    <View style={styles.webMarker}>
      <Ionicons name="location-sharp" size={16} color="#FF3B30" />
      {title && <Text style={styles.webMarkerTitle}>{title}</Text>}
      {description && <Text style={styles.webMarkerDesc}>{description}</Text>}
      {children}
    </View>
  );
};

export const WebCircle: React.FC<{
  center: { latitude: number; longitude: number };
  radius: number;
  fillColor?: string;
  strokeColor?: string;
}> = ({ center, radius, fillColor, strokeColor }) => {
  return (
    <View style={styles.webCircle}>
      <Text style={styles.webCircleText}>📍 Radius: {radius}m</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  webMapContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    overflow: "hidden",
  },
  webMapHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    gap: 8,
  },
  webMapTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  coordinatesContainer: {
    padding: 8,
    backgroundColor: "#E3F2FD",
  },
  coordinatesText: {
    fontSize: 12,
    color: "#1976D2",
    textAlign: "center",
  },
  webMapContent: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  webMapText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 12,
  },
  webMapSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  webMapLink: {
    fontSize: 14,
    color: "#007AFF",
    textAlign: "center",
    marginTop: 16,
    textDecorationLine: "underline",
    cursor: "pointer",
  },
  webMarker: {
    position: "absolute",
    alignItems: "center",
    backgroundColor: "white",
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
    top: 20,
    right: 20,
  },
  webMarkerTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
  },
  webMarkerDesc: {
    fontSize: 9,
    color: "#666",
  },
  webCircle: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  webCircleText: {
    fontSize: 10,
    color: "#007AFF",
  },
});
