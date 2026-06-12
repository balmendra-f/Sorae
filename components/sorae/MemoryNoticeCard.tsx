import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

type MemoryNoticeCardProps = {
  brandColor: string;
  onAccept: () => void;
};

export const MemoryNoticeCard = ({
  brandColor,
  onAccept,
}: MemoryNoticeCardProps) => {
  const { t } = useTranslation();

  return (
    <View className="mb-5 rounded-[28px] border border-[#E8E5EE] bg-white p-5 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
    <View className="mb-3 flex-row items-center">
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-2xl bg-[#F1EFF7] dark:bg-[#2A2234]">
        <Ionicons name="shield-checkmark-outline" size={18} color={brandColor} />
      </View>
      <Text className="text-[12px] font-bold uppercase tracking-widest text-[#6B647A] dark:text-[#C7BDE0]">
        {t("sorae_memory_notice_title")}
      </Text>
    </View>
    <Text
      className="mb-4 text-[14px] leading-6 text-gray-700 dark:text-[#D8D1E6]"
      style={{ fontFamily: "serif" }}
    >
      {t("sorae_memory_notice_body")}
    </Text>
    <Pressable
      className="self-start rounded-full bg-[#5E5082] px-5 py-3 dark:bg-[#8F7DCC]"
      onPress={onAccept}
    >
      <Text className="text-[13px] font-bold tracking-wider text-white">
        {t("sorae_memory_notice_accept")}
      </Text>
    </Pressable>
  </View>
  );
};
