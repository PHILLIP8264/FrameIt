import React, { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Linking,
  TextInput,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { doc, addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import * as Haptics from "expo-haptics";

// FAQ Data
const faqData = [
  {
    id: 1,
    question: "How do I complete a challenge?",
    answer:
      "To complete a challenge, navigate to the location shown on the map, take a photo that meets the requirements, and submit it through the app. Make sure you're within the required radius of the location.",
    category: "Challenges",
    icon: "flag",
  },
  {
    id: 2,
    question: "Why can't I see new challenges?",
    answer:
      "New challenges may not appear if: 1) You don't have location permissions enabled, 2) There are no active challenges in your area, 3) You've already completed all available challenges. Check your settings and try refreshing the app.",
    category: "Challenges",
    icon: "refresh",
  },
  {
    id: 3,
    question: "How does the XP system work?",
    answer:
      "You earn XP (Experience Points) by completing challenges, voting on submissions, and achieving streaks. Different challenges offer different XP rewards based on difficulty. XP helps you level up and unlock new features.",
    category: "Progress",
    icon: "trophy",
  },
  {
    id: 4,
    question: "Can I change my display name?",
    answer:
      "Yes! Go to Settings > Account Information and slide the 'Display Name' option to edit it. Your display name must be unique and follow our community guidelines.",
    category: "Account",
    icon: "person",
  },
  {
    id: 5,
    question: "How do I add friends?",
    answer:
      "You can add friends by searching for their display name in the Friends section, or by sharing your profile with them. Make sure your privacy settings allow friend requests.",
    category: "Social",
    icon: "people",
  },
  {
    id: 6,
    question: "What if my photo submission is rejected?",
    answer:
      "Photos may be rejected if they don't meet the challenge requirements, are inappropriate, or don't show the required location/subject. You can retry the challenge with a new photo that better meets the criteria.",
    category: "Submissions",
    icon: "camera",
  },
  {
    id: 7,
    question: "How do I enable location services?",
    answer:
      "Go to your device Settings > Apps > FrameIt > Permissions > Location and enable 'Allow all the time' or 'Allow while using app'. Location access is required for location-based challenges.",
    category: "Technical",
    icon: "location",
  },
  {
    id: 8,
    question: "Why is the app running slowly?",
    answer:
      "Try these steps: 1) Close and restart the app, 2) Check your internet connection, 3) Clear the app cache, 4) Make sure you have enough storage space, 5) Update to the latest version.",
    category: "Technical",
    icon: "speedometer",
  },
];

// Support Categories
const supportCategories = [
  {
    id: "account",
    title: "Account & Profile",
    icon: "person-circle",
    color: "#007AFF",
    description: "Manage your account settings and profile",
  },
  {
    id: "challenges",
    title: "Challenges & Quests",
    icon: "flag",
    color: "#34C759",
    description: "Help with completing and finding challenges",
  },
  {
    id: "technical",
    title: "Technical Issues",
    icon: "bug",
    color: "#FF3B30",
    description: "App performance and technical problems",
  },
  {
    id: "social",
    title: "Friends & Social",
    icon: "people",
    color: "#AF52DE",
    description: "Connect with friends and social features",
  },
  {
    id: "privacy",
    title: "Privacy & Safety",
    icon: "shield",
    color: "#FF9500",
    description: "Privacy settings and safety guidelines",
  },
  {
    id: "feedback",
    title: "Feedback & Suggestions",
    icon: "chatbubble",
    color: "#32D74B",
    description: "Share your ideas and feedback with us",
  },
];

// Animated Support Card Component
interface SupportCardProps {
  category: (typeof supportCategories)[0];
  onPress: () => void;
}

const SupportCard: React.FC<SupportCardProps> = ({ category, onPress }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const blobTranslateX = useRef(new Animated.Value(0)).current;
  const blobScale = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        if (isDragging) {
          const maxTranslation = 80;
          const clampedTranslation = Math.max(
            0,
            Math.min(maxTranslation, event.nativeEvent.translationX)
          );
          blobTranslateX.setValue(clampedTranslation);

          const scaleValue = 1 + (clampedTranslation / maxTranslation) * 0.1;
          blobScale.setValue(scaleValue);
        }
      },
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
      Animated.spring(containerScale, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }).start();
    } else if (event.nativeEvent.state === State.END) {
      setIsDragging(false);
      const { translationX: tx, velocityX } = event.nativeEvent;

      if (tx > 50 || velocityX > 300) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Animated.parallel([
          Animated.timing(blobTranslateX, {
            toValue: 100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(blobScale, {
            toValue: 1.2,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Reset animations
          Animated.parallel([
            Animated.spring(blobTranslateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }),
            Animated.spring(blobScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }),
            Animated.spring(containerScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 12,
            }),
          ]).start();
          onPress();
        });
      } else {
        // Return to start
        Animated.parallel([
          Animated.spring(blobTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }),
          Animated.spring(blobScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }),
          Animated.spring(containerScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 12,
          }),
        ]).start();
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 12,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.supportCard,
          {
            transform: [{ translateX }, { scale: containerScale }],
          },
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Ionicons
              name={category.icon as any}
              size={20}
              color={category.color}
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{category.title}</Text>
              <Text style={styles.cardDescription}>{category.description}</Text>
            </View>
          </View>
          <View style={styles.slideHint}>
            <Text style={styles.slideHintText}>Slide to explore</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </View>
        </View>

        {/* Sliding blob */}
        <Animated.View
          style={[
            styles.slideBlob,
            {
              backgroundColor: category.color,
              transform: [{ translateX: blobTranslateX }, { scale: blobScale }],
            },
          ]}
        >
          <Ionicons name="help-circle" size={20} color="#fff" />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

