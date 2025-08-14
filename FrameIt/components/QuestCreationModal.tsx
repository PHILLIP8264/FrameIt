import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
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

interface QuestCreationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuestCreationModal: React.FC<QuestCreationModalProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Quest form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [xpReward, setXpReward] = useState("100");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced" | "expert"
  >("beginner");
  const [estimatedDuration, setEstimatedDuration] = useState("30");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setCategory("");
    setXpReward("100");
    setDifficulty("beginner");
    setEstimatedDuration("30");
    setEndDate("");
  };

  const handleCreateQuest = async () => {
    if (!user || !title.trim() || !description.trim() || !location.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Generate quest ID
      const questId = `quest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const questData = {
        questId,
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || "General",
        location: location.trim(),
        coordinates: {
          latitude: 0, // TODO: Add location picker
          longitude: 0,
        },
        radius: 100, // Default 100 meters
        addressDetails: {
          city: location.trim(),
          state: "",
          country: "",
        },
        endDate:
          endDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        startDate: new Date().toISOString(),
        xpReward: parseInt(xpReward) || 100,
        createdBy: user.uid,
        status: "active" as const,
        difficulty,
        minLevel:
          difficulty === "beginner"
            ? 1
            : difficulty === "intermediate"
            ? 5
            : difficulty === "advanced"
            ? 10
            : 15,
        estimatedDuration: parseInt(estimatedDuration) || 30,

        // Quest Type and Access Control
        questType: "global" as const,
        visibility: "public" as const,
        creatorRole: "admin" as const,

        photoRequirements: {
          subjects: [category.trim() || "General"],
          timeOfDay: "any" as const,
        },
        rewards: {
          baseXP: parseInt(xpReward) || 100,
          bonusXP: {
            speedBonus: Math.floor((parseInt(xpReward) || 100) * 0.2),
            qualityBonus: Math.floor((parseInt(xpReward) || 100) * 0.3),
            firstTime: Math.floor((parseInt(xpReward) || 100) * 0.1),
          },
        },
        isRecurring: false,
        moderationRequired: false,
        statistics: {
          totalParticipants: 0,
          successRate: 0,
          averageCompletionTime: 0,
        },
      };

      await FirestoreService.createQuest(questData, user.uid);

      Alert.alert("Success", "Global quest created successfully!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating quest:", error);
      Alert.alert("Error", error.message || "Failed to create quest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
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
              <TouchableOpacity onPress={onClose} style={{ marginRight: 15 }}>
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
                Create Global Quest
              </Text>
            </View>

            {/* Content */}
            <ScrollView style={{ flex: 1, padding: 20 }}>
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  Title *
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  }}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter quest title"
                  maxLength={100}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  Description *
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    height: 100,
                  }}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter quest description"
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  Location *
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  }}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Enter location (e.g., Central Park, NYC)"
                  maxLength={100}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  Category
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  }}
                  value={category}
                  onChangeText={setCategory}
                  placeholder="e.g., Nature, Architecture, Street Art"
                  maxLength={50}
                />
              </View>

              <View style={{ flexDirection: "row", marginBottom: 20 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333",
                      marginBottom: 8,
                    }}
                  >
                    XP Reward
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }}
                    value={xpReward}
                    onChangeText={setXpReward}
                    placeholder="100"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333",
                      marginBottom: 8,
                    }}
                  >
                    Duration (min)
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }}
                    value={estimatedDuration}
                    onChangeText={setEstimatedDuration}
                    placeholder="30"
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  Difficulty
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {(
                    ["beginner", "intermediate", "advanced", "expert"] as const
                  ).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor:
                          difficulty === level
                            ? "#007AFF"
                            : "rgba(255, 255, 255, 0.9)",
                        borderWidth: 1,
                        borderColor: difficulty === level ? "#007AFF" : "#ddd",
                        marginRight: 10,
                        marginBottom: 10,
                      }}
                      onPress={() => setDifficulty(level)}
                    >
                      <Text
                        style={{
                          color: difficulty === level ? "white" : "#333",
                          fontWeight: difficulty === level ? "bold" : "normal",
                          textTransform: "capitalize",
                        }}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 30 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  End Date (optional)
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  }}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD (leave empty for 30 days)"
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#007AFF",
                  padding: 15,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: loading ? 0.6 : 1,
                  marginBottom: 20,
                }}
                onPress={handleCreateQuest}
                disabled={
                  loading ||
                  !title.trim() ||
                  !description.trim() ||
                  !location.trim()
                }
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                  >
                    Create Global Quest
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </Modal>
  );
};
