import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TextInput, Alert, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import SwipeButton, { SwipeButtonRef } from "../shared/SwipeButton";

interface DisplayNameModalProps {
  visible: boolean;
  onClose: () => void;
  currentDisplayName: string;
}

export const DisplayNameModal: React.FC<DisplayNameModalProps> = ({
  visible,
  onClose,
  currentDisplayName,
}) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const swipeButtonRef = useRef<SwipeButtonRef>(null);

  useEffect(() => {
    if (visible) {
      setDisplayName(currentDisplayName);
      setError("");
    }
  }, [visible, currentDisplayName]);

  const checkDisplayNameAvailability = async (
    name: string
  ): Promise<boolean> => {
    if (!name.trim()) return true;

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("displayName", "==", name.trim()));
      const querySnapshot = await getDocs(q);

      const existingUser = querySnapshot.docs.find(
        (doc) => doc.id !== user?.uid
      );
      return !existingUser;
    } catch (error) {
      console.error("Error checking display name availability:", error);
      return true;
    }
  };

  const validateDisplayName = async (): Promise<boolean> => {
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setError("Display name cannot be empty");
      return false;
    }

    if (trimmedName.length < 2) {
      setError("Display name must be at least 2 characters");
      return false;
    }

    if (trimmedName.length > 30) {
      setError("Display name must be less than 30 characters");
      return false;
    }

    const isAvailable = await checkDisplayNameAvailability(trimmedName);
    if (!isAvailable) {
      setError("Display name is already taken");
      return false;
    }

    return true;
  };

  const updateDisplayName = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const isValid = await validateDisplayName();
      if (!isValid) {
        setLoading(false);
        swipeButtonRef.current?.resetToCenter();
        return;
      }
      const trimmedName = displayName.trim();
      // Update display name in Firestore user document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: trimmedName,
        updatedAt: new Date(),
      });

      Alert.alert("Success", "Display name updated successfully");
      onClose();
    } catch (error: any) {
      console.error("Display name update error:", error);
      setError(error.message || "Failed to update display name");
      swipeButtonRef.current?.resetToCenter();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Change Display Name</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  if (error) setError("");
                }}
                placeholder="Enter display name"
                maxLength={30}
                autoFocus
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <SwipeButton
                ref={swipeButtonRef}
                leftText="Cancel"
                rightText="Save"
                centerText={loading ? "Saving..." : "Swipe Me"}
                onSwipeLeft={onClose}
                onSwipeRight={updateDisplayName}
                loading={loading}
                disabled={loading}
                instructionText="Swipe left to Cancel • Swipe right to Save"
              />
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    marginBottom: 10,
  },
});
