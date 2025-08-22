import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import NotificationService from "../../services/NotificationService";

interface NotificationData {
  id: string;
  userId: string;
  type:
    | "quest_completion"
    | "contest_result"
    | "team_invite"
    | "friend_request"
    | "moderation_result"
    | "achievement_unlocked"
    | "daily_reminder"
    | "team_quest"
    | "level_up";
  title: string;
  body: string;
  data?: any;
  read: boolean;
  dismissed?: boolean;
  createdAt: Date;
}

interface NotificationSectionProps {
  maxHeight?: number;
}

export default function NotificationSection({
  maxHeight = 200,
}: NotificationSectionProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    loadNotifications();

    // Listen for new notifications
    const unsubscribe = NotificationService.onNewNotification(
      (notification) => {
        setNotifications((prev) => [notification, ...prev.slice(0, 4)]); // Keep latest 5
        setUnreadCount((prev) => prev + 1);
      }
    );

    // Set up real-time listener
    const unsubscribeRealtime =
      NotificationService.subscribeToUserNotifications(
        user.uid,
        (notification) => {}
      );

    return () => {
      unsubscribe();
      unsubscribeRealtime();
    };
  }, [user?.uid]);

  const loadNotifications = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const recentNotifications =
        await NotificationService.getRecentNotifications(user.uid, 5);
      setNotifications(recentNotifications);

      const badgeCount = await NotificationService.getBadgeCount(user.uid);
      setUnreadCount(badgeCount);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await NotificationService.markAllAsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      Alert.alert("Error", "Failed to mark all notifications as read");
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      // Remove from local state immediately for smooth UX
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Update unread count if it was unread
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Mark as dismissed in the backend
      await NotificationService.dismissNotification(notificationId);
    } catch (error) {
      console.error("Error dismissing notification:", error);

      loadNotifications();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "quest_completion":
        return "checkmark-circle";
      case "achievement_unlocked":
        return "trophy";
      case "level_up":
        return "arrow-up-circle";
      case "contest_result":
        return "podium";
      case "team_invite":
        return "people";
      case "team_quest":
        return "flag";
      case "moderation_result":
        return "shield-checkmark";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "quest_completion":
        return "#4CAF50";
      case "achievement_unlocked":
        return "#FFD700";
      case "level_up":
        return "#2196F3";
      case "contest_result":
        return "#FF9800";
      case "team_invite":
        return "#9C27B0";
      case "team_quest":
        return "#607D8B";
      case "moderation_result":
        return "#795548";
      default:
        return "#757575";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const SwipeableNotification = ({
    notification,
  }: {
    notification: NotificationData;
  }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const screenWidth = Dimensions.get("window").width;

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = screenWidth * 0.3;

        if (Math.abs(gestureState.dx) > swipeThreshold) {
          // Swipe threshold reached - dismiss notification
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: gestureState.dx > 0 ? screenWidth : -screenWidth,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            dismissNotification(notification.id);
          });
        } else {
          // Snap back to original position
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    return (
      <Animated.View
        style={[
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.notificationItem,
            !notification.read && styles.unreadNotification,
          ]}
          onLongPress={() => !notification.read && markAsRead(notification.id)}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getNotificationColor(notification.type) },
            ]}
          >
            <Ionicons
              name={getNotificationIcon(notification.type) as any}
              size={20}
              color="white"
            />
          </View>

          <View style={styles.notificationContent}>
            <Text
              style={[
                styles.notificationTitle,
                !notification.read && styles.unreadText,
              ]}
            >
              {notification.title}
            </Text>
            <Text style={styles.notificationBody} numberOfLines={2}>
              {notification.body}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(notification.createdAt)}
            </Text>
          </View>

          {!notification.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <SwipeableNotification notification={item} />
  );

  if (!user?.uid) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="notifications" size={20} color="#333" />
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <Text style={styles.swipeHint}>Swipe to dismiss</Text>
          )}
          {unreadCount > 0 && (
            <TouchableOpacity
              onLongPress={markAllAsRead}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off" size={40} color="#ccc" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView
          style={[styles.list, { maxHeight }]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {notifications.map((notification) => (
            <View key={notification.id}>
              {renderNotification({ item: notification })}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  badge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  markAllText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  list: {
    flexGrow: 0,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  unreadNotification: {
    backgroundColor: "#F0F9FF",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: "700",
  },
  notificationBody: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
    color: "#999",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  headerActions: {
    alignItems: "flex-end",
    gap: 4,
  },
  swipeHint: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
});
