import type { DailyCheckIn } from "@/types/sorae";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type SoraeHeaderProps = {
  brandColor: string;
  statusLabel: string;
  latestCheckIn: DailyCheckIn | null;
};

export const SoraeHeader = ({
  brandColor,
  statusLabel,
  latestCheckIn,
}: SoraeHeaderProps) => (
  <View className="flex-row items-center justify-between px-6 py-4">
    <View className="flex-row items-center gap-3">
      <Ionicons
        name="share-social-outline"
        size={26}
        color={brandColor}
        style={{ transform: [{ rotate: "270deg" }] }}
      />
      <View>
        <Text
          className="text-3xl text-[#5E5082] dark:text-[#D8CEF5]"
          style={{ fontFamily: "serif" }}
        >
          Sorae
        </Text>
        <Text className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#A39EBC] dark:text-[#AFA7C1]">
          {statusLabel}
        </Text>
      </View>
    </View>
    <View className="rounded-full bg-[#F4F3F6] px-3 py-2 dark:bg-[#201A29]">
      <Text className="text-[11px] font-bold text-[#5E5082] dark:text-[#D8CEF5]">
        {latestCheckIn ? `${latestCheckIn.energy}/5` : "--"}
      </Text>
    </View>
  </View>
);
