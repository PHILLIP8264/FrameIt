import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { FirestoreService } from "../../services";
import TagUnlockService from "../../services/TagUnlockService";
import { Tag } from "../../types/database";

interface TagChangeModalProps {
  visible: boolean;
  onClose: () => void;
  currentTag: string;
  onTagSelect?: (tag: string) => void;
}

interface TagWithProgress extends Tag {
  isUnlocked: boolean;
  progress?: {
    questsCompleted: { current: number; required: number };
    totalXP: { current: number; required: number };
    achievements: { current: number; required: number };
    votes: { current: number; required: number };
    streakDays: { current: number; required: number };
  };
}

export const TagChangeModal: React.FC<TagChangeModalProps> = ({
  visible,
  onClose,
  currentTag,
  onTagSelect,
}) => {
  const { user } = useAuth();
  const [selectedTag, setSelectedTag] = useState(currentTag);
  const [tags, setTags] = useState<TagWithProgress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedTag(currentTag);
      loadTags();
    }
  }, [visible, currentTag]);

  const loadTags = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Get all active tags
      const allTags = await FirestoreService.getTags();
      const activeTags = allTags.filter((tag) => tag.isActive);

      // Get progress for each tag
      const tagsWithProgress = await Promise.all(
        activeTags.map(async (tag) => {
          const progress = await TagUnlockService.getTagProgress(
            user.uid,
            tag.id
          );
          return {
            ...tag,
            isUnlocked: progress.isUnlocked,
            progress: progress.progress,
          };
        })
      );

      // Sort by unlocked first, then by rarity
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      tagsWithProgress.sort((a, b) => {
        if (a.isUnlocked !== b.isUnlocked) {
          return b.isUnlocked ? 1 : -1; // Unlocked first
        }
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      });

      setTags(tagsWithProgress);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = async (tag: TagWithProgress) => {
    if (!tag.isUnlocked) return;

    if (!user?.uid) return;

    try {
      // Update user's current tag
      const userData = await FirestoreService.getUser(user.uid);
      if (userData) {
        await FirestoreService.setUser(user.uid, {
          ...userData,
          tag: tag.id,
        });

        setSelectedTag(tag.id);
        onTagSelect?.(tag.id);
        onClose();
      }
    } catch (error) {
      console.error("Error selecting tag:", error);
    }
  };

  const getProgressPercentage = (progress: TagWithProgress["progress"]) => {
    if (!progress) return 0;

    const requirements = [
      progress.questsCompleted,
      progress.totalXP,
      progress.achievements,
      progress.votes,
      progress.streakDays,
    ].filter((req) => req.required > 0);

    if (requirements.length === 0) return 100; // No requirements = always unlocked

    const completedRequirements = requirements.filter(
      (req) => req.current >= req.required
    ).length;
    return (completedRequirements / requirements.length) * 100;
  };

  const getRequirementText = (tag: TagWithProgress) => {
    if (tag.isUnlocked) return "Unlocked";

    if (!tag.progress) return "Requirements unknown";

    const requirements = [];
    const prog = tag.progress;

    if (prog.questsCompleted.required > 0) {
      requirements.push(
        `${prog.questsCompleted.current}/${prog.questsCompleted.required} quests`
      );
    }
    if (prog.totalXP.required > 0) {
      requirements.push(`${prog.totalXP.current}/${prog.totalXP.required} XP`);
    }
    if (prog.achievements.required > 0) {
      requirements.push(
        `${prog.achievements.current}/${prog.achievements.required} achievements`
      );
    }
    if (prog.votes.required > 0) {
      requirements.push(`${prog.votes.current}/${prog.votes.required} votes`);
    }
    if (prog.streakDays.required > 0) {
      requirements.push(
        `${prog.streakDays.current}/${prog.streakDays.required} day streak`
      );
    }

    return requirements.length > 0
      ? requirements.join(", ")
      : "No requirements";
  };

  const handleClose = () => {
    setSelectedTag(currentTag);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LinearGradient
          colors={[
            "rgba(79, 70, 229, 0.05)",
            "rgba(79, 70, 229, 0.02)",
            "rgba(255, 255, 255, 0.95)",
          ]}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft} />
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Choose Your Tag</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.description}>
              Earn tags by completing achievements and meeting requirements.
              Unlocked tags can be selected to represent your explorer style.
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#137CD8" />
                <Text style={styles.loadingText}>Loading tags...</Text>
              </View>
            ) : (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    onLongPress={() => handleTagSelect(tag)}
                    disabled={!tag.isUnlocked}
                    style={[
                      styles.tagCard,
                      !tag.isUnlocked && styles.lockedTagCard,
                      selectedTag === tag.id && styles.selectedTagCard,
                    ]}
                  >
                    <View style={styles.tagHeader}>
                      <View
                        style={[
                          styles.tagIconContainer,
                          { backgroundColor: `${tag.color}20` },
                        ]}
                      >
                        <Ionicons
                          name={tag.icon as any}
                          size={24}
                          color={tag.isUnlocked ? tag.color : "#9CA3AF"}
                        />
                      </View>

                      <View style={styles.tagStatus}>
                        {tag.isUnlocked ? (
                          selectedTag === tag.id ? (
                            <View style={styles.selectedBadge}>
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="#FFFFFF"
                              />
                            </View>
                          ) : (
                            <View
                              style={[
                                styles.rarityBadge,
                                { backgroundColor: tag.color },
                              ]}
                            >
                              <Text style={styles.rarityText}>
                                {tag.rarity}
                              </Text>
                            </View>
                          )
                        ) : (
                          <View style={styles.lockedBadge}>
                            <Ionicons
                              name="lock-closed"
                              size={14}
                              color="#D61A66"
                            />
                          </View>
                        )}
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.tagName,
                        !tag.isUnlocked && styles.lockedText,
                      ]}
                    >
                      {tag.name}
                    </Text>

                    <Text
                      style={[
                        styles.tagDescription,
                        !tag.isUnlocked && styles.lockedText,
                      ]}
                    >
                      {tag.description}
                    </Text>

                    {/* Progress/Requirements */}
                    <View style={styles.requirementContainer}>
                      <Text
                        style={[
                          styles.requirementText,
                          tag.isUnlocked && styles.unlockedRequirementText,
                        ]}
                      >
                        {getRequirementText(tag)}
                      </Text>

                      {!tag.isUnlocked && tag.progress && (
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${getProgressPercentage(
                                  tag.progress
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {tags.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Ionicons name="pricetag-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No Tags Available</Text>
                <Text style={styles.emptyStateText}>
                  Tags will appear here as they become available.
                </Text>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
  },
  headerRight: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  description: {
    fontSize: 14,
    color: "#D61A66",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: "#D61A66",
    marginTop: 12,
  },
  tagsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  tagCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lockedTagCard: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    opacity: 0.7,
  },
  selectedTagCard: {
    borderColor: "#137CD8",
    backgroundColor: "rgba(19, 124, 216, 0.05)",
  },
  tagHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tagIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tagStatus: {
    alignItems: "center",
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#137CD8",
    justifyContent: "center",
    alignItems: "center",
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  lockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  tagName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  tagDescription: {
    fontSize: 13,
    color: "#D61A66",
    lineHeight: 18,
    marginBottom: 8,
  },
  lockedText: {
    color: "#9CA3AF",
  },
  requirementContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  requirementText: {
    fontSize: 11,
    color: "#D61A66",
    marginBottom: 6,
  },
  unlockedRequirementText: {
    color: "#10B981",
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#137CD8",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D61A66",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export default TagChangeModal;
