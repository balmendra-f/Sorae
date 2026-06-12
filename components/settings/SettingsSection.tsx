import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";

interface SettingsSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}

export const SettingsSection = ({
  title,
  icon,
  children,
}: SettingsSectionProps) => {
  const { isDarkMode } = useTheme();
  const iconColor = isDarkMode ? "#D8CEF5" : "#5E5082";

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center px-1">
        <View className="mr-2 items-center justify-center rounded-lg bg-[#F1EFF7] p-1 dark:bg-[#2A2234]">
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        <Text className="text-sm font-bold uppercase tracking-wide text-[#6B647A] dark:text-[#C7BDE0]">
          {title}
        </Text>
      </View>
      <View className="overflow-hidden rounded-3xl border border-[#E8E5EE] bg-white dark:border-[#31293D] dark:bg-[#201A29]">
        {children}
      </View>
    </View>
  );
};

export default SettingsSection;
