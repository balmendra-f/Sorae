import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
}

export const SettingsItem = ({
  title,
  subtitle,
  icon,
  onPress,
  rightElement,
  isLast = false,
}: SettingsItemProps) => {
  const { isDarkMode } = useTheme();
  const iconColor = isDarkMode ? "#D8CEF5" : "#5E5082";

  return (
    <Pressable
      className={`flex-row items-center px-5 py-4 active:bg-[#F6F5F9] dark:active:bg-[#2A2234] ${
        !isLast ? "border-b border-[#E8E5EE] dark:border-[#31293D]" : ""
      }`}
      onPress={onPress}
    >
      <View className="mr-4 items-center justify-center rounded-xl bg-[#F1EFF7] p-2 dark:bg-[#2A2234]">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="mb-0.5 text-base font-semibold text-[#2E2A36] dark:text-[#F4F0FA]">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-[#7D7789] dark:text-[#AFA7C1]">
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement ?? (
        <Ionicons name="chevron-forward" size={20} color="#A39EBC" />
      )}
    </Pressable>
  );
};

export default SettingsItem;
