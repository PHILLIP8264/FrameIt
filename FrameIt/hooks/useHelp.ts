import { useState } from "react";
import { Alert, Linking } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { doc, addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import { faqData, supportCategories } from "../constants/helpData";

interface ContactFormData {
  subject: string;
  message: string;
  category: string;
}

export const useHelp = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    subject: "",
    message: "",
    category: "general",
  });
  const [showContactForm, setShowContactForm] = useState(false);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // Show relevant FAQs or actions based on category
    const categoryFAQs = faqData.filter(
      (faq) =>
        faq.category.toLowerCase() === categoryId ||
        (categoryId === "account" && faq.category === "Account") ||
        (categoryId === "challenges" && faq.category === "Challenges") ||
        (categoryId === "technical" && faq.category === "Technical") ||
        (categoryId === "social" && faq.category === "Social")
    );

    if (categoryFAQs.length > 0) {
      // Navigate to FAQ section
      setSelectedCategory(null);
    } else if (categoryId === "feedback") {
      setShowContactForm(true);
    } else {
      // Show category-specific help
      Alert.alert(
        "Help Category",
        `You selected ${
          supportCategories.find((c) => c.id === categoryId)?.title
        }. What would you like to do?`,
        [
          { text: "View FAQs", onPress: () => setSelectedCategory(null) },
          { text: "Contact Support", onPress: () => setShowContactForm(true) },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const submitContactForm = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert("Error", "Please fill in both subject and message fields.");
      return;
    }

    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: user?.uid,
        userEmail: user?.email,
        subject: contactForm.subject,
        message: contactForm.message,
        category: contactForm.category,
        status: "open",
        createdAt: new Date(),
      });

      Alert.alert(
        "Success",
        "Your support request has been submitted. We'll get back to you within 24 hours.",
        [
          {
            text: "OK",
            onPress: () => {
              setShowContactForm(false);
              setContactForm({ subject: "", message: "", category: "general" });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      Alert.alert("Error", "Failed to submit your request. Please try again.");
    }
  };

  const openExternalLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open the link");
    });
  };

  const toggleFAQ = (faqId: number) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return {
    // State
    selectedCategory,
    expandedFAQ,
    contactForm,
    showContactForm,

    // Actions
    setContactForm,
    setShowContactForm,
    handleCategoryPress,
    submitContactForm,
    openExternalLink,
    toggleFAQ,

    // Data
    faqData,
    supportCategories,
  };
};
