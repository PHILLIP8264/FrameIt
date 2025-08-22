import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { User } from "../types/database";
import { router } from "expo-router";

export const useSettings = (user: any, logout: () => Promise<void>) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal visibility states
  const [displayNameModalVisible, setDisplayNameModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [profilePhotoModalVisible, setProfilePhotoModalVisible] =
    useState(false);

  // Real-time listener for user data
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as User);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Sync Firebase Auth email changes to Firestore
  useEffect(() => {
    if (!user?.uid || !userData) return;

    // Check if Firebase Auth email differs from Firestore email
    if (user.email && user.email !== userData.email) {
      const syncEmail = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, {
            email: user.email,
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error("Error syncing email to Firestore:", error);
        }
      };

      syncEmail();
    }
  }, [user?.email, userData?.email, user?.uid]);

  const handleProfileImageChange = () => {
    setProfilePhotoModalVisible(true);
  };

  const handlePhotoUpdated = (newPhotoURL: string) => {
    if (userData) {
      setUserData({
        ...userData,
        profileImageUrl: newPhotoURL,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const openDisplayNameModal = () => setDisplayNameModalVisible(true);
  const openEmailModal = () => setEmailModalVisible(true);
  const openPasswordModal = () => setPasswordModalVisible(true);

  const closeDisplayNameModal = () => setDisplayNameModalVisible(false);
  const closeEmailModal = () => setEmailModalVisible(false);
  const closePasswordModal = () => setPasswordModalVisible(false);
  const closeProfilePhotoModal = () => setProfilePhotoModalVisible(false);

  return {
    userData,
    loading,
    // Modal states
    displayNameModalVisible,
    emailModalVisible,
    passwordModalVisible,
    profilePhotoModalVisible,
    // Modal handlers
    handleProfileImageChange,
    handlePhotoUpdated,
    handleSignOut,
    openDisplayNameModal,
    openEmailModal,
    openPasswordModal,
    closeDisplayNameModal,
    closeEmailModal,
    closePasswordModal,
    closeProfilePhotoModal,
  };
};
