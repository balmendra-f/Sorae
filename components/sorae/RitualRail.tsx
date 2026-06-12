import { soraeRituals } from "@/constants/sorae";
import type { RitualId } from "@/types/sorae";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

type RitualRailProps = {
  brandColor: string;
  isDisabled: boolean;
  onStart: (ritualId: RitualId) => void;
};

export const RitualRail = ({
  brandColor,
  isDisabled,
  onStart,
}: RitualRailProps) => {
  const { t } = useTranslation();

  return (
    <View className="mb-5">
    <Text className="mb-3 px-1 text-[12px] font-bold uppercase tracking-widest text-[#6B647A] dark:text-[#C7BDE0]">
      {t("sorae_rituals_label")}
    </Text>
    <View className="flex-row gap-3">
      {soraeRituals.map((ritual) => (
        <Pressable
          key={ritual.id}
          className="min-h-[86px] flex-1 items-center justify-center rounded-3xl border border-[#E8E5EE] bg-white px-2 py-3 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]"
          disabled={isDisabled}
          onPress={() => onStart(ritual.id)}
        >
          <Ionicons name={ritual.icon} size={20} color={brandColor} />
          <Text className="mt-2 text-center text-[11px] font-bold text-[#4A4A4A] dark:text-[#D8CEF5]">
            {t(ritual.titleKey)}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
  );
};
