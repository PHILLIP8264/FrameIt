import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services";
import { User, Team } from "../types/database";
import { teamChallengeStyles as styles } from "../styles/teamChallengeStyles";

interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  type: "xp" | "quests" | "locations" | "time";
  defaultTarget: number;
  icon: string;
  color: string;
}

export default function CreateTeamChallenge() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Challenge form state
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeType, setChallengeType] = useState<
    "xp" | "quests" | "locations" | "time"
  >("xp");
  const [targetValue, setTargetValue] = useState("");
  const [duration, setDuration] = useState("7"); // days
  const [reward, setReward] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const challengeTemplates: ChallengeTemplate[] = [
    {
      id: "weekly_xp",
      title: "Weekly XP Challenge",
      description: "Team goal: Earn {target} XP this week",
      type: "xp",
      defaultTarget: 5000,
      icon: "trophy",
      color: "#FFD700",
    },
    {
      id: "quest_marathon",
      title: "Quest Marathon",
      description: "Complete {target} quests as a team",
      type: "quests",
      defaultTarget: 20,
      icon: "flag",
      color: "#007AFF",
    },
    {
      id: "explorer_challenge",
      title: "Location Explorer",
      description: "Discover {target} unique locations",
      type: "locations",
      defaultTarget: 10,
      icon: "location",
      color: "#28A745",
    },
    {
      id: "speed_challenge",
      title: "Speed Challenge",
      description: "Complete as many quests as possible in {target} hours",
      type: "time",
      defaultTarget: 24,
      icon: "timer",
      color: "#FF6B35",
    },
  ];

  useEffect(() => {
    loadUserData();
  }, [user?.uid]);

  const loadUserData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      const userData = await FirestoreService.getUser(user.uid);
      if (!userData || userData.role !== "team_leader") {
        Alert.alert(
          "Access Denied",
          "You must be a team leader to create challenges."
        );
        router.back();
        return;
      }

      setUserData(userData);

      const teams = await FirestoreService.getUserTeams(user.uid);
      setUserTeams(teams);

      if (teams.length > 0) {
        setSelectedTeam(teams[0]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: ChallengeTemplate) => {
    setSelectedTemplate(template.id);
    setChallengeTitle(template.title);
    setChallengeDescription(
      template.description.replace(
        "{target}",
        template.defaultTarget.toString()
      )
    );
    setChallengeType(template.type);
    setTargetValue(template.defaultTarget.toString());

    // Set default rewards based on challenge type
    switch (template.type) {
      case "xp":
        setReward("Team XP Badge");
        break;
      case "quests":
        setReward("Quest Master Badge");
        break;
      case "locations":
        setReward("Explorer Badge");
        break;
      case "time":
        setReward("Speed Demon Badge");
        break;
    }
  };

  const handleCreateChallenge = async () => {
    if (!selectedTeam || !challengeTitle.trim() || !targetValue.trim()) {
      Alert.alert(
        "Error",
        "Please fill in all required fields and select a team."
      );
      return;
    }

    const target = parseInt(targetValue);
    if (isNaN(target) || target <= 0) {
      Alert.alert("Error", "Please enter a valid target value.");
      return;
    }

    const durationDays = parseInt(duration);
    if (isNaN(durationDays) || durationDays <= 0) {
      Alert.alert("Error", "Please enter a valid duration.");
      return;
    }

    try {
      setLoading(true);

      // Create challenge object
      const challenge = {
        teamId: selectedTeam.teamId,
        title: challengeTitle.trim(),
        description: challengeDescription.trim(),
        type: challengeType,
        targetValue: target,
        currentValue: 0,
        createdBy: user!.uid,
        createdAt: new Date(),
        startDate: new Date(),
        endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        isActive: true,
        participants: [], // Will be populated with team members
        reward: reward.trim() || "Team Achievement",
      };

      Alert.alert("Success", "Team challenge created successfully!", [
        {
          text: "OK",
          onLongPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error creating challenge:", error);
      Alert.alert("Error", "Failed to create challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onLongPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Team Challenge</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Team Selection */}
          {userTeams.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Team</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {userTeams.map((team) => (
                  <TouchableOpacity
                    key={team.teamId}
                    style={[
                      styles.teamCard,
                      selectedTeam?.teamId === team.teamId &&
                        styles.selectedTeamCard,
                    ]}
                    onLongPress={() => setSelectedTeam(team)}
                  >
                    <Text
                      style={[
                        styles.teamCardName,
                        selectedTeam?.teamId === team.teamId &&
                          styles.selectedTeamCardName,
                      ]}
                    >
                      {team.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Challenge Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Challenge Templates</Text>
            <Text style={styles.sectionSubtitle}>
              Choose a template to get started quickly
            </Text>

            <View style={styles.templatesGrid}>
              {challengeTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateCard,
                    selectedTemplate === template.id &&
                      styles.selectedTemplateCard,
                  ]}
                  onLongPress={() => handleTemplateSelect(template)}
                >
                  <View
                    style={[
                      styles.templateIcon,
                      { backgroundColor: template.color },
                    ]}
                  >
                    <Ionicons
                      name={template.icon as any}
                      size={24}
                      color="#FFF"
                    />
                  </View>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateDescription}>
                    {template.description.replace(
                      "{target}",
                      template.defaultTarget.toString()
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Challenge Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Challenge Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Challenge Title *</Text>
              <TextInput
                style={styles.textInput}
                value={challengeTitle}
                onChangeText={setChallengeTitle}
                placeholder="Enter challenge title"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={challengeDescription}
                onChangeText={setChallengeDescription}
                placeholder="Describe your challenge"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Target Value *</Text>
                <TextInput
                  style={styles.textInput}
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Duration (days) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="7"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reward</Text>
              <TextInput
                style={styles.textInput}
                value={reward}
                onChangeText={setReward}
                placeholder="Team Achievement Badge"
                placeholderTextColor="#999"
              />
            </View>

            {/* Challenge Type */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Challenge Type</Text>
              <View style={styles.typeSelector}>
                {["xp", "quests", "locations", "time"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      challengeType === type && styles.selectedTypeOption,
                    ]}
                    onLongPress={() => setChallengeType(type as any)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        challengeType === type && styles.selectedTypeOptionText,
                      ]}
                    >
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>
                  {challengeTitle || "Challenge Title"}
                </Text>
                <View style={styles.previewStatus}>
                  <Text style={styles.previewStatusText}>Active</Text>
                </View>
              </View>
              <Text style={styles.previewDescription}>
                {challengeDescription ||
                  "Challenge description will appear here"}
              </Text>
              <View style={styles.previewStats}>
                <Text style={styles.previewTarget}>
                  Target: {targetValue || "0"} {challengeType.toUpperCase()}
                </Text>
                <Text style={styles.previewDuration}>
                  Duration: {duration || "0"} days
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.createButtonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!selectedTeam ||
                !challengeTitle.trim() ||
                !targetValue.trim()) &&
                styles.createButtonDisabled,
            ]}
            onLongPress={handleCreateChallenge}
            disabled={
              loading ||
              !selectedTeam ||
              !challengeTitle.trim() ||
              !targetValue.trim()
            }
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFF" />
                <Text style={styles.createButtonText}>Create Challenge</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
