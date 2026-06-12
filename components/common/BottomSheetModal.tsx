import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheetModal = ({
  visible,
  onClose,
  title,
  children,
}: BottomSheetModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
      <View
        className="w-full rounded-t-3xl border-t border-[#E8E5EE] bg-white p-6 pb-12 shadow-xl dark:border-[#31293D] dark:bg-[#201A29]"
        onStartShouldSetResponder={() => true}
      >
        <View className="mb-6 h-1.5 w-12 self-center rounded-full bg-[#DAD6E4] dark:bg-[#4B415C]" />

        {title && (
          <Text className="mb-6 text-center text-xl font-bold text-[#2E2A36] dark:text-[#F4F0FA]">
            {title}
          </Text>
        )}

        {children}
      </View>
    </Pressable>
  </Modal>
);

export default BottomSheetModal;
