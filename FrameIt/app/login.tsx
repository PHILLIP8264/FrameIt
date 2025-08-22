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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const swipeButtonRef = useRef<SwipeButtonRef>(null);
  const { signIn, signInWithGoogle } = useAuth();

  const handleLogin = useCallback(async () => {
    // Clear previous errors
    setEmailError("");
    setPasswordError("");

    // Validate fields and set errors
    let hasErrors = false;

    if (!email) {
      setEmailError("Email is required");
      hasErrors = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasErrors = true;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Return blob to center and then navigate
      // small delay to prevent UI flickering
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        setLoading(false);
        Alert.alert("Invalid email or password");
      }
      if (
        error.code === "auth/missing-password" ||
        error.code === "auth/missing-email"
      ) {
        setLoading(false);
      }

      setLoading(false);
      // Reset swipe button to center on error
      swipeButtonRef.current?.resetToCenter();
    }
  }, [email, password, signIn]);

  const handleGoToSignup = useCallback(() => {
    router.push("/signup");
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Navigation to main app will be handled by AuthContext state change
    } catch (error: any) {
      setLoading(false);
      Alert.alert(
        "Google Sign-In Error",
        error.message || "Failed to sign in with Google"
      );
    }
  }, [signInWithGoogle]);

  return (
    <ImageBackground
      source={require("../assets/images/blank.png")}
      style={styles.backgroundContainer}
      imageStyle={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        key="login-screen"
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to continue your framing</Text>
          </View>

          <View style={styles.form}>
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

            <SwipeButton
              ref={swipeButtonRef}
              leftText="Sign Up"
              rightText="Login"
              centerText="Swipe Me"
              onSwipeLeft={handleGoToSignup}
              onSwipeRight={handleLogin}
              loading={loading}
              disabled={loading}
              instructionText="Swipe left to Sign Up • Swipe right to login"
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
});
