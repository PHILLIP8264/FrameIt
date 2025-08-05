import { Stack } from "expo-router";
import { ImageBackground, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import SplashScreenComponent from "../components/SplashScreen";
import * as SplashScreen from "expo-splash-screen";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Prepare the app
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();

        // Pre-load fonts, make any API calls you need to do here
        // Simulate some loading time
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  const onSplashFinish = () => {
    setIsReady(true);
  };

  if (!isReady) {
    return <SplashScreenComponent onAnimationFinish={onSplashFinish} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ImageBackground
          source={require("../assets/images/blank.png")}
          style={styles.backgroundImage}
          imageStyle={styles.image}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
            }}
          >
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
                animation: "slide_from_right",
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
