import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import SwipeButton, { SwipeButtonRef } from "../components/shared/SwipeButton";
import { db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

  const swipeButtonRef = useRef<SwipeButtonRef>(null);
  const { signUp, signInWithGoogle } = useAuth();

  const checkDisplayNameAvailability = async (
    name: string
  ): Promise<boolean> => {
    if (!name.trim()) return true;

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("displayName", "==", name.trim()));
      const querySnapshot = await getDocs(q);

      return querySnapshot.empty;
    } catch (error) {
      console.error("Error checking display name availability:", error);
      return true; // Allow signup if check fails
    }
  };

  const handleSignup = useCallback(async () => {
    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setDisplayNameError("");

    // Validate fields and set errors
    let hasErrors = false;

    if (!displayName) {
      setDisplayNameError("Display name is required");
      hasErrors = true;
    }

    if (!email) {
      setEmailError("Email is required");
      hasErrors = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasErrors = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasErrors = true;
    }

    setLoading(true);

    try {
      // Check display name availability
      const isDisplayNameAvailable = await checkDisplayNameAvailability(
        displayName
      );
      if (!isDisplayNameAvailable) {
        setDisplayNameError("Display name is already taken");
        setLoading(false);
        swipeButtonRef.current?.resetToCenter();
        return;
      }

      await signUp(email, password, displayName);

      // Add a small delay to prevent UI flickering
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);
    } catch (error: any) {
      setLoading(false);
      swipeButtonRef.current?.resetToCenter();

      if (error.code === "auth/email-already-in-use") {
        setEmailError("Email is already in use");
      }
      if (error.code === "auth/invalid-email") {
        setEmailError("Invalid email address");
      }
      if (error.message?.includes("display name")) {
        setDisplayNameError("Unable to verify display name availability");
      }
    }
  }, [email, password, confirmPassword, displayName, signUp]);

  const handleGoToLogin = useCallback(() => {
    router.push("/login");
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/blank.png")}
      style={styles.backgroundContainer}
      imageStyle={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join FrameIt and start your creative journey
            </Text>
          </View>

          <View style={styles.form}>
            <View>
              <View
                style={[
                  styles.inputContainer,
                  displayNameError && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={displayNameError ? "#FF3B30" : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Display Name"
                  value={displayName}
                  onChangeText={(text) => {
                    setDisplayName(text);
                    if (displayNameError) setDisplayNameError("");
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {displayNameError ? (
                <Text style={styles.errorText}>{displayNameError}</Text>
              ) : null}
            </View>

            <View>
              <View
                style={[
                  styles.inputContainer,
                  emailError && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailError ? "#FF3B30" : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <View>
              <View
                style={[
                  styles.inputContainer,
                  passwordError && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordError ? "#FF3B30" : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onLongPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={passwordError ? "#FF3B30" : "#666"}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <View>
              <View
                style={[
                  styles.inputContainer,
                  confirmPasswordError && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={confirmPasswordError ? "#FF3B30" : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError("");
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onLongPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color={confirmPasswordError ? "#FF3B30" : "#666"}
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            <SwipeButton
              ref={swipeButtonRef}
              leftText="Login"
              rightText="Sign Up"
              centerText="Swipe Me"
              onSwipeLeft={handleGoToLogin}
              onSwipeRight={handleSignup}
              loading={loading}
              disabled={loading}
              instructionText="Swipe left to Login • Swipe right to Sign Up"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 1,
    resizeMode: "cover" as const,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputContainerError: {
    borderColor: "#FF3B30",
    marginBottom: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginLeft: 16,
    marginBottom: 12,
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 4,
  },
  signupButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonDisabled: {
    backgroundColor: "#999",
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
