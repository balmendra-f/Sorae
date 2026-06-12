import Screen from "@/components/common/Screen";
import {
  onboardingGoals,
  reminderOptions,
  toneOptions,
} from "@/constants/sorae";
import type { OnboardingPreferences } from "@/types/sorae";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type OnboardingPanelProps = {
  brandColor: string;
  selectedGoals: string[];
  selectedTone: OnboardingPreferences["tone"];
  selectedReminder: OnboardingPreferences["reminderCadence"];
  errorMessage: string;
  isSaving: boolean;
  canComplete: boolean;
  onToggleGoal: (goal: string) => void;
  onSelectTone: (tone: OnboardingPreferences["tone"]) => void;
  onSelectReminder: (
    reminderCadence: OnboardingPreferences["reminderCadence"],
  ) => void;
  onComplete: () => void;
};

export const OnboardingPanel = ({
  brandColor,
  selectedGoals,
  selectedTone,
  selectedReminder,
  errorMessage,
  isSaving,
  canComplete,
  onToggleGoal,
  onSelectTone,
  onSelectReminder,
  onComplete,
}: OnboardingPanelProps) => {
  const { t } = useTranslation();

  return (
    <Screen tabbed>
    <View className="flex-1 bg-[#FAFAFA] px-6 pt-8 dark:bg-[#151219]">
      <View className="mb-8 flex-row items-center gap-3">
        <Ionicons
          name="share-social-outline"
          size={30}
          color={brandColor}
          style={{ transform: [{ rotate: "270deg" }] }}
        />
        <View>
          <Text
            className="text-4xl text-[#5E5082] dark:text-[#D8CEF5]"
            style={{ fontFamily: "serif" }}
          >
            Sorae
          </Text>
          <Text className="text-[11px] font-bold uppercase tracking-widest text-[#A39EBC] dark:text-[#AFA7C1]">
            {t("sorae_onboarding_tagline")}
          </Text>
        </View>
      </View>

      <Text
        className="mb-3 text-3xl leading-10 text-[#2E2A36] dark:text-[#F4F0FA]"
        style={{ fontFamily: "serif" }}
      >
        {t("sorae_onboarding_title")}
      </Text>
      <Text className="mb-6 text-base leading-7 text-[#6B647A] dark:text-[#C7BDE0]">
        {t("sorae_onboarding_body")}
      </Text>

      <View className="mb-7 flex-row flex-wrap gap-3">
        {onboardingGoals.map((goal) => {
          const isSelected = selectedGoals.includes(goal.value);

          return (
            <Pressable
              key={goal.value}
              className={`rounded-full border px-4 py-3 ${
                isSelected
                  ? "border-[#5E5082] bg-[#5E5082] dark:border-[#8F7DCC] dark:bg-[#8F7DCC]"
                  : "border-[#DAD6E4] bg-white dark:border-[#4B415C] dark:bg-[#201A29]"
              }`}
              onPress={() => onToggleGoal(goal.value)}
            >
              <Text
                className={`text-[13px] font-bold tracking-wide ${
                  isSelected ? "text-white" : "text-[#4A4A4A] dark:text-[#D8CEF5]"
                }`}
              >
                {t(goal.translationKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-3 text-[12px] font-bold uppercase tracking-widest text-[#6B647A] dark:text-[#C7BDE0]">
        {t("sorae_tone_label")}
      </Text>
      <View className="mb-7 flex-row gap-2">
        {toneOptions.map((option) => (
          <Pressable
            key={option.value}
            className={`flex-1 rounded-2xl border px-2 py-3 ${
              selectedTone === option.value
                ? "border-[#5E5082] bg-[#F1EFF7] dark:border-[#8F7DCC] dark:bg-[#2A2234]"
                : "border-[#E8E5EE] bg-white dark:border-[#31293D] dark:bg-[#201A29]"
            }`}
            onPress={() => onSelectTone(option.value)}
          >
            <Text className="text-center text-[12px] font-bold text-[#4A4A4A] dark:text-[#D8CEF5]">
              {t(option.translationKey)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="mb-3 text-[12px] font-bold uppercase tracking-widest text-[#6B647A] dark:text-[#C7BDE0]">
        {t("sorae_rhythm_label")}
      </Text>
      <View className="mb-8 flex-row flex-wrap gap-2">
        {reminderOptions.map((option) => (
          <Pressable
            key={option.value}
            className={`rounded-2xl border px-4 py-3 ${
              selectedReminder === option.value
                ? "border-[#5E5082] bg-[#F1EFF7] dark:border-[#8F7DCC] dark:bg-[#2A2234]"
                : "border-[#E8E5EE] bg-white dark:border-[#31293D] dark:bg-[#201A29]"
            }`}
            onPress={() => onSelectReminder(option.value)}
          >
            <Text className="text-[12px] font-bold text-[#4A4A4A] dark:text-[#D8CEF5]">
              {t(option.translationKey)}
            </Text>
          </Pressable>
        ))}
      </View>

      {errorMessage ? (
        <Text className="mb-4 text-sm text-[#B74444] dark:text-[#F2A5A5]">
          {errorMessage}
        </Text>
      ) : null}

      <Pressable
        className={`flex-row items-center justify-center rounded-3xl px-6 py-4 ${
          canComplete
            ? "bg-[#5E5082] dark:bg-[#8F7DCC]"
            : "bg-[#DAD6E4] dark:bg-[#4B415C]"
        }`}
        disabled={!canComplete}
        onPress={onComplete}
      >
        <Text className="mr-2 text-base font-bold text-white">
          {isSaving ? t("saving_short") : t("sorae_start")}
        </Text>
        {isSaving ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name="arrow-forward" size={18} color="white" />
        )}
      </Pressable>
    </View>
  </Screen>
  );
};
