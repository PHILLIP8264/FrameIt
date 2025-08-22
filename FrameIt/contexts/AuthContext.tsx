import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import NotificationService from "../services/NotificationService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Initialize notification service when user signs in
      if (user) {
        try {
          await NotificationService.initialize();
        } catch (error) {
          console.error("Error initializing notification service:", error);
        }
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user's profile in Firebase Auth
      await updateProfile(user, {
        displayName: displayName,
      });

      // Save user data to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        userId: user.uid,
        displayName: displayName,
        email: email,
        role: "basic",
        xp: 0,
        level: 1,
        signedUpDate: new Date().toISOString(),
        streakCount: 0,
        profileImageUrl: "",
        tag: "beginner",
        teams: [],
        primaryTeam: null,
        notificationSettings: {
          questCompletion: true,
          teamInvites: true,
          contestResults: true,
          dailyReminders: true,
          achievements: true,
          moderation: true,
        },
      });
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    throw new Error(
      "Google Sign-In is not available in Expo Go. Please use email/password authentication."
    );
  };

  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
