import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Keyboard,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import FirestoreService from "../services/FirestoreService";
import { Friend, FriendRequest, User } from "../types/database";

interface FriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FriendsModal({ visible, onClose }: FriendsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "search">(
    "search"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  // Debounced search functionality
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Load friends and friend requests when modal opens
  useEffect(() => {
    if (visible && user?.uid) {
      loadFriendsData();
      setSearchTerm(""); // Clear search when opening
      setSearchResults([]); // Clear search results
    }
  }, [visible, user?.uid]);

  // Real-time search with debouncing
  useEffect(() => {
    if (activeTab === "search" && searchTerm.trim().length > 0) {
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for debounced search
      const timeout = setTimeout(() => {
        handleRealtimeSearch(searchTerm.trim());
      }, 300); // 300ms delay

      setSearchTimeout(timeout as any);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    } else if (activeTab === "search" && searchTerm.trim().length === 0) {
      setSearchResults([]);
      setSearchLoading(false);
    }
  }, [searchTerm, activeTab, user?.uid]);

  const handleRealtimeSearch = async (term: string) => {
    if (!user?.uid || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await FirestoreService.searchUsers(term, user.uid);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadFriendsData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const [friendsData, requestsData, sentRequestsData] = await Promise.all([
        FirestoreService.getUserFriends(user.uid),
        FirestoreService.getFriendRequests(user.uid),
        FirestoreService.getSentFriendRequests(user.uid),
      ]);

      setFriends(friendsData);
      setFriendRequests(requestsData);
      setSentRequests(sentRequestsData);
    } catch (error) {
      console.error("Error loading friends data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (toUserId: string) => {
    if (!user?.uid) return;

    try {
      await FirestoreService.sendFriendRequest(user.uid, toUserId);
      Alert.alert("Success", "Friend request sent!");
      // Remove user from search results
      setSearchResults((prev) => prev.filter((u) => u.userId !== toUserId));
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      const message = error.message || "Failed to send friend request";
      Alert.alert("Error", message);
    }
  };

  const handleAcceptFriendRequest = async (request: any) => {
    if (!user?.uid) return;

    try {
      await FirestoreService.acceptFriendRequest(
        request.id,
        request.fromUserId,
        user.uid
      );
      Alert.alert("Success", "Friend request accepted!");
      loadFriendsData(); // Refresh data
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Alert.alert("Error", "Failed to accept friend request");
    }
  };

  const handleDeclineFriendRequest = async (requestId: string) => {
    try {
      await FirestoreService.declineFriendRequest(requestId);
      loadFriendsData(); // Refresh data
    } catch (error) {
      console.error("Error declining friend request:", error);
      Alert.alert("Error", "Failed to decline friend request");
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user?.uid) return;

    Alert.alert(
      "Remove Friend",
      "Are you sure you want to remove this friend?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await FirestoreService.removeFriend(user.uid, friendId);
              loadFriendsData(); // Refresh data
            } catch (error) {
              console.error("Error removing friend:", error);
              Alert.alert("Error", "Failed to remove friend");
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendInfo}>
        {item.profileImageUrl ? (
          <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {getInitials(item.displayName)}
            </Text>
          </View>
        )}
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendLevel}>Level {item.level}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFriend(item.friendId)}
      >
        <Ionicons name="person-remove" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const renderFriendRequest = ({ item }: { item: any }) => (
    <View style={styles.requestItem}>
      <View style={styles.friendInfo}>
        {item.fromUserImage ? (
          <Image source={{ uri: item.fromUserImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {getInitials(item.fromUserName)}
            </Text>
          </View>
        )}
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.fromUserName}</Text>
          <Text style={styles.requestText}>wants to be friends</Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptFriendRequest(item)}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleDeclineFriendRequest(item.id)}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResult = ({ item }: { item: User }) => {
    // Check if user already sent a request to this person
    const alreadySentRequest = sentRequests.some(
      (req) => req.toUserId === item.userId
    );

    // Check if this user is already a friend
    const isAlreadyFriend = friends.some(
      (friend) => friend.friendId === item.userId
    );

    return (
      <View style={styles.searchItem}>
        <View style={styles.friendInfo}>
          {item.profileImageUrl ? (
            <Image
              source={{ uri: item.profileImageUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {getInitials(item.displayName)}
              </Text>
            </View>
          )}
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>{item.displayName}</Text>
            <Text style={styles.friendLevel}>Level {item.level}</Text>
          </View>
        </View>
        {isAlreadyFriend ? (
          <View style={styles.friendsButton}>
            <Text style={styles.friendsButtonText}>Friends</Text>
          </View>
        ) : alreadySentRequest ? (
          <View style={styles.sentButton}>
            <Text style={styles.sentButtonText}>Sent</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleSendFriendRequest(item.userId)}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "friends":
        return (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.friendId}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>No friends yet</Text>
                <Text style={styles.emptySubtext}>
                  Search for users to add as friends!
                </Text>
              </View>
            }
          />
        );

      case "requests":
        return (
          <FlatList
            data={friendRequests}
            renderItem={renderFriendRequest}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="mail-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>No friend requests</Text>
              </View>
            }
          />
        );

      case "search":
        return (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#8E8E93"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="🔍 Search friends by name or email..."
                  placeholderTextColor="#8E8E93"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchLoading && (
                  <ActivityIndicator
                    size="small"
                    color="#007AFF"
                    style={styles.loadingIndicator}
                  />
                )}
              </View>
            </View>

            {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>
                  Type at least 2 characters to search
                </Text>
              </View>
            )}

            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.userId}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                searchResults.length === 0
                  ? styles.emptyListContainer
                  : undefined
              }
              ListEmptyComponent={
                searchTerm.trim().length >= 2 && !searchLoading ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={64} color="#CCC" />
                    <Text style={styles.emptyText}>No users found</Text>
                    <Text style={styles.emptySubtext}>
                      Try searching with different keywords
                    </Text>
                  </View>
                ) : searchTerm.trim().length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={64} color="#007AFF" />
                    <Text style={styles.emptyText}>Find New Friends</Text>
                    <Text style={styles.emptySubtext}>
                      Enter a name or email to search for users
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Friends</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "friends" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("friends")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "friends" && styles.activeTabText,
                    ]}
                  >
                    Friends ({friends.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "requests" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("requests")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "requests" && styles.activeTabText,
                    ]}
                  >
                    Requests ({friendRequests.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "search" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("search")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "search" && styles.activeTabText,
                    ]}
                  >
                    Search
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tabContent}>{renderTabContent()}</View>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  container: {
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
  },
  header: {
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  closeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "#F1F1F6",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "500",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#E5E5E7",
  },
  avatarPlaceholder: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  friendDetails: {
    flex: 1,
    paddingRight: 12,
  },
  friendName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  friendLevel: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  requestText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  removeButton: {
    padding: 8,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  declineButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  sentButton: {
    backgroundColor: "#8E8E93",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8E8E93",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  sentButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  friendsButton: {
    backgroundColor: "#34C759",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  friendsButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  searchInputContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1D1D1F",
    fontWeight: "500",
    paddingVertical: 12,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  hintContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF3CD",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  hintText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
  },
  emptyListContainer: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D1D1F",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
});
