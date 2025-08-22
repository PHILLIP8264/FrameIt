import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { privacyStyles } from "../../styles/privacyStyles";

interface PrivacyOptionProps {
  icon: string;
  title: string;
  description: string;
  currentValue: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  onValueChange: (value: string) => void;
}

export const PrivacyOption: React.FC<PrivacyOptionProps> = ({
  icon,
  title,
  description,
  currentValue,
  options,
  onValueChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getCurrentLabel = () => {
    const current = options.find((option) => option.value === currentValue);
    return current?.label || currentValue;
  };

  const handleOptionSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={privacyStyles.optionItem}
        onLongPress={() => setModalVisible(true)}
      >
        <View style={privacyStyles.optionLeft}>
          <Ionicons
            name={icon as any}
            size={24}
            color="#137CD8"
            style={privacyStyles.optionIcon}
          />
          <View style={privacyStyles.optionContent}>
            <Text style={privacyStyles.optionTitle}>{title}</Text>
            <Text style={privacyStyles.optionDescription}>{description}</Text>
          </View>
        </View>
        <View style={privacyStyles.optionRight}>
          <Text style={privacyStyles.optionValue}>{getCurrentLabel()}</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={privacyStyles.modalOverlay}>
          <View style={privacyStyles.modalContent}>
            <View style={privacyStyles.modalHeader}>
              <Text style={privacyStyles.modalTitle}>{title}</Text>
              <TouchableOpacity onLongPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    privacyStyles.optionSelectItem,
                    currentValue === item.value && privacyStyles.selectedOption,
                  ]}
                  onLongPress={() => handleOptionSelect(item.value)}
                >
                  <View style={privacyStyles.optionSelectContent}>
                    <Text
                      style={[
                        privacyStyles.optionSelectLabel,
                        currentValue === item.value &&
                          privacyStyles.selectedLabel,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={privacyStyles.optionSelectDescription}>
                      {item.description}
                    </Text>
                  </View>
                  {currentValue === item.value && (
                    <Ionicons name="checkmark" size={20} color="#137CD8" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};
