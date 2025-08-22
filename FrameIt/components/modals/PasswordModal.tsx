import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TextInput, Alert, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "../../contexts/AuthContext";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import SwipeButton, { SwipeButtonRef } from "../shared/SwipeButton";

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const swipeButtonRef = useRef<SwipeButtonRef>(null);

  useEffect(() => {
    if (visible) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");
    }
  }, [visible]);

  const validatePasswords = (): boolean => {
    let isValid = true;

    // Validate current password
    if (!currentPassword) {
      setCurrentPasswordError("Current password is required");
      isValid = false;
    }

    // Validate new password
    if (!newPassword) {
      setNewPasswordError("New password cannot be empty");
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your new password");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  const updateUserPassword = async () => {
    if (!user) return;

    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    try {
      // Validate inputs
      if (!validatePasswords()) {
        setLoading(false);
        setTimeout(() => {
          swipeButtonRef.current?.resetToCenter();
        }, 100);
        return;
      }

      // Reauthenticate user before updating password
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password in Firebase Auth
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Password updated successfully");
      onClose();
    } catch (error: any) {
      console.error("Password update error:", error);

      if (error.code === "auth/wrong-password") {
        setCurrentPasswordError("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        setNewPasswordError("Password is too weak");
      } else if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Error",
          "Please log out and log in again, then try updating"
        );
      } else {
        Alert.alert("Error", error.message || "Failed to update password");
      }

      setTimeout(() => {
        swipeButtonRef.current?.resetToCenter();
      }, 100);
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
              <Text style={styles.title}>Change Password</Text>
            </View>

            <View style={styles.content}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    currentPasswordError && styles.inputError,
                  ]}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (currentPasswordError) setCurrentPasswordError("");
                  }}
                  placeholder="Enter current password"
                  secureTextEntry
                  autoFocus
                />
                {currentPasswordError ? (
                  <Text style={styles.errorText}>{currentPasswordError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={[styles.input, newPasswordError && styles.inputError]}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (newPasswordError) setNewPasswordError("");
                  }}
                  placeholder="Enter new password"
                  secureTextEntry
                />
                {newPasswordError ? (
                  <Text style={styles.errorText}>{newPasswordError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    confirmPasswordError && styles.inputError,
                  ]}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError("");
                  }}
                  placeholder="Confirm new password"
                  secureTextEntry
                />
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>

              <SwipeButton
                ref={swipeButtonRef}
                leftText="Cancel"
                rightText="Save"
                centerText={loading ? "Saving..." : "Swipe Me"}
                onSwipeLeft={onClose}
                onSwipeRight={updateUserPassword}
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
  inputGroup: {
    marginBottom: 20,
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
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});
