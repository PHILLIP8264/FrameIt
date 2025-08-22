import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tag, Achievement } from "../../types/database";
import { FirestoreService } from "../../services";

interface TagManagementProps {
  onClose: () => void;
}

export const TagManagement: React.FC<TagManagementProps> = ({ onClose }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "star-outline",
    color: "#4F46E5",
    rarity: "common" as "common" | "rare" | "epic" | "legendary",
    unlockedMessage: "",
    requirements: {
      achievements: [] as string[],
      questsCompleted: 0,
      totalXP: 0,
      votes: 0,
      streakDays: 0,
    },
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tagsData, achievementsData] = await Promise.all([
        FirestoreService.getTags(),
        FirestoreService.getAchievements(),
      ]);
      setTags(tagsData);
      setAchievements(achievementsData);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load tags and achievements");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "star-outline",
      color: "#4F46E5",
      rarity: "common",
      unlockedMessage: "",
      requirements: {
        achievements: [],
        questsCompleted: 0,
        totalXP: 0,
        votes: 0,
        streakDays: 0,
      },
      isActive: true,
    });
    setEditingTag(null);
    setShowCreateForm(false);
  };

  const handleCreateTag = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Tag name is required");
      return;
    }

    try {
      const newTag: Tag = {
        id: `tag_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        requirements: {
          achievements: formData.requirements.achievements,
          questsCompleted: formData.requirements.questsCompleted,
          totalXP: formData.requirements.totalXP,
          votes: formData.requirements.votes,
          streakDays: formData.requirements.streakDays,
        },
        rarity: formData.rarity,
        unlockedMessage:
          formData.unlockedMessage ||
          `Congratulations! You've unlocked the "${formData.name}" tag!`,
        createdBy: "admin", // Replace with actual admin user ID
        createdAt: new Date().toISOString(),
        isActive: formData.isActive,
        isDefault: false,
      };

      await FirestoreService.createTag(newTag);
      await loadData();
      resetForm();
      Alert.alert("Success", "Tag created successfully!");
    } catch (error) {
      console.error("Error creating tag:", error);
      Alert.alert("Error", "Failed to create tag");
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;

    try {
      const updatedTag: Tag = {
        ...editingTag,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        requirements: {
          achievements: formData.requirements.achievements,
          questsCompleted: formData.requirements.questsCompleted,
          totalXP: formData.requirements.totalXP,
          votes: formData.requirements.votes,
          streakDays: formData.requirements.streakDays,
        },
        rarity: formData.rarity,
        unlockedMessage: formData.unlockedMessage,
        isActive: formData.isActive,
      };

      await FirestoreService.updateTag(updatedTag);
      await loadData();
      resetForm();
      Alert.alert("Success", "Tag updated successfully!");
    } catch (error) {
      console.error("Error updating tag:", error);
      Alert.alert("Error", "Failed to update tag");
    }
  };

  const handleDeleteTag = (tag: Tag) => {
    if (tag.isDefault) {
      Alert.alert("Error", "Cannot delete default system tags");
      return;
    }

    Alert.alert(
      "Delete Tag",
      `Are you sure you want to delete "${tag.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onLongPress: async () => {
            try {
              await FirestoreService.deleteTag(tag.id);
              await loadData();
              Alert.alert("Success", "Tag deleted successfully!");
            } catch (error) {
              console.error("Error deleting tag:", error);
              Alert.alert("Error", "Failed to delete tag");
            }
          },
        },
      ]
    );
  };

  const startEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description,
      icon: tag.icon,
      color: tag.color,
      rarity: tag.rarity,
      unlockedMessage: tag.unlockedMessage,
      requirements: {
        achievements: tag.requirements.achievements || [],
        questsCompleted: tag.requirements.questsCompleted || 0,
        totalXP: tag.requirements.totalXP || 0,
        votes: tag.requirements.votes || 0,
        streakDays: tag.requirements.streakDays || 0,
      },
      isActive: tag.isActive,
    });
    setShowCreateForm(true);
  };

  const toggleAchievementRequirement = (achievementId: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        achievements: prev.requirements.achievements.includes(achievementId)
          ? prev.requirements.achievements.filter((id) => id !== achievementId)
          : [...prev.requirements.achievements, achievementId],
      },
    }));
  };

  const rarityColors = {
    common: "#10B981",
    rare: "#3B82F6",
    epic: "#8B5CF6",
    legendary: "#F59E0B",
  };

  const iconOptions = [
    "star-outline",
    "trophy-outline",
    "medal-outline",
    "ribbon-outline",
    "leaf-outline",
    "compass-outline",
    "telescope-outline",
    "rocket-outline",
    "shield-outline",
    "flame-outline",
    "diamond-outline",
    "crown-outline",
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onLongPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Tag Management</Text>
        <TouchableOpacity
          onLongPress={() => setShowCreateForm(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Existing Tags */}
        {!showCreateForm && (
          <View>
            <Text style={styles.sectionTitle}>
              Existing Tags ({tags.length})
            </Text>
            {tags.map((tag) => (
              <View key={tag.id} style={styles.tagCard}>
                <View style={styles.tagHeader}>
                  <View style={styles.tagInfo}>
                    <View
                      style={[
                        styles.tagIconContainer,
                        { backgroundColor: `${tag.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={tag.icon as any}
                        size={20}
                        color={tag.color}
                      />
                    </View>
                    <View style={styles.tagDetails}>
                      <View style={styles.tagTitleRow}>
                        <Text style={styles.tagName}>{tag.name}</Text>
                        <View
                          style={[
                            styles.rarityBadge,
                            { backgroundColor: rarityColors[tag.rarity] },
                          ]}
                        >
                          <Text style={styles.rarityText}>{tag.rarity}</Text>
                        </View>
                      </View>
                      <Text style={styles.tagDescription}>
                        {tag.description}
                      </Text>
                      {tag.isDefault && (
                        <Text style={styles.systemTag}>System Tag</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.tagActions}>
                    <TouchableOpacity
                      onLongPress={() => startEdit(tag)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="pencil" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    {!tag.isDefault && (
                      <TouchableOpacity
                        onLongPress={() => handleDeleteTag(tag)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Requirements Preview */}
                <View style={styles.requirementsPreview}>
                  <Text style={styles.requirementsTitle}>Requirements:</Text>
                  {(tag.requirements.questsCompleted || 0) > 0 && (
                    <Text style={styles.requirement}>
                      • {tag.requirements.questsCompleted} quests completed
                    </Text>
                  )}
                  {(tag.requirements.totalXP || 0) > 0 && (
                    <Text style={styles.requirement}>
                      • {tag.requirements.totalXP} total XP
                    </Text>
                  )}
                  {(tag.requirements.achievements?.length || 0) > 0 && (
                    <Text style={styles.requirement}>
                      • {tag.requirements.achievements?.length} achievements
                    </Text>
                  )}
                  {(tag.requirements.votes || 0) > 0 && (
                    <Text style={styles.requirement}>
                      • {tag.requirements.votes} votes received
                    </Text>
                  )}
                  {(tag.requirements.streakDays || 0) > 0 && (
                    <Text style={styles.requirement}>
                      • {tag.requirements.streakDays} day streak
                    </Text>
                  )}
                  {(tag.requirements.questsCompleted || 0) === 0 &&
                    (tag.requirements.totalXP || 0) === 0 &&
                    (tag.requirements.achievements?.length || 0) === 0 &&
                    (tag.requirements.votes || 0) === 0 &&
                    (tag.requirements.streakDays || 0) === 0 && (
                      <Text style={styles.requirement}>
                        • No requirements (default tag)
                      </Text>
                    )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingTag ? "Edit Tag" : "Create New Tag"}
            </Text>

            <View style={styles.formSection}>
              <Text style={styles.label}>Tag Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Enter tag name"
                maxLength={30}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Enter tag description"
                multiline
                numberOfLines={3}
                maxLength={150}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Unlock Message</Text>
              <TextInput
                style={styles.input}
                value={formData.unlockedMessage}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, unlockedMessage: text }))
                }
                placeholder="Message shown when tag is unlocked"
                maxLength={100}
              />
            </View>

            {/* Icon Selection */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.iconSelector}>
                  {iconOptions.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      onLongPress={() =>
                        setFormData((prev) => ({ ...prev, icon }))
                      }
                      style={[
                        styles.iconOption,
                        formData.icon === icon && styles.selectedIcon,
                      ]}
                    >
                      <Ionicons
                        name={icon as any}
                        size={24}
                        color={formData.color}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Rarity Selection */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Rarity</Text>
              <View style={styles.raritySelector}>
                {(["common", "rare", "epic", "legendary"] as const).map(
                  (rarity) => (
                    <TouchableOpacity
                      key={rarity}
                      onLongPress={() =>
                        setFormData((prev) => ({ ...prev, rarity }))
                      }
                      style={[
                        styles.rarityOption,
                        formData.rarity === rarity && styles.selectedRarity,
                        { borderColor: rarityColors[rarity] },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rarityOptionText,
                          formData.rarity === rarity && {
                            color: rarityColors[rarity],
                          },
                        ]}
                      >
                        {rarity}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Requirements */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Requirements</Text>

              <View style={styles.requirementRow}>
                <Text style={styles.label}>Quests Completed</Text>
                <TextInput
                  style={styles.numberInput}
                  value={formData.requirements.questsCompleted.toString()}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirements: {
                        ...prev.requirements,
                        questsCompleted: parseInt(text) || 0,
                      },
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={styles.requirementRow}>
                <Text style={styles.label}>Total XP</Text>
                <TextInput
                  style={styles.numberInput}
                  value={formData.requirements.totalXP.toString()}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirements: {
                        ...prev.requirements,
                        totalXP: parseInt(text) || 0,
                      },
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={styles.requirementRow}>
                <Text style={styles.label}>Votes Received</Text>
                <TextInput
                  style={styles.numberInput}
                  value={formData.requirements.votes.toString()}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirements: {
                        ...prev.requirements,
                        votes: parseInt(text) || 0,
                      },
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={styles.requirementRow}>
                <Text style={styles.label}>Streak Days</Text>
                <TextInput
                  style={styles.numberInput}
                  value={formData.requirements.streakDays.toString()}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirements: {
                        ...prev.requirements,
                        streakDays: parseInt(text) || 0,
                      },
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              {/* Achievement Requirements */}
              <Text style={styles.label}>Required Achievements</Text>
              <View style={styles.achievementsList}>
                {achievements.map((achievement) => (
                  <TouchableOpacity
                    key={achievement.id}
                    onLongPress={() =>
                      toggleAchievementRequirement(achievement.id)
                    }
                    style={[
                      styles.achievementOption,
                      formData.requirements.achievements.includes(
                        achievement.id
                      ) && styles.selectedAchievement,
                    ]}
                  >
                    <Text style={styles.achievementName}>
                      {achievement.name}
                    </Text>
                    {formData.requirements.achievements.includes(
                      achievement.id
                    ) && (
                      <Ionicons name="checkmark" size={16} color="#4F46E5" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, isActive: value }))
                  }
                  trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
                  thumbColor={formData.isActive ? "#FFFFFF" : "#F3F4F6"}
                />
              </View>
            </View>

            {/* Form Actions */}
            <View style={styles.formActions}>
              <TouchableOpacity
                onLongPress={resetForm}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onLongPress={editingTag ? handleUpdateTag : handleCreateTag}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>
                  {editingTag ? "Update" : "Create"} Tag
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButton: {
    padding: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  addButton: {
    padding: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  tagCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tagHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tagInfo: {
    flexDirection: "row",
    flex: 1,
  },
  tagIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tagDetails: {
    flex: 1,
  },
  tagTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tagName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 8,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  tagDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  systemTag: {
    fontSize: 10,
    color: "#8B5CF6",
    fontWeight: "500",
    marginTop: 2,
  },
  tagActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  requirementsPreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  requirement: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    width: 80,
    textAlign: "center",
  },
  iconSelector: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  selectedIcon: {
    borderColor: "#4F46E5",
    backgroundColor: "rgba(79, 70, 229, 0.1)",
  },
  raritySelector: {
    flexDirection: "row",
    gap: 8,
  },
  rarityOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  selectedRarity: {
    backgroundColor: "rgba(79, 70, 229, 0.1)",
  },
  rarityOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  requirementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementsList: {
    gap: 8,
  },
  achievementOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  selectedAchievement: {
    borderColor: "#4F46E5",
    backgroundColor: "rgba(79, 70, 229, 0.05)",
  },
  achievementName: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default TagManagement;
