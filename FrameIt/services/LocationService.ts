import * as Location from "expo-location";
import { Platform, Alert } from "react-native";

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class LocationService {
  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (err) {
      console.warn("Location permission error:", err);
      return false;
    }
  }

  // Get current user location
  async getCurrentLocation(): Promise<LocationCoords> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission not granted");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error: any) {
      console.error("Location error:", error);
      throw {
        code: 1,
        message: this.getLocationErrorMessage(1),
      } as LocationError;
    }
  }

  // Watch user location changes
  watchLocation(
    onLocationUpdate: (location: LocationCoords) => void,
    onError: (error: LocationError) => void
  ): { remove: () => void } {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          onError({
            code: 1,
            message: this.getLocationErrorMessage(1),
          });
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            onLocationUpdate({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy || undefined,
            });
          }
        );
      } catch (error) {
        onError({
          code: 2,
          message: this.getLocationErrorMessage(2),
        });
      }
    };

    startWatching();

    return {
      remove: () => {
        if (subscription) {
          subscription.remove();
        }
      },
    };
  }

  // Stop watching location (compatibility method)
  clearWatch(watchId: any): void {
    if (watchId && typeof watchId.remove === "function") {
      watchId.remove();
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(coord1: LocationCoords, coord2: LocationCoords): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(coord2.latitude - coord1.latitude);
    const dLon = this.deg2rad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coord1.latitude)) *
        Math.cos(this.deg2rad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  // Check if user is within quest radius
  isWithinQuestRadius(
    userLocation: LocationCoords,
    questLocation: LocationCoords,
    radiusMeters: number
  ): boolean {
    const distanceKm = this.calculateDistance(userLocation, questLocation);
    const distanceMeters = distanceKm * 1000;
    return distanceMeters <= radiusMeters;
  }

  // Get location error message
  private getLocationErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return "Location access denied. Please enable location permissions in settings.";
      case 2:
        return "Location unavailable. Please check your GPS settings.";
      case 3:
        return "Location request timed out. Please try again.";
      default:
        return "Unable to get your location. Please try again.";
    }
  }

  // Convert degrees to radians
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Format distance for display
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  }

  // Get direction text between two points
  getDirection(from: LocationCoords, to: LocationCoords): string {
    const dLat = to.latitude - from.latitude;
    const dLng = to.longitude - from.longitude;

    const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
    const normalizedAngle = (angle + 360) % 360;

    if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return "North";
    if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return "Northeast";
    if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return "East";
    if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return "Southeast";
    if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return "South";
    if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return "Southwest";
    if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return "West";
    if (normalizedAngle >= 292.5 && normalizedAngle < 337.5) return "Northwest";

    return "Unknown";
  }

  // Open location in external maps app
  openInMaps(location: LocationCoords, label?: string): void {
    const { latitude, longitude } = location;
    const url = Platform.select({
      ios: `maps://?q=${label || "Quest Location"}&ll=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${
        label || "Quest Location"
      })`,
    });

    if (url) {
      import("react-native").then(({ Linking }) => {
        Linking.openURL(url).catch(() => {
          Alert.alert("Error", "Could not open maps application");
        });
      });
    }
  }
}

export default new LocationService();
