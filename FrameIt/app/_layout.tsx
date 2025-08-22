import { Stack } from "expo-router";
import { ImageBackground, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import NotificationService from "../services/NotificationService";

export default function RootLayout() {
  useEffect(() => {
    // Prepare the app
    async function prepare() {
      try {
        // Keep the splash screen visible while it fetch resources
        await SplashScreen.preventAutoHideAsync();

        // Initialize notification service
        await NotificationService.initialize();

        // Pre-load fonts, make any API calls here
        // Simulate some loading time
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ImageBackground
          source={require("../assets/images/blank.png")}
          style={styles.backgroundImage}
          imageStyle={styles.image}
        >
          <Stack
            initialRouteName="splash"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
            }}
          >
            <Stack.Screen
              name="splash"
              options={{
                animation: "none",
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                animation: "slide_from_left",
                animationTypeForReplace: "push",
                freezeOnBlur: true,
              }}
            />
            <Stack.Screen
              name="signup"
              options={{
                animation: "slide_from_left",
                animationTypeForReplace: "push",
                freezeOnBlur: true,
              }}
            />
          </Stack>
        </ImageBackground>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  image: {
    opacity: 1,
  },
});
