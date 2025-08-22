import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TextInput, Alert, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "../../contexts/AuthContext";
import {
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import SwipeButton, { SwipeButtonRef } from "../shared/SwipeButton";

interface EmailModalProps {
  visible: boolean;
  onClose: () => void;
  currentEmail: string;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  visible,
  onClose,
  currentEmail,
}) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const swipeButtonRef = useRef<SwipeButtonRef>(null);

  useEffect(() => {
    if (visible) {
      setEmail(currentEmail);
      setCurrentPassword("");
      setEmailError("");
      setPasswordError("");
    }
  }, [visible, currentEmail]);

  const validateEmail = (): boolean => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Email cannot be empty");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const validatePassword = (): boolean => {
    if (!currentPassword) {
      setPasswordError("Current password is required to change email");
      return false;
    }

    return true;
  };

  const updateUserEmail = async () => {
    if (!user) return;

    setLoading(true);
    setEmailError("");
    setPasswordError("");

    try {
      // Validate inputs
      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();

      if (!isEmailValid || !isPasswordValid) {
        setLoading(false);
        swipeButtonRef.current?.resetToCenter();
        return;
      }

      const trimmedEmail = email.trim();

      // Reauthenticate user before updating email
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Send verification email for the new email address
      await verifyBeforeUpdateEmail(user, trimmedEmail);

      Alert.alert(
        "Verification Required",
        `A verification email has been sent to ${trimmedEmail}. Please check your email and click the verification link to complete the email change. You may need to check your spam folder.\n\nOnce verified, the email will be automatically updated in your account.`,
        [
          {
            text: "OK",
            onLongPress: () => {
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Email update error:", error);

      if (error.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect");
      } else if (error.code === "auth/email-already-in-use") {
        setEmailError("Email is already in use by another account");
      } else if (error.code === "auth/invalid-email") {
        setEmailError("Invalid email address");
      } else if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Error",
          "Please log out and log in again, then try updating"
        );
      } else if (error.code === "auth/operation-not-allowed") {
        Alert.alert(
          "Error",
          "Email change is not allowed. Please contact support."
        );
      } else if (error.code === "auth/too-many-requests") {
        Alert.alert("Error", "Too many requests. Please try again later.");
      } else if (error.code === "auth/quota-exceeded") {
        Alert.alert(
          "Error",
          "Email verification quota exceeded. Please try again later."
        );
      } else {
        Alert.alert("Error", "Failed to update email");
      }

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
              <Text style={styles.title}>Change Email Address</Text>
            </View>

            <View style={styles.content}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={[styles.input, passwordError && styles.inputError]}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Enter current password"
                  secureTextEntry
                  autoFocus
                />
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Email Address</Text>
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="Enter new email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              <SwipeButton
                ref={swipeButtonRef}
                leftText="Cancel"
                rightText="Save"
                centerText={loading ? "Saving..." : "Swipe Me"}
                onSwipeLeft={onClose}
                onSwipeRight={updateUserEmail}
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
