import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { settingsStyles } from "../../styles/settingsStyles";
import { UI_TEXT } from "../../constants/settingsData";

interface ProfileImageSectionProps {
  userData: any;
  user: any;
  onProfileImageChange: () => void;
}

export const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({
  userData,
  user,
  onProfileImageChange,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitle}>{UI_TEXT.profilePicture}</Text>
      <View style={settingsStyles.profileImageContainer}>
        <TouchableOpacity
          style={settingsStyles.avatarContainer}
          onLongPress={onProfileImageChange}
        >
          {userData?.profileImageUrl ? (
            <Image
              source={{ uri: userData.profileImageUrl }}
              style={settingsStyles.avatarImage}
            />
          ) : (
            <View style={settingsStyles.avatar}>
              <Text style={settingsStyles.avatarText}>
                {getInitials(
                  userData?.displayName || user?.displayName || "User"
                )}
              </Text>
            </View>
          )}
          <View style={settingsStyles.cameraIconOverlay}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={settingsStyles.changeImageButton}
          onLongPress={onProfileImageChange}
        >
          <Ionicons name="camera" size={22} color="#FFFFFF" />
          <Text style={settingsStyles.changeImageText}>
            {UI_TEXT.changePhoto}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
