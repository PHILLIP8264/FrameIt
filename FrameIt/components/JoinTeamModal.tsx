import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FirestoreService from "../services/FirestoreService";
import { useAuth } from "../contexts/AuthContext";

interface JoinTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onTeamJoined?: () => void; // Callback when user successfully joins a team
}

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({
  visible,
  onClose,
  onTeamJoined,
}) => {
  const { user } = useAuth();
  const [teamCode, setTeamCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinTeam = async () => {
    if (!user || !teamCode.trim()) {
      Alert.alert("Error", "Please enter a team code");
      return;
    }

    setLoading(true);
    try {
      await FirestoreService.joinTeamByCode(
        user.uid,
        teamCode.trim().toUpperCase()
      );

      Alert.alert("Success", "You have successfully joined the team!", [
        {
          text: "OK",
          onPress: () => {
            setTeamCode("");
            onTeamJoined?.(); // Notify parent component
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error joining team:", error);
      Alert.alert("Error", error.message || "Failed to join team");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTeamCode("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
    >
      <ImageBackground
        source={require("../assets/images/blank.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <TouchableOpacity
                onPress={handleClose}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#333",
                  flex: 1,
                }}
              >
                Join Team
              </Text>
            </View>

            {/* Content */}
            <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 12,
                  padding: 30,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#34C759",
                    borderRadius: 30,
                    padding: 15,
                    marginBottom: 20,
                  }}
                >
                  <Ionicons name="people" size={32} color="white" />
                </View>

                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  Join a Team
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: "#666",
                    textAlign: "center",
                    marginBottom: 30,
                    lineHeight: 22,
                  }}
                >
                  Enter the 6-character invite code provided by your team leader
                  to join their team.
                </Text>

                <View style={{ width: "100%", marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333",
                      marginBottom: 8,
                    }}
                  >
                    Team Code
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 2,
                      borderColor: "#ddd",
                      borderRadius: 8,
                      padding: 15,
                      fontSize: 18,
                      textAlign: "center",
                      fontWeight: "600",
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      backgroundColor: "white",
                    }}
                    value={teamCode}
                    onChangeText={(text) => setTeamCode(text.toUpperCase())}
                    placeholder="ABCDEF"
                    maxLength={6}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#34C759",
                    paddingVertical: 15,
                    paddingHorizontal: 30,
                    borderRadius: 8,
                    alignItems: "center",
                    width: "100%",
                    opacity: loading || teamCode.length !== 6 ? 0.6 : 1,
                  }}
                  onPress={handleJoinTeam}
                  disabled={loading || teamCode.length !== 6}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      Join Team
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    marginTop: 15,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                  }}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text
                    style={{
                      color: "#666",
                      fontSize: 16,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  marginTop: 30,
                  padding: 20,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#e0e0e0",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  💡 <Text style={{ fontWeight: "600" }}>Tips:</Text>
                  {"\n"}• Team codes are case-insensitive
                  {"\n"}• Codes expire after 24 hours
                  {"\n"}• Ask your team leader to generate a new code if needed
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </Modal>
  );
};
