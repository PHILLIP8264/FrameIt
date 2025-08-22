import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { settingsStyles } from "../../styles/settingsStyles";
import { SETTINGS_SECTIONS } from "../../constants/settingsData";

interface SettingItemProps {
  icon: string;
  label: string;
  value?: string;
  route?: string;
  onLongPress?: () => void;
  isSignOut?: boolean;
  isLast?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  value,
  route,
  onLongPress,
  isSignOut = false,
  isLast = false,
}) => {
  const handlePress = () => {
    if (onLongPress) {
      onLongPress();
    } else if (route) {
      router.push(route as any);
    }
  };

  const itemStyle = isSignOut
    ? [settingsStyles.settingItem, settingsStyles.signOutButton]
    : [
        {
          ...settingsStyles.settingItem,
          marginHorizontal: 0,
          marginBottom: 0,
          borderRadius: 0,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: "rgba(0, 0, 0, 0.05)",
          shadowOpacity: 0,
          elevation: 0,
          borderWidth: 0,
        },
      ];

  return (
    <TouchableOpacity style={itemStyle} onLongPress={handlePress}>
      <View style={settingsStyles.settingLeft}>
        <Ionicons
          name={icon as any}
          size={isSignOut ? 20 : 20}
          color={isSignOut ? "#DC2626" : "#007AFF"}
        />
        {value ? (
          <View style={settingsStyles.settingInfo}>
            <Text
              style={[
                settingsStyles.settingLabel,
                isSignOut && settingsStyles.signOutText,
              ]}
            >
              {label}
            </Text>
            <Text style={settingsStyles.settingValue}>{value}</Text>
          </View>
        ) : (
          <Text
            style={[
              settingsStyles.settingLabel,
              isSignOut && settingsStyles.signOutText,
              { marginLeft: 14 },
            ]}
          >
            {label}
          </Text>
        )}
      </View>
      {!isSignOut && (
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
};

interface SettingsSectionProps {
  title: string;
  items: any[];
  renderItem?: (item: any, index: number) => React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  items,
  renderItem,
}) => {
  return (
    <View style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitle}>{title}</Text>
      <View style={settingsStyles.cardGroup}>
        {items.map((item, index) =>
          renderItem ? (
            renderItem(item, index)
          ) : (
            <SettingItem
              key={index}
              icon={item.icon}
              label={item.label}
              value={item.value}
              route={item.route}
              isLast={index === items.length - 1}
            />
          )
        )}
      </View>
    </View>
  );
};
