import React from "react";
import { Text, View, Image, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { galleryStyles as styles } from "../../styles";
import { Quest, Submission } from "../../types/database";

interface DiscoveryWithDetails extends Submission {
  id: string;
  quest?: Quest;
  questTitle: string;
  location: string;
  category: string;
  xp?: number;
  photoUrl: string;
}

interface PhotoViewerData {
  visible: boolean;
  photo?: DiscoveryWithDetails;
}

interface PhotoViewerModalProps {
  photoViewer: PhotoViewerData;
  onClose: () => void;
  onShare: (photo: DiscoveryWithDetails) => void;
}

const formatTimestamp = (timestamp: any): string => {
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString();
  }
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString();
  }
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  return "Unknown date";
};

export const PhotoViewerModal = ({
  photoViewer,
  onClose,
  onShare,
}: PhotoViewerModalProps) => {
  return (
    <Modal
      visible={photoViewer.visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.photoModal}>
        <View style={styles.photoModalHeader}>
          <Text style={styles.photoModalTitle}>
            {photoViewer.photo?.questTitle || "Photo"}
          </Text>
          <Pressable onLongPress={onClose} style={styles.photoModalClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.photoModalContent}>
          {photoViewer.photo && (
            <Image
              source={{ uri: photoViewer.photo.photoUrl }}
              style={styles.photoModalImage}
              resizeMode="cover"
            />
          )}
        </View>

        {photoViewer.photo && (
          <View style={styles.photoModalFooter}>
            <View style={styles.photoModalInfo}>
              <Text style={styles.photoModalQuestTitle}>
                {photoViewer.photo.questTitle}
              </Text>
              <Text style={styles.photoModalLocation}>
                {photoViewer.photo.location}
              </Text>

              <View style={styles.photoModalStats}>
                <View style={styles.photoModalStat}>
                  <Text style={styles.photoModalStatValue}>
                    +{photoViewer.photo.xp}
                  </Text>
                  <Text style={styles.photoModalStatLabel}>XP</Text>
                </View>
                <View style={styles.photoModalStat}>
                  <Text style={styles.photoModalStatValue}>
                    {formatTimestamp(photoViewer.photo.timestamp)}
                  </Text>
                  <Text style={styles.photoModalStatLabel}>Date</Text>
                </View>
              </View>
            </View>

            <View style={styles.photoModalActions}>
              <Pressable
                style={styles.photoModalAction}
                onLongPress={() => onShare(photoViewer.photo!)}
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.photoModalActionText}>Share</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.photoModalAction,
                  styles.photoModalActionPrimary,
                ]}
                onLongPress={onClose}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.photoModalActionText}>Done</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};
