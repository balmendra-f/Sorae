import { quickReplies } from "@/constants/sorae";
import type { ChatMessage } from "@/types/sorae";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

type MessageBubbleProps = {
  message: ChatMessage;
  showQuickReplies: boolean;
  isDisabled: boolean;
  onQuickReply: (text: string) => void;
};

export const MessageBubble = ({
  message,
  showQuickReplies,
  isDisabled,
  onQuickReply,
}: MessageBubbleProps) => {
  const { t } = useTranslation();
  const isUser = message.role === "user";

  return (
    <View
      className={`mb-5 max-w-[88%] rounded-3xl border p-5 ${
        isUser
          ? "self-end rounded-tr-sm border-gray-200 bg-[#F6F5F9] dark:border-[#4B415C] dark:bg-[#2A2234]"
          : "self-start rounded-tl-sm border-gray-100 bg-white shadow-sm dark:border-[#31293D] dark:bg-[#201A29]"
      }`}
    >
      <Text
        className="text-base leading-7 text-gray-800 dark:text-[#F4F0FA]"
        style={{ fontFamily: "serif" }}
      >
        {message.text}
      </Text>

      {showQuickReplies && (
        <View className="mt-5">
          {quickReplies.map((option) => (
            <Pressable
              key={option}
              className="mb-3 self-start rounded-full border border-gray-300 px-5 py-2.5 dark:border-[#4B415C]"
              disabled={isDisabled}
              onPress={() => onQuickReply(t(option))}
            >
              <Text className="text-[13px] font-bold tracking-widest text-[#4A4A4A] dark:text-[#D8CEF5]">
                {t(option)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};
