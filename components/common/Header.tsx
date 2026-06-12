import { FC, Fragment, type ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

const Header: FC<{
  title?: string;
  renderCenter?: () => ReactNode;
  renderRight?: () => ReactNode;
  canGoBack?: boolean;
}> = ({ title, renderCenter, renderRight, canGoBack = true }) => {
  const { isDarkMode } = useTheme();

  return (
    <Fragment>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View className="flex flex-row items-center bg-[#FAFAFA] p-4 dark:bg-[#151219]">
        <View className="flex-1">
          {canGoBack && (
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDarkMode ? "#D8CEF5" : "#5E5082"}
              onPress={router.back}
            />
          )}
        </View>
        <Text className="ml-4 text-xl font-bold text-[#2E2A36] dark:text-[#F4F0FA]">
          {renderCenter ? renderCenter() : title}
        </Text>
        <View className="flex-1">{renderRight?.()}</View>
      </View>
    </Fragment>
  );
};

export default Header;
