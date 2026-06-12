import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const activeTint = isDark ? "#D8CEF5" : "#5E5082";
  const inactiveTint = isDark ? "#8F879D" : "#7D7789";
  const tabIconContainerStyle = {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: 48,
    height: 34,
    borderRadius: 17,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#151219" : "#FAFAFA",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2B2435" : "#E8E5EE",
          height: Platform.OS === "ios" ? 78 : 64,
          paddingBottom: Platform.OS === "ios" ? 12 : 7,
          paddingTop: 8,
          elevation: 0,
          shadowColor: isDark ? "#07050A" : "#BDB6CA",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.24 : 0.12,
          shadowRadius: 14,
        },
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          lineHeight: 14,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                ...tabIconContainerStyle,
                backgroundColor: focused
                  ? isDark
                    ? "rgba(216, 206, 245, 0.12)"
                    : "rgba(94, 80, 130, 0.1)"
                  : "transparent",
                borderWidth: focused ? 1 : 0,
                borderColor: isDark
                  ? "rgba(216, 206, 245, 0.2)"
                  : "rgba(94, 80, 130, 0.14)",
              }}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={23}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="context"
        options={{
          title: t("context"),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                ...tabIconContainerStyle,
                backgroundColor: focused
                  ? isDark
                    ? "rgba(216, 206, 245, 0.12)"
                    : "rgba(94, 80, 130, 0.1)"
                  : "transparent",
                borderWidth: focused ? 1 : 0,
                borderColor: isDark
                  ? "rgba(216, 206, 245, 0.2)"
                  : "rgba(94, 80, 130, 0.14)",
              }}
            >
              <Ionicons
                name={focused ? "layers" : "layers-outline"}
                size={23}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                ...tabIconContainerStyle,
                backgroundColor: focused
                  ? isDark
                    ? "rgba(216, 206, 245, 0.12)"
                    : "rgba(94, 80, 130, 0.1)"
                  : "transparent",
                borderWidth: focused ? 1 : 0,
                borderColor: isDark
                  ? "rgba(216, 206, 245, 0.2)"
                  : "rgba(94, 80, 130, 0.14)",
              }}
            >
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={23}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
