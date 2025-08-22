const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add web-specific resolver configurations
config.resolver.platforms = ["web", "ios", "android", "native"];

// Provide platform-specific resolutions for react-native-maps
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // Fallback for react-native-maps on web
  "react-native-maps": require.resolve(
    "./components/shared/PlatformMapView.tsx"
  ),
};

// Configure platform extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "web.js",
  "web.ts",
  "web.tsx",
];

module.exports = config;
