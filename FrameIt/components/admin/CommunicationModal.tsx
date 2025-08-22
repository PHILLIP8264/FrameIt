import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminStyles } from "../../styles/adminStyles";

interface CommunicationModalProps {
  visible: boolean;
  communicationType: string;
  messageTitle: string;
  messageContent: string;
  targetAudience: string;
  scheduledDate: string;
  stats: any;
  onClose: () => void;
  onTitleChange: (text: string) => void;
  onContentChange: (text: string) => void;
  onAudienceChange: (audience: string) => void;
  onScheduleChange: (date: string) => void;
  onSend: () => void;
}

export default function CommunicationModal({
  visible,
  communicationType,
  messageTitle,
  messageContent,
  targetAudience,
  scheduledDate,
  stats,
  onClose,
  onTitleChange,
  onContentChange,
  onAudienceChange,
  onScheduleChange,
  onSend,
}: CommunicationModalProps) {
  const getModalTitle = () => {
    switch (communicationType) {
      case "announcement":
        return "Send Announcement";
      case "notification":
        return "Push Notification";
      case "email":
        return "Email Campaign";
      case "alert":
        return "System Alert";
      default:
        return "Send Message";
    }
  };

  const handleSend = () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      Alert.alert("Error", "Please fill in both title and content");
      return;
    }

    Alert.alert(
      "Confirm Send",
      `Send ${communicationType} to ${targetAudience} users${
        scheduledDate ? ` scheduled for ${scheduledDate}` : " now"
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send", onPress: onSend },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={adminStyles.commModalContainer}>
        <View style={adminStyles.commModalContent}>
          <View style={adminStyles.commModalHeader}>
            <Text style={adminStyles.commModalTitle}>{getModalTitle()}</Text>
            <TouchableOpacity
              style={adminStyles.commCloseButton}
              onLongPress={onClose}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Title Input */}
            <View style={adminStyles.commInputGroup}>
              <Text style={adminStyles.commInputLabel}>Title</Text>
              <TextInput
                style={adminStyles.commTextInput}
                value={messageTitle}
                onChangeText={onTitleChange}
                placeholder="Enter message title"
              />
            </View>

            {/* Content Input */}
            <View style={adminStyles.commInputGroup}>
              <Text style={adminStyles.commInputLabel}>Message Content</Text>
              <TextInput
                style={[adminStyles.commTextInput, adminStyles.commTextArea]}
                value={messageContent}
                onChangeText={onContentChange}
                placeholder="Enter your message content here..."
                multiline={true}
                numberOfLines={4}
              />
            </View>

            {/* Target Audience */}
            <View style={adminStyles.commInputGroup}>
              <Text style={adminStyles.commInputLabel}>Target Audience</Text>
              <View style={adminStyles.commPickerContainer}>
                <TouchableOpacity
                  style={[
                    adminStyles.commTextInput,
                    targetAudience === "all" && {
                      backgroundColor: "#E3F2FD",
                    },
                  ]}
                  onLongPress={() => onAudienceChange("all")}
                >
                  <Text>All Users ({stats.totalUsers})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    adminStyles.commTextInput,
                    targetAudience === "active" && {
                      backgroundColor: "#E3F2FD",
                    },
                  ]}
                  onLongPress={() => onAudienceChange("active")}
                >
                  <Text>Active Users ({stats.dailyActiveUsers})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    adminStyles.commTextInput,
                    targetAudience === "teams" && {
                      backgroundColor: "#E3F2FD",
                    },
                  ]}
                  onLongPress={() => onAudienceChange("teams")}
                >
                  <Text>Team Members ({stats.activeTeams} teams)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Schedule Option */}
            <View style={adminStyles.commInputGroup}>
              <Text style={adminStyles.commInputLabel}>
                Schedule (Optional)
              </Text>
              <TextInput
                style={adminStyles.commTextInput}
                value={scheduledDate}
                onChangeText={onScheduleChange}
                placeholder="YYYY-MM-DD HH:MM (leave empty for immediate)"
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={adminStyles.commSendButton}
              onLongPress={handleSend}
            >
              <Text style={adminStyles.commSendButtonText}>
                {scheduledDate
                  ? "Schedule Message"
                  : `Send ${
                      communicationType.charAt(0).toUpperCase() +
                      communicationType.slice(1)
                    }`}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
