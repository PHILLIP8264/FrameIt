import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { helpStyles } from "../../styles/helpStyles";

interface ContactFormData {
  subject: string;
  message: string;
  category: string;
}

interface ContactFormProps {
  contactForm: ContactFormData;
  setContactForm: (form: ContactFormData) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  contactForm,
  setContactForm,
  onSubmit,
  onBack,
}) => {
  const handleCategorySelect = () => {
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
          onPress: () => setContactForm({ ...contactForm, category: "bug" }),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView style={helpStyles.container}>
      {/* Contact Form Header */}
      <View style={helpStyles.header}>
        <TouchableOpacity style={helpStyles.backButton} onLongPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#137CD8" />
        </TouchableOpacity>
        <Text style={helpStyles.headerTitle}>Contact Support</Text>
        <TouchableOpacity style={helpStyles.submitButton} onLongPress={onSubmit}>
          <Text style={helpStyles.submitButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={helpStyles.formContainer}>
        <View style={helpStyles.formSection}>
          <Text style={helpStyles.formLabel}>Subject</Text>
          <TextInput
            style={helpStyles.formInput}
            value={contactForm.subject}
            onChangeText={(text) =>
              setContactForm({ ...contactForm, subject: text })
            }
            placeholder="Brief description of your issue"
            placeholderTextColor="#999"
          />
        </View>

        <View style={helpStyles.formSection}>
          <Text style={helpStyles.formLabel}>Category</Text>
          <TouchableOpacity
            style={helpStyles.formPicker}
            onLongPress={handleCategorySelect}
          >
            <Text style={helpStyles.formPickerText}>
              {contactForm.category.charAt(0).toUpperCase() +
                contactForm.category.slice(1)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={helpStyles.formSection}>
          <Text style={helpStyles.formLabel}>Message</Text>
          <TextInput
            style={[helpStyles.formInput, helpStyles.formTextArea]}
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

        <View style={helpStyles.formNote}>
          <Ionicons name="information-circle" size={20} color="#137CD8" />
          <Text style={helpStyles.formNoteText}>
            We typically respond to support requests within 24 hours. For urgent
            issues, please include as much detail as possible to help us assist
            you quickly.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
