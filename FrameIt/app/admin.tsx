import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import FirestoreService from "../services/FirestoreService";
import DatabaseService from "../services/DatabaseService";
import { User, Group, Tag, Achievement, Submission } from "../types/database";

interface Quest {
  questId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  endDate: string;
  xpReward: number;
  createdBy: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [formData, setFormData] = useState<any>({});

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    // TODO: Check user role from Firestore
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tagsData, achievementsData, groupsData] = await Promise.all([
        DatabaseService.getTags(),
        FirestoreService.getAchievements(),
        FirestoreService.getGroups(),
      ]);
      setTags(tagsData);
      setAchievements(achievementsData);
      setGroups(groupsData);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (action: string, data: any = {}) => {
    setCurrentAction(action);
    setFormData(data);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFormData({});
    setCurrentAction("");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      switch (currentAction) {
        case "createQuest":
          await createQuest();
          break;
        case "createGroup":
          await createGroup();
          break;
        case "createTag":
          await createTag();
          break;
        case "createAchievement":
          await createAchievement();
          break;
        default:
          break;
      }
      closeModal();
      loadData();
    } catch (error) {
      console.error("Error saving:", error);
      Alert.alert("Error", "Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  const createQuest = async () => {
    const questData = {
      questId: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      endDate: formData.endDate,
      xpReward: parseInt(formData.xpReward),
      createdBy: user?.uid || "",
    };
    // TODO: Implement quest creation in DatabaseService
    // Creating quest with provided data
  };

  const createGroup = async () => {
    const groupData: Group = {
      groupId: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      createdBy: user?.uid || "",
      members: [],
      createdAt: new Date(),
    };
    await DatabaseService.createGroup(groupData);
  };

  const createTag = async () => {
    const tagData: Tag = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
    };
    // TODO: Implement tag creation in DatabaseService
    // Creating tag with provided data
  };

  const createAchievement = async () => {
    const achievementData: Achievement = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
    };
    // TODO: Implement achievement creation in DatabaseService
    // Creating achievement with provided data
  };

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>User Management</Text>
      <Text style={styles.placeholder}>User list will be displayed here</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => openModal("createUser")}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add User</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuests = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Quest Management</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => openModal("createQuest")}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.buttonText}>Create Quest</Text>
      </TouchableOpacity>
      <Text style={styles.placeholder}>Quest list will be displayed here</Text>
    </View>
  );

  const renderGroups = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Group Management</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => openModal("createGroup")}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.buttonText}>Create Group</Text>
      </TouchableOpacity>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.groupId}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>{item.description}</Text>
            <Text style={styles.itemDetails}>
              Members: {item.members.length}
            </Text>
          </View>
        )}
      />
    </View>
  );

  const renderTags = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Tag Management</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => openModal("createTag")}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.buttonText}>Create Tag</Text>
      </TouchableOpacity>
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Achievement Management</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => openModal("createAchievement")}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.buttonText}>Create Achievement</Text>
      </TouchableOpacity>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>{item.description}</Text>
            <Text style={styles.itemDetails}>Type: {item.type}</Text>
          </View>
        )}
      />
    </View>
  );

  const renderModalContent = () => {
    switch (currentAction) {
      case "createQuest":
        return (
          <View>
            <Text style={styles.modalTitle}>Create New Quest</Text>
            <TextInput
              style={styles.input}
              placeholder="Quest Title"
              value={formData.title || ""}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={formData.description || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={formData.category || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, category: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={formData.location || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="XP Reward"
              value={formData.xpReward || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, xpReward: text })
              }
              keyboardType="numeric"
            />
          </View>
        );
      case "createGroup":
        return (
          <View>
            <Text style={styles.modalTitle}>Create New Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={formData.name || ""}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={formData.description || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
            />
          </View>
        );
      case "createTag":
        return (
          <View>
            <Text style={styles.modalTitle}>Create New Tag</Text>
            <TextInput
              style={styles.input}
              placeholder="Tag ID"
              value={formData.id || ""}
              onChangeText={(text) => setFormData({ ...formData, id: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tag Name"
              value={formData.name || ""}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={formData.description || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
            />
          </View>
        );
      case "createAchievement":
        return (
          <View>
            <Text style={styles.modalTitle}>Create New Achievement</Text>
            <TextInput
              style={styles.input}
              placeholder="Achievement Name"
              value={formData.name || ""}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={formData.description || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Type (quest/streak/vote)"
              value={formData.type || ""}
              onChangeText={(text) => setFormData({ ...formData, type: text })}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return renderUsers();
      case "quests":
        return renderQuests();
      case "groups":
        return renderGroups();
      case "tags":
        return renderTags();
      case "achievements":
        return renderAchievements();
      default:
        return renderUsers();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Panel</Text>
      </View>

      <View style={styles.tabContainer}>
        {["users", "quests", "groups", "tags", "achievements"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>{renderTabContent()}</ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <Text style={styles.saveButton}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {renderModalContent()}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  placeholder: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 12,
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  cancelButton: {
    color: "#007AFF",
    fontSize: 16,
  },
  saveButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
});
