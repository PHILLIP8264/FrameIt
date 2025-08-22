import { Platform } from "react-native";

// Platform-specific map imports
let MapView: any, Marker: any, Circle: any;

if (Platform.OS === "web") {
  // Use web-compatible components
  const WebMapComponents = require("../shared/WebMapView");
  MapView = WebMapComponents.WebMapView;
  Marker = WebMapComponents.WebMarker;
  Circle = WebMapComponents.WebCircle;
} else {
  // Use native map components for mobile
  const NativeMapComponents = require("react-native-maps");
  MapView = NativeMapComponents.default;
  Marker = NativeMapComponents.Marker;
  Circle = NativeMapComponents.Circle;
}

export { MapView, Marker, Circle };
export default MapView;
