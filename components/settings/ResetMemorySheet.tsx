import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type ResetMemorySheetProps = {
  visible: boolean;
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  deletingLabel: string;
  isResetting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ResetMemorySheet = ({
  visible,
  title,
  body,
  cancelLabel,
  confirmLabel,
  deletingLabel,
  isResetting,
  onClose,
  onConfirm,
}: ResetMemorySheetProps) => (
  <BottomSheetModal visible={visible} onClose={onClose} title={title}>
    <Text
      className="mb-5 text-base leading-7 text-[#2E2A36] dark:text-[#F4F0FA]"
      style={{ fontFamily: "serif" }}
    >
      {body}
    </Text>
    <View className="flex-row gap-3">
      <Pressable
        className="flex-1 rounded-2xl border border-[#DAD6E4] px-4 py-3 dark:border-[#4B415C]"
        disabled={isResetting}
        onPress={onClose}
      >
        <Text className="text-center text-base font-bold text-[#5E5082] dark:text-[#D8CEF5]">
          {cancelLabel}
        </Text>
      </Pressable>
      <Pressable
        className="flex-1 flex-row items-center justify-center rounded-2xl bg-[#B74444] px-4 py-3"
        disabled={isResetting}
        onPress={onConfirm}
      >
        {isResetting && <ActivityIndicator size="small" color="white" />}
        <Text
          className={`text-center text-base font-bold text-white ${
            isResetting ? "ml-2" : ""
          }`}
        >
          {isResetting ? deletingLabel : confirmLabel}
        </Text>
      </Pressable>
    </View>
  </BottomSheetModal>
);
