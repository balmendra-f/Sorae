import Screen from "@/components/common/Screen";
import { ChatComposer } from "@/components/sorae/ChatComposer";
import { DailyCheckInCard } from "@/components/sorae/DailyCheckInCard";
import { MemoryNoticeCard } from "@/components/sorae/MemoryNoticeCard";
import { MessageBubble } from "@/components/sorae/MessageBubble";
import { OnboardingPanel } from "@/components/sorae/OnboardingPanel";
import { RitualRail } from "@/components/sorae/RitualRail";
import { SoraeHeader } from "@/components/sorae/SoraeHeader";
import { useVoiceReflection } from "@/hooks/useVoiceReflection";
import { useSoraeAI } from "@/providers/AiProvider";
import { useTheme } from "@/providers/ThemeProvider";
import type { OnboardingPreferences, RitualId } from "@/types/sorae";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function ChatScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const {
    messages,
    memoryStatus,
    activeContext,
    hasUserShared,
    onboarding,
    latestCheckIn,
    isLoading,
    isSending,
    isSendingVoice,
    isSavingOnboarding,
    isCheckingIn,
    isStartingRitual,
    errorMessage,
    isMemoryNoticeVisible,
    acceptMemoryNotice,
    sendMessage,
    sendVoiceMessage,
    saveOnboarding,
    saveCheckIn,
    startRitual,
  } = useSoraeAI();
  const [draft, setDraft] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] =
    useState<OnboardingPreferences["tone"]>("gentle");
  const [selectedReminder, setSelectedReminder] =
    useState<OnboardingPreferences["reminderCadence"]>("none");
  const [selectedMood, setSelectedMood] = useState("Calm");
  const [energy, setEnergy] = useState(3);
  const [checkInNote, setCheckInNote] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const voiceDisabled = isSending || isSendingVoice || isLoading;
  const { isRecording, voiceError, toggleRecording } = useVoiceReflection({
    sendVoiceMessage,
    isDisabled: voiceDisabled,
  });

  const brandColor = isDarkMode ? "#D8CEF5" : "#5E5082";
  const mutedIconColor = isDarkMode ? "#AFA7C1" : "#4A4A4A";
  const todayId = new Date().toISOString().slice(0, 10);
  const needsCheckIn = latestCheckIn?.id !== todayId;
  const canSend =
    draft.trim().length > 0 && !isSending && !isLoading && !isRecording;
  const canCompleteOnboarding = selectedGoals.length > 0 && !isSavingOnboarding;
  const statusLabel =
    isSending || isSendingVoice
      ? t("sorae_status_thinking")
      : memoryStatus === "empty"
        ? t("sorae_status_listening")
        : memoryStatus === "forming"
          ? t("sorae_status_forming")
          : t("sorae_status_memory_alive");
  const contextLabel =
    memoryStatus === "empty"
      ? t("sorae_context_listening")
      : t("sorae_context_label", {
          title: activeContext.title,
          timeframe: activeContext.timeframe,
        });
  const showQuickReplies = !hasUserShared && messages.length === 1;

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  };

  const submitMessage = (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

    Keyboard.dismiss();
    setDraft("");
    void sendMessage(trimmedText);
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((currentGoals) =>
      currentGoals.includes(goal)
        ? currentGoals.filter((item) => item !== goal)
        : [...currentGoals, goal].slice(0, 4),
    );
  };

  const completeOnboarding = async () => {
    await Haptics.selectionAsync();
    await saveOnboarding({
      goals: selectedGoals,
      tone: selectedTone,
      reminderCadence: selectedReminder,
    });
  };

  const submitCheckIn = async () => {
    await Haptics.selectionAsync();
    await saveCheckIn(selectedMood, energy, checkInNote.trim());
    setCheckInNote("");
  };

  const handleRitualStart = (ritualId: RitualId) => {
    void startRitual(ritualId);
  };

  if (!isLoading && !onboarding) {
    return (
      <OnboardingPanel
        brandColor={brandColor}
        selectedGoals={selectedGoals}
        selectedTone={selectedTone}
        selectedReminder={selectedReminder}
        errorMessage={errorMessage}
        isSaving={isSavingOnboarding}
        canComplete={canCompleteOnboarding}
        onToggleGoal={toggleGoal}
        onSelectTone={setSelectedTone}
        onSelectReminder={setSelectedReminder}
        onComplete={() => void completeOnboarding()}
      />
    );
  }

  return (
    <Screen tabbed>
      <View className="flex-1 bg-[#FAFAFA] dark:bg-[#151219]">
        <SoraeHeader
          brandColor={brandColor}
          statusLabel={statusLabel}
          latestCheckIn={latestCheckIn}
        />

        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={scrollToEnd}
          showsVerticalScrollIndicator={false}
        >
          <View className="my-4 flex-row items-center self-center rounded-full bg-[#F4F3F6] px-5 py-2 dark:bg-[#201A29]">
            <Ionicons name="time-outline" size={14} color={mutedIconColor} />
            <Text className="ml-2 text-[11px] font-bold uppercase tracking-wider text-[#4A4A4A] dark:text-[#C7BDE0]">
              {contextLabel}
            </Text>
          </View>

          {needsCheckIn && (
            <DailyCheckInCard
              brandColor={brandColor}
              isDarkMode={isDarkMode}
              selectedMood={selectedMood}
              energy={energy}
              note={checkInNote}
              isCheckingIn={isCheckingIn}
              onMoodChange={setSelectedMood}
              onEnergyChange={setEnergy}
              onNoteChange={setCheckInNote}
              onSubmit={() => void submitCheckIn()}
            />
          )}

          <RitualRail
            brandColor={brandColor}
            isDisabled={isStartingRitual || isSending}
            onStart={handleRitualStart}
          />

          {isMemoryNoticeVisible && (
            <MemoryNoticeCard
              brandColor={brandColor}
              onAccept={() => void acceptMemoryNotice()}
            />
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              showQuickReplies={index === 0 && showQuickReplies}
              isDisabled={isSending || isLoading}
              onQuickReply={submitMessage}
            />
          ))}

          {(isSending || isSendingVoice) && (
            <View className="mb-5 flex-row items-center self-start rounded-full border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
              <ActivityIndicator size="small" color={brandColor} />
              <Text className="ml-3 text-[13px] font-bold uppercase tracking-widest text-[#6B647A] dark:text-[#C7BDE0]">
                {t("sorae_thinking")}
              </Text>
            </View>
          )}

          {errorMessage || voiceError ? (
            <Text className="mb-3 text-center text-sm text-[#B74444] dark:text-[#F2A5A5]">
              {errorMessage || voiceError}
            </Text>
          ) : null}
        </ScrollView>

        <ChatComposer
          draft={draft}
          isDarkMode={isDarkMode}
          isSending={isSending}
          isLoading={isLoading}
          isRecording={isRecording}
          canSend={canSend}
          onDraftChange={setDraft}
          onSubmit={() => submitMessage(draft)}
          onToggleRecording={() => void toggleRecording()}
        />
      </View>
    </Screen>
  );
}
