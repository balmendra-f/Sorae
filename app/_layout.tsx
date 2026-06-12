import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import "../i18n";
import ScreenProvider from "../providers/ScreenProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const AUTH_ROUTE = "/(auth)";
const APP_ROUTE = "/(app)/(tabs)";

const AppLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentGroup = segments[0];

    if (!isAuthenticated) {
      if (currentGroup !== "(auth)") router.replace(AUTH_ROUTE);
    } else {
      if (currentGroup !== "(app)") router.replace(APP_ROUTE);
    }
  }, [isAuthenticated, isLoading, router, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#171717" }}>
        <ActivityIndicator size="large" color="#D8CEF5" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
};

const RootLayout = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AuthProvider>
        <ScreenProvider>
          <AppLayout />
        </ScreenProvider>
      </AuthProvider>
    </ThemeProvider>
  </SafeAreaProvider>
);

export default RootLayout;
