import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FirestoreService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";

interface JoinTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onTeamJoined?: () => void;
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
      transparent={true}
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            width: "100%",
            maxWidth: 420,
            height: "80%",
            minHeight: 500,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 12,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: "#007AFF",
              paddingVertical: 20,
              paddingHorizontal: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#FFFFFF",
                letterSpacing: 0.5,
              }}
            >
              Join Team
            </Text>
            <TouchableOpacity
              onLongPress={handleClose}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 20,
                padding: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#F8F9FA" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 32,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#007AFF",
                    borderRadius: 30,
                    padding: 16,
                    marginBottom: 24,
                  }}
                >
                  <Ionicons name="people" size={32} color="white" />
                </View>

                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#212529",
                    marginBottom: 12,
                    textAlign: "center",
                  }}
                >
                  Join a Team
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: "#6c757d",
                    textAlign: "center",
                    marginBottom: 32,
                    lineHeight: 24,
                  }}
                >
                  Enter the 6-character invite code provided by your team leader
                  to join their team.
                </Text>

                <View style={{ width: "100%", marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#212529",
                      marginBottom: 8,
                    }}
                  >
                    Team Code
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 2,
                      borderColor: "#e9ecef",
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 18,
                      textAlign: "center",
                      fontWeight: "600",
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      backgroundColor: "#f8f9fa",
                      color: "#212529",
                    }}
                    value={teamCode}
                    onChangeText={(text) => setTeamCode(text.toUpperCase())}
                    placeholder="ABCDEF"
                    placeholderTextColor="#adb5bd"
                    maxLength={6}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#007AFF",
                    paddingVertical: 16,
                    paddingHorizontal: 32,
                    borderRadius: 12,
                    alignItems: "center",
                    width: "100%",
                    opacity: loading || teamCode.length !== 6 ? 0.6 : 1,
                  }}
                  onLongPress={handleJoinTeam}
                  disabled={loading || teamCode.length !== 6}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Join Team
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View
                style={{
                  marginTop: 24,
                  padding: 20,
                  backgroundColor: "white",
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6c757d",
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  💡{" "}
                  <Text style={{ fontWeight: "600", color: "#212529" }}>
                    Tips:
                  </Text>
                  {"\n"}• Team codes are case-insensitive
                  {"\n"}• Codes expire after 24 hours
                  {"\n"}• Ask your team leader to generate a new code if needed
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};
