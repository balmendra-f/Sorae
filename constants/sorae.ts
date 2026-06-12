import type {
  ActiveContext,
  BehaviorSignal,
  ChatMessage,
  ChatRole,
  OnboardingPreferences,
  RiskState,
  RitualId,
} from "@/types/sorae";

export const quickReplies = [
  "sorae_quick_reply_unsure_start",
  "sorae_quick_reply_order_something",
  "sorae_quick_reply_say_it",
];

export const onboardingGoals: {
  value: string;
  translationKey: string;
}[] = [
  {
    value: "Organize thoughts",
    translationKey: "sorae_goal_organize_thoughts",
  },
  {
    value: "Vent",
    translationKey: "sorae_goal_vent",
  },
  {
    value: "Understand patterns",
    translationKey: "sorae_goal_understand_patterns",
  },
  {
    value: "Close the day",
    translationKey: "sorae_goal_close_day",
  },
];

export const toneOptions: {
  translationKey: string;
  value: OnboardingPreferences["tone"];
}[] = [
  { translationKey: "sorae_tone_gentle", value: "gentle" },
  { translationKey: "sorae_tone_direct", value: "direct" },
  { translationKey: "sorae_tone_reflective", value: "reflective" },
  { translationKey: "sorae_tone_practical", value: "practical" },
];

export const reminderOptions: {
  translationKey: string;
  value: OnboardingPreferences["reminderCadence"];
}[] = [
  { translationKey: "reminders_none", value: "none" },
  { translationKey: "reminders_daily", value: "daily" },
  { translationKey: "reminders_weekdays", value: "weekdays" },
  { translationKey: "reminders_weekly", value: "weekly" },
];

export const moodOptions: {
  value: string;
  translationKey: string;
}[] = [
  { value: "Calm", translationKey: "sorae_mood_calm" },
  { value: "Tired", translationKey: "sorae_mood_tired" },
  { value: "Anxious", translationKey: "sorae_mood_anxious" },
  { value: "Confused", translationKey: "sorae_mood_confused" },
  { value: "Good", translationKey: "sorae_mood_good" },
];

export const soraeRituals: {
  id: RitualId;
  titleKey: string;
  icon:
    | "git-branch-outline"
    | "moon-outline"
    | "chatbubbles-outline"
    | "cloudy-night-outline";
}[] = [
  {
    id: "clear-thought",
    titleKey: "sorae_ritual_clear_thought",
    icon: "git-branch-outline",
  },
  {
    id: "close-day",
    titleKey: "sorae_ritual_close_day",
    icon: "moon-outline",
  },
  {
    id: "prepare-conversation",
    titleKey: "sorae_ritual_prepare_conversation",
    icon: "chatbubbles-outline",
  },
  {
    id: "before-sleep",
    titleKey: "sorae_ritual_before_sleep",
    icon: "cloudy-night-outline",
  },
];

export const createInitialMessages = (
  welcomeText = "I am here. Tell me what is on your mind today.",
): ChatMessage[] => [
  {
    id: "assistant-welcome",
    role: "assistant",
    text: welcomeText,
  },
];

export const initialMessages = createInitialMessages();

export const defaultActiveContext: ActiveContext = {
  title: "No context yet",
  timeframe: "Now",
  summary:
    "Sorae is still listening and has not formed context about this person yet.",
};

export const defaultBehaviorSignals: BehaviorSignal[] = [];

export const defaultRecentSummary = "The user has not shared a reflection yet.";

export const defaultFollowUpFocus = "Listen first, without assuming context.";

export const defaultRiskState: RiskState = {
  level: "none",
  summary: "No risk signals mentioned.",
  suggestedAction: "",
};

export const memoryNoticeStorageKey = "sorae-memory-notice-accepted";

export const maxVoiceRecordingSeconds = 90;

export const createLocalMessage = (
  role: ChatRole,
  text: string,
): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  text,
  createdAt: new Date().toISOString(),
});
