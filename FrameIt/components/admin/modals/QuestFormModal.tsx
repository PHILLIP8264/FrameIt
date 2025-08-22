import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Quest } from "../../../types/database";

interface QuestFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  editingQuest: Quest | null;
}

interface FormData {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  xpReward: number;
  category: string;
  status: "active" | "expired" | "completed";
  location: string;
  estimatedDuration: number;
}

const QUEST_CATEGORIES = [
  { id: "exploration", name: "Exploration", icon: "compass", color: "#2E7D32" },
  { id: "photography", name: "Photography", icon: "camera", color: "#1976D2" },
  { id: "social", name: "Social", icon: "people", color: "#7B1FA2" },
  { id: "fitness", name: "Fitness", icon: "fitness", color: "#D32F2F" },
  { id: "education", name: "Education", icon: "school", color: "#F57C00" },
  { id: "culture", name: "Culture", icon: "library", color: "#388E3C" },
  { id: "food", name: "Food & Dining", icon: "restaurant", color: "#E64A19" },
  { id: "nature", name: "Nature", icon: "leaf", color: "#689F38" },
];

export const QuestFormModal: React.FC<QuestFormModalProps> = ({
  visible,
  onClose,
  onSave,
  editingQuest,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    difficulty: "beginner",
    xpReward: 50,
    category: "exploration",
    status: "active",
    location: "",
    estimatedDuration: 60,
  });

  useEffect(() => {
    if (editingQuest) {
      setFormData({
        title: editingQuest.title || "",
        description: editingQuest.description || "",
        difficulty: editingQuest.difficulty || "beginner",
        xpReward: editingQuest.xpReward || 50,
        category: editingQuest.category || "exploration",
        status: editingQuest.status || "active",
        location: editingQuest.location || "",
        estimatedDuration: editingQuest.estimatedDuration || 60,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        difficulty: "beginner",
        xpReward: 50,
        category: "exploration",
        status: "active",
        location: "",
        estimatedDuration: 60,
      });
    }
  }, [editingQuest, visible]);

  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    onSave(formData);
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingQuest ? "Edit Quest" : "Create New Quest"}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Basic Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>

                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => updateField("title", text)}
                  placeholder="Enter quest title..."
                />

                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => updateField("description", text)}
                  placeholder="Describe the quest..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Difficulty & Category */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Difficulty & Category</Text>

                <Text style={styles.label}>Difficulty</Text>
                <View style={styles.difficultyGrid}>
                  {["beginner", "intermediate", "advanced", "expert"].map(
                    (level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.difficultyButton,
                          formData.difficulty === level &&
                            styles.difficultyButtonActive,
                        ]}
                        onPress={() => updateField("difficulty", level)}
                      >
                        <Text
                          style={[
                            styles.difficultyText,
                            formData.difficulty === level &&
                              styles.difficultyTextActive,
                          ]}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <Text style={styles.label}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {QUEST_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        formData.category === category.id &&
                          styles.categoryButtonActive,
                      ]}
                      onPress={() => updateField("category", category.id)}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={20}
                        color={
                          formData.category === category.id
                            ? category.color
                            : "#666"
                        }
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          formData.category === category.id && {
                            color: category.color,
                          },
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Rewards & Settings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rewards & Settings</Text>

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>XP Reward</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.xpReward.toString()}
                      onChangeText={(text) =>
                        updateField("xpReward", parseInt(text) || 0)
                      }
                      placeholder="50"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Duration (min)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.estimatedDuration.toString()}
                      onChangeText={(text) =>
                        updateField("estimatedDuration", parseInt(text) || 0)
                      }
                      placeholder="60"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => updateField("location", text)}
                  placeholder="Enter location..."
                />

                <Text style={styles.label}>Status</Text>
                <View style={styles.statusContainer}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      formData.status === "active"
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}
                    onPress={() =>
                      updateField(
                        "status",
                        formData.status === "active" ? "expired" : "active"
                      )
                    }
                  >
                    <Text style={styles.statusText}>
                      {formData.status === "active" ? "Active" : "Inactive"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingQuest ? "Update Quest" : "Create Quest"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: { width: "95%", maxHeight: "90%" },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  closeButton: { padding: 8, borderRadius: 20, backgroundColor: "#f1f3f4" },

  modalBody: { maxHeight: "80%" },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "white",
    color: "#333",
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },

  difficultyGrid: { flexDirection: "row", marginBottom: 16 },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  difficultyButtonActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#007AFF",
  },
  difficultyText: { fontSize: 12, fontWeight: "600", color: "#666" },
  difficultyTextActive: { color: "#007AFF" },

  categoryScroll: { marginBottom: 16 },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  categoryButtonActive: { backgroundColor: "#f0f8ff", borderColor: "#007AFF" },
  categoryText: { fontSize: 12, marginLeft: 6, color: "#666" },

  row: { flexDirection: "row", marginHorizontal: -4 },
  halfWidth: { flex: 1, marginHorizontal: 4 },

  statusContainer: { alignItems: "flex-start" },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  statusActive: { backgroundColor: "#4CAF50" },
  statusInactive: { backgroundColor: "#999" },
  statusText: { color: "white", fontSize: 14, fontWeight: "600" },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  cancelButtonText: { color: "#666", fontSize: 14, fontWeight: "600" },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    marginLeft: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "white", fontSize: 14, fontWeight: "600" },
});
