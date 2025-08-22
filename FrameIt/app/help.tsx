import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SupportCard } from "../components/help/SupportCard";
import { FAQItem } from "../components/help/FAQItem";
import { ContactForm } from "../components/help/ContactForm";
import { useHelp } from "../hooks/useHelp";
import { helpStyles } from "../styles/helpStyles";

export default function Help() {
  const {
    expandedFAQ,
    contactForm,
    showContactForm,
    setContactForm,
    setShowContactForm,
    handleCategoryPress,
    submitContactForm,
    openExternalLink,
    toggleFAQ,
    faqData,
    supportCategories,
  } = useHelp();

  if (showContactForm) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ContactForm
          contactForm={contactForm}
          setContactForm={setContactForm}
          onSubmit={submitContactForm}
          onBack={() => setShowContactForm(false)}
        />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={helpStyles.container}>
        {/* Header */}
        <View style={helpStyles.header}>
          <TouchableOpacity
            style={helpStyles.backButton}
            onLongPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#137CD8" />
          </TouchableOpacity>
          <Text style={helpStyles.headerTitle}>Help & Support</Text>
          <TouchableOpacity
            style={helpStyles.contactButton}
            onLongPress={() => setShowContactForm(true)}
          >
            <Ionicons name="mail" size={24} color="#137CD8" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={helpStyles.scrollContainer}
          contentContainerStyle={helpStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={helpStyles.content}>
            {/* Quick Actions */}
            <View style={helpStyles.section}>
              <Text style={helpStyles.sectionTitle}>How can we help you?</Text>

              {supportCategories.map((category) => (
                <SupportCard
                  key={category.id}
                  category={category}
                  onLongPress={() => handleCategoryPress(category.id)}
                />
              ))}
            </View>

            {/* Frequently Asked Questions */}
            <View style={helpStyles.section}>
              <Text style={helpStyles.sectionTitle}>
                Frequently Asked Questions
              </Text>

              {faqData.map((item) => (
                <FAQItem
                  key={item.id}
                  item={item}
                  isExpanded={expandedFAQ === item.id}
                  onToggle={() => toggleFAQ(item.id)}
                />
              ))}
            </View>

            {/* Quick Links */}
            <View style={helpStyles.section}>
              <Text style={helpStyles.sectionTitle}>Quick Links</Text>

              <TouchableOpacity
                style={helpStyles.linkItem}
                onLongPress={() =>
                  openExternalLink("https://frameit-app.com/user-guide")
                }
              >
                <View style={helpStyles.linkLeft}>
                  <Ionicons name="book" size={20} color="#137CD8" />
                  <Text style={helpStyles.linkText}>User Guide</Text>
                </View>
                <Ionicons name="open-outline" size={20} color="#137CD8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={helpStyles.linkItem}
                onLongPress={() =>
                  openExternalLink("https://frameit-app.com/community")
                }
              >
                <View style={helpStyles.linkLeft}>
                  <Ionicons name="people" size={20} color="#137CD8" />
                  <Text style={helpStyles.linkText}>Community Forum</Text>
                </View>
                <Ionicons name="open-outline" size={20} color="#137CD8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={helpStyles.linkItem}
                onLongPress={() =>
                  openExternalLink("https://frameit-app.com/video-tutorials")
                }
              >
                <View style={helpStyles.linkLeft}>
                  <Ionicons name="play-circle" size={20} color="#137CD8" />
                  <Text style={helpStyles.linkText}>Video Tutorials</Text>
                </View>
                <Ionicons name="open-outline" size={20} color="#137CD8" />
              </TouchableOpacity>
            </View>

            {/* Contact Information */}
            <View style={helpStyles.section}>
              <Text style={helpStyles.sectionTitle}>Still need help?</Text>

              <TouchableOpacity
                style={helpStyles.contactCard}
                onLongPress={() => setShowContactForm(true)}
              >
                <View style={helpStyles.contactInfo}>
                  <Ionicons name="mail" size={24} color="#137CD8" />
                  <View style={helpStyles.contactDetails}>
                    <Text style={helpStyles.contactTitle}>
                      Send us a message
                    </Text>
                    <Text style={helpStyles.contactDescription}>
                      Get personalized help from our support team
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#137CD8" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
