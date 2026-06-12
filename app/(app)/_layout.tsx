import SoraeAIProvider from "@/providers/AiProvider";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <SoraeAIProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SoraeAIProvider>
  );
}
