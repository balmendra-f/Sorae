import { moodOptions } from "@/constants/sorae";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type DailyCheckInCardProps = {
  brandColor: string;
  isDarkMode: boolean;
  selectedMood: string;
  energy: number;
  note: string;
  isCheckingIn: boolean;
  onMoodChange: (mood: string) => void;
  onEnergyChange: (energy: number) => void;
  onNoteChange: (note: string) => void;
  onSubmit: () => void;
};

export const DailyCheckInCard = ({
  brandColor,
  isDarkMode,
  selectedMood,
  energy,
  note,
  isCheckingIn,
  onMoodChange,
  onEnergyChange,
  onNoteChange,
  onSubmit,
}: DailyCheckInCardProps) => {
  const { t } = useTranslation();

  return (
    <View className="mb-5 rounded-[28px] border border-[#E8E5EE] bg-white p-5 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
    <View className="mb-4 flex-row items-center justify-between">
      <View>
        <Text className="text-[11px] font-bold uppercase tracking-widest text-[#9B96AE] dark:text-[#AFA7C1]">
          {t("sorae_check_in_label")}
        </Text>
        <Text
          className="text-xl text-[#2E2A36] dark:text-[#F4F0FA]"
          style={{ fontFamily: "serif" }}
        >
          {t("sorae_check_in_title")}
        </Text>
      </View>
      <Ionicons name="sunny-outline" size={22} color={brandColor} />
    </View>

    <View className="mb-4 flex-row flex-wrap gap-2">
      {moodOptions.map((mood) => (
        <Pressable
          key={mood.value}
          className={`rounded-full border px-4 py-2 ${
            selectedMood === mood.value
              ? "border-[#5E5082] bg-[#F1EFF7] dark:border-[#8F7DCC] dark:bg-[#2A2234]"
              : "border-[#E8E5EE] bg-[#FAFAFA] dark:border-[#31293D] dark:bg-[#151219]"
          }`}
          onPress={() => onMoodChange(mood.value)}
        >
          <Text className="text-[12px] font-bold text-[#4A4A4A] dark:text-[#D8CEF5]">
            {t(mood.translationKey)}
          </Text>
        </Pressable>
      ))}
    </View>

    <View className="mb-4 flex-row gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <Pressable
          key={value}
          className={`h-10 flex-1 items-center justify-center rounded-2xl ${
            energy === value
              ? "bg-[#5E5082] dark:bg-[#8F7DCC]"
              : "bg-[#F1EFF7] dark:bg-[#2A2234]"
          }`}
          onPress={() => onEnergyChange(value)}
        >
          <Text
            className={`font-bold ${
              energy === value
                ? "text-white"
                : "text-[#5E5082] dark:text-[#D8CEF5]"
            }`}
          >
            {value}
          </Text>
        </Pressable>
      ))}
    </View>

    <TextInput
      placeholder={t("sorae_check_in_note_placeholder")}
      placeholderTextColor={isDarkMode ? "#7D748E" : "#B0B0B0"}
      className="mb-4 rounded-2xl border border-[#E8E5EE] bg-[#FAFAFA] px-4 py-3 text-base text-[#2E2A36] dark:border-[#31293D] dark:bg-[#151219] dark:text-[#F4F0FA]"
      value={note}
      onChangeText={onNoteChange}
    />

    <Pressable
      className="self-start flex-row items-center rounded-full bg-[#5E5082] px-5 py-3 dark:bg-[#8F7DCC]"
      disabled={isCheckingIn}
      onPress={onSubmit}
    >
      <Text className="mr-2 text-[13px] font-bold tracking-wider text-white">
        {isCheckingIn ? t("saving_short") : t("sorae_save_check_in")}
      </Text>
      {isCheckingIn ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Ionicons name="checkmark" size={16} color="white" />
      )}
    </Pressable>
  </View>
  );
};
