import Screen from "@/components/common/Screen";
import { LanguageSheet } from "@/components/settings/LanguageSheet";
import { ReminderCadenceSheet } from "@/components/settings/ReminderCadenceSheet";
import { ResetMemorySheet } from "@/components/settings/ResetMemorySheet";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { auth } from "@/firebase";
import { useSoraeAI } from "@/providers/AiProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import type { OnboardingPreferences } from "@/types/sorae";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isDarkMode, setTheme } = useTheme();
  const {
    onboarding,
    isResetting,
    isSavingOnboarding,
    saveOnboarding,
    resetMemory,
  } = useSoraeAI();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [resetMemoryModalVisible, setResetMemoryModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);

  const reminderOptions: {
    label: string;
    value: OnboardingPreferences["reminderCadence"];
  }[] = [
    { label: t("reminders_none"), value: "none" },
    { label: t("reminders_daily"), value: "daily" },
    { label: t("reminders_weekdays"), value: "weekdays" },
    { label: t("reminders_weekly"), value: "weekly" },
  ];
  const cadence = onboarding?.reminderCadence ?? "none";
  const cadenceLabel =
    reminderOptions.find((option) => option.value === cadence)?.label ??
    t("reminders_none");

  const selectLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
    setLanguageModalVisible(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleResetMemory = async () => {
    await resetMemory();
    setResetMemoryModalVisible(false);
  };

  const updateReminderCadence = async (
    reminderCadence: OnboardingPreferences["reminderCadence"],
  ) => {
    await saveOnboarding({
      goals: onboarding?.goals?.length ? onboarding.goals : ["Reflect"],
      tone: onboarding?.tone ?? "gentle",
      reminderCadence,
    });
    setReminderModalVisible(false);
  };

  return (
    <Screen tabbed>
      <ScrollView
        className="flex-1 bg-[#FAFAFA] px-5 dark:bg-[#151219]"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-6 pb-4">
          <Text
            className="mb-1 text-3xl text-[#5E5082] dark:text-[#D8CEF5]"
            style={{ fontFamily: "serif" }}
          >
            {t("settings")}
          </Text>
          <Text className="text-base text-[#7D7789] dark:text-[#AFA7C1]">
            {t("manage_account")}
          </Text>
        </View>

        <View className="mb-6 rounded-3xl border border-[#E8E5EE] bg-white px-5 py-4 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
          <View className="flex-row items-center gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-full border border-[#DAD6E4] bg-[#F1EFF7] dark:border-[#4B415C] dark:bg-[#2A2234]">
              <Ionicons
                name="person-outline"
                size={22}
                color={isDarkMode ? "#D8CEF5" : "#5E5082"}
              />
            </View>
            <View className="flex-1">
              {user?.displayName && (
                <Text className="text-base font-semibold text-[#2E2A36] dark:text-[#F4F0FA]">
                  {user.displayName}
                </Text>
              )}
              <Text className="text-sm text-[#7D7789] dark:text-[#AFA7C1]">
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        <SettingsSection title={t("general")} icon="options-outline">
          <SettingsItem
            title={t("profile")}
            subtitle={t("edit_info")}
            icon="person"
            onPress={() => router.push("/(app)/profile")}
          />
          <SettingsItem
            title={t("notifications")}
            subtitle={cadenceLabel}
            icon="notifications"
            onPress={() => setReminderModalVisible(true)}
            rightElement={
              <Ionicons name="chevron-forward" size={20} color="#A39EBC" />
            }
          />
          <SettingsItem
            title={t("language")}
            subtitle={i18n.language === "es" ? t("spanish") : t("english")}
            icon="language"
            onPress={() => setLanguageModalVisible(true)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t("appearance")} icon="color-palette-outline">
          <SettingsItem
            title={t("dark_mode")}
            icon="moon-outline"
            onPress={() => setTheme(isDarkMode ? "light" : "dark")}
            isLast
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={(enabled) =>
                  setTheme(enabled ? "dark" : "light")
                }
                trackColor={{ false: "#DAD6E4", true: "#8F7DCC" }}
                thumbColor={"#ffffff"}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title={t("sorae_memory")} icon="sparkles-outline">
          <SettingsItem
            title={t("reset_memory")}
            subtitle={t("reset_memory_subtitle")}
            icon="trash-outline"
            onPress={() => setResetMemoryModalVisible(true)}
            isLast
            rightElement={
              <Ionicons name="chevron-forward" size={20} color="#B74444" />
            }
          />
        </SettingsSection>

        <SettingsSection title={t("support")} icon="help-circle-outline">
          <SettingsItem
            title={t("about")}
            subtitle="Sorae"
            icon="information-circle"
            onPress={() => undefined}
            isLast
            rightElement={
              <Text className="text-sm font-bold text-[#A39EBC] dark:text-[#AFA7C1]">
                1.0.0
              </Text>
            }
          />
        </SettingsSection>

        <Pressable
          onPress={handleLogout}
          className="mt-2 mb-8 flex-row items-center justify-center rounded-3xl border border-[#F3B9B9] bg-[#FFF5F5] py-4 active:bg-[#FFECEC] dark:border-[#5A3038] dark:bg-[#2A171C] dark:active:bg-[#321C22]"
        >
          <Ionicons name="log-out-outline" size={20} color="#B74444" />
          <Text className="ml-2 text-base font-bold text-[#B74444] dark:text-[#F2A5A5]">
            {t("log_out")}
          </Text>
        </Pressable>
      </ScrollView>

      <ResetMemorySheet
        visible={resetMemoryModalVisible}
        onClose={() => setResetMemoryModalVisible(false)}
        title={t("reset_memory_title")}
        body={t("reset_memory_body")}
        cancelLabel={t("cancel")}
        confirmLabel={t("reset_memory_confirm")}
        deletingLabel={t("deleting")}
        isResetting={isResetting}
        onConfirm={() => void handleResetMemory()}
      />

      <ReminderCadenceSheet
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        title={t("notifications")}
        options={reminderOptions}
        cadence={cadence}
        isSaving={isSavingOnboarding}
        isDarkMode={isDarkMode}
        onSelect={(option) => void updateReminderCadence(option)}
      />

      <LanguageSheet
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        title={t("language")}
        currentLanguage={i18n.language}
        englishLabel={t("english")}
        spanishLabel={t("spanish")}
        isDarkMode={isDarkMode}
        onSelect={selectLanguage}
      />
    </Screen>
  );
}
