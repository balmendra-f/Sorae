export type ChatRole = "assistant" | "user";

export type SoraeLocale = "en" | "es";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt?: string;
  options?: string[];
};

export type ActiveContext = {
  title: string;
  timeframe: string;
  summary: string;
};

export type BehaviorSignal = {
  label: string;
  value: string;
  confidence?: number;
};

export type MemoryStatus = "empty" | "forming" | "active";

export type InsightKind = "fact" | "emotion" | "theme" | "hypothesis";

export type MemoryInsight = {
  kind: InsightKind;
  label: string;
  detail: string;
  confidence: number;
};

export type RiskLevel = "none" | "watch" | "urgent";

export type RiskState = {
  level: RiskLevel;
  summary: string;
  suggestedAction: string;
};

export type OnboardingPreferences = {
  goals: string[];
  tone: "gentle" | "direct" | "reflective" | "practical";
  reminderCadence: "none" | "daily" | "weekdays" | "weekly";
  completedAt?: string;
};

export type DailyCheckIn = {
  id: string;
  mood: string;
  energy: number;
  note?: string;
  createdAt?: string;
};

export type WeeklySummary = {
  generatedAt: string;
  headline: string;
  themes: string[];
  emotionalTone: string;
  helpfulSignals: string[];
  suggestedRitual: string;
};

export type TimelineCategory = "reflection" | "decision" | "mood" | "theme";

export type PersonalTimelineItem = {
  id: string;
  category: TimelineCategory;
  date: string;
  title: string;
  body: string;
  tags: string[];
  mood?: string;
  energy?: number;
};

export type RitualId =
  | "clear-thought"
  | "close-day"
  | "prepare-conversation"
  | "before-sleep";

export type SoraeStateResponse = {
  messages?: ChatMessage[];
  memoryStatus?: MemoryStatus;
  activeContext?: ActiveContext;
  behaviorSignals?: BehaviorSignal[];
  userPatterns?: string[];
  memoryInsights?: MemoryInsight[];
  recentSummary?: string;
  followUpFocus?: string;
  riskState?: RiskState;
  hasUserShared?: boolean;
  onboarding?: OnboardingPreferences | null;
  latestCheckIn?: DailyCheckIn | null;
  weeklySummary?: WeeklySummary | null;
  timelineItems?: PersonalTimelineItem[];
  response?: ChatMessage;
};

export type SoraeAIContextValue = {
  messages: ChatMessage[];
  memoryStatus: MemoryStatus;
  activeContext: ActiveContext;
  behaviorSignals: BehaviorSignal[];
  userPatterns: string[];
  memoryInsights: MemoryInsight[];
  recentSummary: string;
  followUpFocus: string;
  riskState: RiskState;
  hasUserShared: boolean;
  onboarding: OnboardingPreferences | null;
  latestCheckIn: DailyCheckIn | null;
  weeklySummary: WeeklySummary | null;
  timelineItems: PersonalTimelineItem[];
  isLoading: boolean;
  isSending: boolean;
  isSendingVoice: boolean;
  isResetting: boolean;
  isSavingOnboarding: boolean;
  isCheckingIn: boolean;
  isStartingRitual: boolean;
  isGeneratingWeeklySummary: boolean;
  errorMessage: string;
  isMemoryNoticeVisible: boolean;
  acceptMemoryNotice: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  sendVoiceMessage: (audioBase64: string, mimeType: string) => Promise<void>;
  saveOnboarding: (preferences: OnboardingPreferences) => Promise<void>;
  saveCheckIn: (mood: string, energy: number, note?: string) => Promise<void>;
  startRitual: (ritualId: RitualId) => Promise<void>;
  refreshWeeklySummary: () => Promise<void>;
  refreshState: () => Promise<void>;
  resetMemory: () => Promise<void>;
};