// FAQ Item Component
interface FAQItemProps {
  item: (typeof faqData)[0];
  isExpanded: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ item, isExpanded, onToggle }) => {
  return (
    <TouchableOpacity style={styles.faqItem} onPress={onToggle}>
      <View style={styles.faqHeader}>
        <View style={styles.faqLeft}>
          <Ionicons name={item.icon as any} size={18} color="#007AFF" />
          <Text style={styles.faqQuestion}>{item.question}</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#999"
        />
      </View>
      {isExpanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function Help() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
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

  if (showContactForm) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          {/* Contact Form Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowContactForm(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Contact Support</Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitContactForm}
            >
              <Text style={styles.submitButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Subject</Text>
              <TextInput
                style={styles.formInput}
                value={contactForm.subject}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, subject: text })
                }
                placeholder="Brief description of your issue"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <TouchableOpacity
                style={styles.formPicker}
                onPress={() => {
                  Alert.alert(
                    "Select Category",
                    "Choose the category that best describes your issue",
                    [
                      {
                        text: "General",
                        onPress: () =>
                          setContactForm({
                            ...contactForm,
                            category: "general",
                          }),
                      },
                      {
                        text: "Technical Issue",
                        onPress: () =>
                          setContactForm({
                            ...contactForm,
                            category: "technical",
                          }),
                      },
                      {
                        text: "Account Problem",
                        onPress: () =>
                          setContactForm({
                            ...contactForm,
                            category: "account",
                          }),
                      },
                      {
                        text: "Feature Request",
                        onPress: () =>
                          setContactForm({
                            ...contactForm,
                            category: "feature",
                          }),
                      },
                      {
                        text: "Bug Report",
                        onPress: () =>
                          setContactForm({ ...contactForm, category: "bug" }),
                      },
                      { text: "Cancel", style: "cancel" },
                    ]
                  );
                }}
              >
                <Text style={styles.formPickerText}>
                  {contactForm.category.charAt(0).toUpperCase() +
                    contactForm.category.slice(1)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Message</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={contactForm.message}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, message: text })
                }
                placeholder="Please describe your issue in detail..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formNote}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.formNoteText}>
                We typically respond within 24 hours. For urgent issues, please
                include as much detail as possible.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => setShowContactForm(true)}
          >
            <Ionicons name="mail" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How can we help you?</Text>

              {supportCategories.map((category) => (
                <SupportCard
                  key={category.id}
                  category={category}
                  onPress={() => handleCategoryPress(category.id)}
                />
              ))}
            </View>

            {/* Frequently Asked Questions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Frequently Asked Questions
              </Text>

              {faqData.map((item) => (
                <FAQItem
                  key={item.id}
                  item={item}
                  isExpanded={expandedFAQ === item.id}
                  onToggle={() =>
                    setExpandedFAQ(expandedFAQ === item.id ? null : item.id)
                  }
                />
              ))}
            </View>

            {/* Quick Links */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Links</Text>

              <TouchableOpacity
                style={styles.linkItem}
                onPress={() =>
                  openExternalLink("https://your-app.com/user-guide")
                }
              >
                <View style={styles.linkLeft}>
                  <Ionicons name="book" size={20} color="#007AFF" />
                  <Text style={styles.linkText}>User Guide</Text>
                </View>
                <Ionicons name="open-outline" size={20} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkItem}
                onPress={() =>
                  openExternalLink("https://your-app.com/community")
                }
              >
                <View style={styles.linkLeft}>
                  <Ionicons name="people" size={20} color="#007AFF" />
                  <Text style={styles.linkText}>Community Forum</Text>
                </View>
                <Ionicons name="open-outline" size={20} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkItem}
                onPress={() =>
                  openExternalLink("https://your-app.com/video-tutorials")
                }
              >
                <View style={styles.linkLeft}>
                  <Ionicons name="play-circle" size={20} color="#007AFF" />
                  <Text style={styles.linkText}>Video Tutorials</Text>
                </View>
                <Ionicons name="open-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Still need help?</Text>

              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => setShowContactForm(true)}
              >
                <View style={styles.contactInfo}>
                  <Ionicons name="mail" size={24} color="#007AFF" />
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactTitle}>Send us a message</Text>
                    <Text style={styles.contactDescription}>
                      Get personalized help from our support team
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#007AFF",
  },
  contactButton: {
    padding: 8,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 15,
  },
  supportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden" as const,
    position: "relative" as const,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  cardContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 20,
    paddingLeft: 70,
    zIndex: 2,
  },
  cardLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  cardInfo: {
    marginLeft: 15,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  slideHint: {
    alignItems: "flex-end" as const,
    opacity: 0.7,
  },
  slideHintText: {
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "500" as const,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  slideBlob: {
    position: "absolute" as const,
    left: 6,
    top: 6,
    bottom: 6,
    width: 56,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden" as const,
  },
  faqHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 16,
  },
  faqLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginLeft: 30,
  },
  linkItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#333",
    marginLeft: 12,
  },
  contactCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
  },
  contactInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  contactDetails: {
    marginLeft: 15,
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
  },
  contactDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  // Contact Form Styles
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginTop: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTextArea: {
    height: 120,
  },
  formPicker: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formPickerText: {
    fontSize: 16,
    color: "#333",
  },
  formNote: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  formNoteText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
};
