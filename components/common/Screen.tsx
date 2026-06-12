import { useTheme } from "@/providers/ThemeProvider";
import { StatusBar } from "expo-status-bar";
import { FC, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Screen: FC<{
  children: ReactNode;
  tabbed?: boolean;
  className?: string;
}> = ({ children, tabbed, className = "" }) => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const shouldSetBottomInset = Platform.OS !== "android" && !tabbed;

  return (
    <View
      className={`bg-[#FAFAFA] dark:bg-[#151219] ${className}`}
      style={{
        flex: 1,
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: shouldSetBottomInset ? Math.max(insets.bottom, 16) : 0,
      }}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <KeyboardAvoidingView
        enabled={Platform.OS === "ios"}
        behavior="height"
        style={{ flex: 1, paddingBottom: 2 }}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Screen;
