import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import AuthGuard from "../../components/AuthGuard";
import { useAuth } from "../../contexts/AuthContext";

function ProfileButton() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TouchableOpacity
      style={styles.profileButton}
      onPress={() => router.push("/profile")}
    >
      <View style={styles.profileAvatar}>
        <Text style={styles.profileAvatarText}>{initials}</Text>
      </View>
    </TouchableOpacity>
  );
}

function CustomHeader({ title }: { title: string }) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      <ProfileButton />
    </View>
  );
}

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#007AFF",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          },
          sceneStyle: { backgroundColor: "transparent" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="compass-outline" size={size} color={color} />
            ),
            header: () => <CustomHeader title="🗺️ FrameIt Explorer" />,
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="challenges"
          options={{
            title: "Quests",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" size={size} color={color} />
            ),
            header: () => <CustomHeader title="🎯 Active Quests" />,
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="gallery"
          options={{
            title: "Discoveries",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="camera-outline" size={size} color={color} />
            ),
            header: () => <CustomHeader title="📸 Your Discoveries" />,
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: "Rankings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy-outline" size={size} color={color} />
            ),
            header: () => <CustomHeader title="🏆 Explorer Rankings" />,
            headerShown: true,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileAvatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
});
