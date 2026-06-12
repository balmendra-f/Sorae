import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

type LanguageSheetProps = {
  visible: boolean;
  title: string;
  currentLanguage: string;
  englishLabel: string;
  spanishLabel: string;
  isDarkMode: boolean;
  onClose: () => void;
  onSelect: (language: string) => void;
};

export const LanguageSheet = ({
  visible,
  title,
  currentLanguage,
  englishLabel,
  spanishLabel,
  isDarkMode,
  onClose,
  onSelect,
}: LanguageSheetProps) => {
  const selectedColor = isDarkMode ? "#D8CEF5" : "#5E5082";
  const languages = [
    { label: englishLabel, value: "en" },
    { label: spanishLabel, value: "es" },
  ];

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title={title}>
      {languages.map((language, index) => {
        const isSelected = currentLanguage === language.value;

        return (
          <Pressable
            key={language.value}
            onPress={() => onSelect(language.value)}
            className={`flex-row items-center justify-between rounded-xl border p-4 ${
              index === 0 ? "mb-3" : ""
            } ${
              isSelected
                ? "border-[#DAD6E4] bg-[#F6F5F9] dark:border-[#4B415C] dark:bg-[#2A2234]"
                : "border-transparent bg-[#FAFAFA] dark:bg-[#151219]"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isSelected
                  ? "text-[#5E5082] dark:text-[#D8CEF5]"
                  : "text-[#2E2A36] dark:text-[#F4F0FA]"
              }`}
            >
              {language.label}
            </Text>
            {isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={selectedColor}
              />
            )}
          </Pressable>
        );
      })}
    </BottomSheetModal>
  );
};
