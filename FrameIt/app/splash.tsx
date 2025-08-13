import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

export default function SplashPage() {
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Keep the splash screen visible while showing the GIF
    SplashScreen.preventAutoHideAsync();

    // Since GIFs don't have an "end" event, it will show it for a set duration
    const gifTimer = setTimeout(() => {
      // GIF splash screen finishing
      SplashScreen.hideAsync();
      // Navigate to login with card animation
      router.replace("/login");
    }, 1500); // Show GIF for 3 seconds

    // Fallback timer in case GIF doesn't load properly
    const fallbackTimer = setTimeout(() => {
      if (!isGifLoaded) {
        // GIF splash fallback triggered
        SplashScreen.hideAsync();
        router.replace("/login");
      }
    }, 5000); // 5 second fallback

    return () => {
      clearTimeout(gifTimer);
      clearTimeout(fallbackTimer);
    };
  }, [isGifLoaded]);

  const handleGifLoad = () => {
    setIsGifLoaded(true);
    SplashScreen.hideAsync();
  };

  const handleGifError = (error: any) => {
    console.error("GIF splash error:", error);
    setHasError(true);
    SplashScreen.hideAsync();
    router.replace("/login");
  };

  if (hasError) {
    return (
      <View style={styles.container}>
        <Text style={styles.brandText}>FrameIt</Text>
        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/frameit logo_2.gif")}
        style={styles.gif}
        onLoad={handleGifLoad}
        onError={handleGifError}
        contentFit="contain"
        transition={200}
      />
      {!isGifLoaded && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.brandText}>FrameIt</Text>
          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={styles.loader}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  gif: {
    width: "500%",
    aspectRatio: 1,
    maxWidth: 1000,
    maxHeight: 1000,
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007AFF",
  },
  brandText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  loader: {
    marginTop: 10,
  },
});
