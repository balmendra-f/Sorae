import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import type { OnboardingPreferences } from "@/types/sorae";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text } from "react-native";

type ReminderOption = {
  label: string;
  value: OnboardingPreferences["reminderCadence"];
};

type ReminderCadenceSheetProps = {
  visible: boolean;
  title: string;
  options: ReminderOption[];
  cadence: OnboardingPreferences["reminderCadence"];
  isSaving: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  onSelect: (cadence: OnboardingPreferences["reminderCadence"]) => void;
};

export const ReminderCadenceSheet = ({
  visible,
  title,
  options,
  cadence,
  isSaving,
  isDarkMode,
  onClose,
  onSelect,
}: ReminderCadenceSheetProps) => (
  <BottomSheetModal visible={visible} onClose={onClose} title={title}>
    {options.map((option) => {
      const isSelected = cadence === option.value;
      const selectedColor = isDarkMode ? "#D8CEF5" : "#5E5082";

      return (
        <Pressable
          key={option.value}
          className={`mb-3 flex-row items-center justify-between rounded-2xl border p-4 ${
            isSelected
              ? "border-[#DAD6E4] bg-[#F6F5F9] dark:border-[#4B415C] dark:bg-[#2A2234]"
              : "border-transparent bg-[#FAFAFA] dark:bg-[#151219]"
          }`}
          disabled={isSaving}
          onPress={() => onSelect(option.value)}
        >
          <Text
            className={`text-base font-semibold ${
              isSelected
                ? "text-[#5E5082] dark:text-[#D8CEF5]"
                : "text-[#2E2A36] dark:text-[#F4F0FA]"
            }`}
          >
            {option.label}
          </Text>
          {isSaving && isSelected ? (
            <ActivityIndicator size="small" color={selectedColor} />
          ) : isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color={selectedColor} />
          ) : null}
        </Pressable>
      );
    })}
  </BottomSheetModal>
);
