import { Stack } from "expo-router";
import { ImageBackground, StyleSheet } from "react-native";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
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
        />
      </ImageBackground>
    </AuthProvider>
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
