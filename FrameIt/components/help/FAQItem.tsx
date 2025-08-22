import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { helpStyles } from "../../styles/helpStyles";
import { faqData } from "../../constants/helpData";

interface FAQItemProps {
  item: (typeof faqData)[0];
  isExpanded: boolean;
  onToggle: () => void;
}

export const FAQItem: React.FC<FAQItemProps> = ({
  item,
  isExpanded,
  onToggle,
}) => {
  return (
    <TouchableOpacity style={helpStyles.faqItem} onLongPress={onToggle}>
      <View style={helpStyles.faqHeader}>
        <View style={helpStyles.faqLeft}>
          <Ionicons name={item.icon as any} size={18} color="#137CD8" />
          <Text style={helpStyles.faqQuestion}>{item.question}</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#999"
        />
      </View>
      {isExpanded && (
        <View style={helpStyles.faqAnswer}>
          <Text style={helpStyles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
