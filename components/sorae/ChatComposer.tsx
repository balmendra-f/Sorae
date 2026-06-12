import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type ChatComposerProps = {
  draft: string;
  isDarkMode: boolean;
  isSending: boolean;
  isLoading: boolean;
  isRecording: boolean;
  canSend: boolean;
  onDraftChange: (text: string) => void;
  onSubmit: () => void;
  onToggleRecording: () => void;
};

export const ChatComposer = ({
  draft,
  isDarkMode,
  isSending,
  isLoading,
  isRecording,
  canSend,
  onDraftChange,
  onSubmit,
  onToggleRecording,
}: ChatComposerProps) => {
  const { t } = useTranslation();

  return (
    <View className="mx-5 my-2 mb-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
    <TextInput
      placeholder={t("sorae_chat_placeholder")}
      placeholderTextColor={isDarkMode ? "#7D748E" : "#B0B0B0"}
      className="mb-6 max-h-28 min-h-10 p-0 text-base text-gray-800 dark:text-[#F4F0FA]"
      style={{ fontFamily: "serif" }}
      multiline
      value={draft}
      onChangeText={onDraftChange}
      editable={!isSending && !isLoading && !isRecording}
      onSubmitEditing={onSubmit}
    />
    <View className="flex-row items-center justify-between">
      <Pressable
        className={`h-12 w-12 items-center justify-center rounded-full ${
          isRecording ? "bg-[#B74444]" : "bg-[#F1EFF7] dark:bg-[#2A2234]"
        }`}
        disabled={isSending || isLoading}
        onPress={onToggleRecording}
      >
        <Ionicons
          name={isRecording ? "stop" : "mic-outline"}
          size={24}
          color={isRecording ? "white" : isDarkMode ? "#D8CEF5" : "#5E5082"}
        />
      </Pressable>
      <Pressable
        className={`flex-row items-center rounded-full px-6 py-3 ${
          canSend
            ? "bg-[#5E5082] dark:bg-[#8F7DCC]"
            : "bg-[#DAD6E4] dark:bg-[#4B415C]"
        }`}
        disabled={!canSend}
        onPress={onSubmit}
      >
        <Text
          className="mr-2 text-[15px] text-white"
          style={{ fontFamily: "serif" }}
        >
          {isSending ? t("sorae_thinking") : t("sorae_reflect")}
        </Text>
        {isSending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name="send" size={14} color="white" />
        )}
      </Pressable>
    </View>
  </View>
  );
};
