import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { notificationStyles } from "../../styles/notificationStyles";
import { notificationTypeConfig } from "../../constants/notificationData";
import NotificationService from "../../services/NotificationService";

interface NotificationItemProps {
  item: any;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  onMarkAsRead,
}) => {
  const getNotificationConfig = (type: string) => {
    return (
      notificationTypeConfig[type as keyof typeof notificationTypeConfig] ||
      notificationTypeConfig.default
    );
  };

  const config = getNotificationConfig(item.type);

  return (
    <TouchableOpacity
      style={[
        notificationStyles.notificationItem,
        !item.read && notificationStyles.unreadItem,
      ]}
      onLongPress={() => {
        NotificationService.markAsRead(item.id);
        onMarkAsRead(item.id);
      }}
    >
      <View
        style={[
          notificationStyles.notificationIcon,
          { backgroundColor: config.color },
        ]}
      >
        <Ionicons name={config.icon as any} size={20} color="#fff" />
      </View>
      <View style={notificationStyles.notificationContent}>
        <Text style={notificationStyles.notificationTitle}>{item.title}</Text>
        <Text style={notificationStyles.notificationBody}>{item.body}</Text>
        <Text style={notificationStyles.notificationTime}>
          {item.createdAt?.toLocaleTimeString()}
        </Text>
      </View>
      {!item.read && <View style={notificationStyles.unreadDot} />}
    </TouchableOpacity>
  );
};
