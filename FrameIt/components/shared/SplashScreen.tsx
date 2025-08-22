import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface SplashScreenComponentProps {
  onAnimationFinish: () => void;
}

export default function SplashScreenComponent({
  onAnimationFinish,
}: SplashScreenComponentProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [titleFadeAnim] = useState(new Animated.Value(0));
  const [subtitleFadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Keep the native splash screen visible
    SplashScreen.preventAutoHideAsync();

    // Start animations
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Title animation
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }).start(() => {
        // Subtitle animation
        Animated.timing(subtitleFadeAnim, {
          toValue: 1,
          duration: 600,
          delay: 100,
          useNativeDriver: true,
        }).start(() => {
          // Wait a bit then finish
          setTimeout(() => {
            SplashScreen.hideAsync();
            onAnimationFinish();
          }, 1000);
        });
      });
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />

      {/* Background Gradient Effect */}
      <View style={styles.backgroundGradient} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo/Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconBackground}>
            <Ionicons name="camera" size={80} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* App Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleFadeAnim,
            },
          ]}
        >
          <Text style={styles.title}>FrameIt</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={[
            styles.subtitleContainer,
            {
              opacity: subtitleFadeAnim,
            },
          ]}
        >
          <Text style={styles.subtitle}>Capture • Create • Share</Text>
        </Animated.View>
      </View>

      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <View style={styles.decorativeLine} />
      </View>
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
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#007AFF",
    opacity: 0.9,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logoContainer: {
    marginBottom: 30,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleContainer: {
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: "300",
  },
  bottomDecoration: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
  },
});
