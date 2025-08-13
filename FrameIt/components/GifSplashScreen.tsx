import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";

interface GifSplashScreenProps {
  onFinish: () => void;
}

export default function GifSplashScreen({ onFinish }: GifSplashScreenProps) {
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    const gifTimer = setTimeout(() => {
      console.log("GIF splash screen finishing");
      SplashScreen.hideAsync();
      onFinish();
    }, 1500); // Show GIF for 5 seconds

    // Fallback timer in case GIF doesn't load properly
    const fallbackTimer = setTimeout(() => {
      if (!isGifLoaded) {
        console.log("GIF splash fallback triggered");
        SplashScreen.hideAsync();
        onFinish();
      }
    }, 5000); // 5 second fallback

    return () => {
      clearTimeout(gifTimer);
      clearTimeout(fallbackTimer);
    };
  }, [isGifLoaded, onFinish]);

  const handleGifLoad = () => {
    setIsGifLoaded(true);
    SplashScreen.hideAsync();
  };

  const handleGifError = (error: any) => {
    console.error("GIF splash error:", error);
    setHasError(true);
    SplashScreen.hideAsync();
    onFinish();
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
    width: "600%",
    aspectRatio: 1,
    maxWidth: 800,
    maxHeight: 800,
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
