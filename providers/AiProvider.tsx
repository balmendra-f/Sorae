import {
  createLocalMessage,
  createInitialMessages,
  defaultActiveContext,
  defaultBehaviorSignals,
  defaultFollowUpFocus,
  defaultRecentSummary,
  defaultRiskState,
  memoryNoticeStorageKey,
} from "@/constants/sorae";
import { useAuth } from "@/providers/AuthProvider";
import { soraeApi } from "@/services/soraeApi";
import type {
  ActiveContext,
  BehaviorSignal,
  ChatMessage,
  ChatRole,
  DailyCheckIn,
  InsightKind,
  MemoryInsight,
  MemoryStatus,
  OnboardingPreferences,
  PersonalTimelineItem,
  RiskState,
  RitualId,
  SoraeAIContextValue,
  SoraeLocale,
  SoraeStateResponse,
  WeeklySummary,
} from "@/types/sorae";
import { syncSoraeReminders } from "@/utils/soraeReminders";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

const SoraeAIContext = createContext<SoraeAIContextValue | undefined>(
  undefined,
);

type CachedSoraeState = {
  version: number;
  uid: string;
  cachedAt: number;
  state: SoraeStateResponse;
};

type RefreshStateOptions = {
  forceRemote?: boolean;
};

const soraeStateCacheVersion = 1;
const soraeStateCacheFreshMs = 5 * 60 * 1000;
const soraeStateCacheKey = (uid: string) => `sorae-state-cache:${uid}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCachedSoraeState = (
  value: unknown,
  uid: string,
): value is CachedSoraeState => {
  if (!isRecord(value)) return false;

  return (
    value.version === soraeStateCacheVersion &&
    value.uid === uid &&
    typeof value.cachedAt === "number" &&
    isRecord(value.state)
  );
};

const readCachedSoraeState = async (uid: string) => {
  try {
    const rawValue = await AsyncStorage.getItem(soraeStateCacheKey(uid));
    if (!rawValue) return null;

    const parsedValue = JSON.parse(rawValue);
    if (isCachedSoraeState(parsedValue, uid)) return parsedValue;
  } catch {
    return null;
  }

  await AsyncStorage.removeItem(soraeStateCacheKey(uid));
  return null;
};

const writeCachedSoraeState = async (
  uid: string,
  state: SoraeStateResponse,
) => {
  try {
    const cachedState: CachedSoraeState = {
      version: soraeStateCacheVersion,
      uid,
      cachedAt: Date.now(),
      state,
    };

    await AsyncStorage.setItem(
      soraeStateCacheKey(uid),
      JSON.stringify(cachedState),
    );
  } catch {
    // Cache writes should never block the chat flow.
  }
};

const SoraeAIProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const locale: SoraeLocale = i18n.language?.startsWith("es") ? "es" : "en";
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createInitialMessages(t("sorae_welcome_message")),
  );
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus>("empty");
  const [activeContext, setActiveContext] =
    useState<ActiveContext>(defaultActiveContext);
  const [behaviorSignals, setBehaviorSignals] = useState<BehaviorSignal[]>(
    defaultBehaviorSignals,
  );
  const [userPatterns, setUserPatterns] = useState<string[]>([]);
  const [memoryInsights, setMemoryInsights] = useState<MemoryInsight[]>([]);
  const [recentSummary, setRecentSummary] = useState(defaultRecentSummary);
  const [followUpFocus, setFollowUpFocus] = useState(defaultFollowUpFocus);
  const [riskState, setRiskState] = useState<RiskState>(defaultRiskState);
  const [hasUserShared, setHasUserShared] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingPreferences | null>(
    null,
  );
  const [latestCheckIn, setLatestCheckIn] = useState<DailyCheckIn | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(
    null,
  );
  const [timelineItems, setTimelineItems] = useState<PersonalTimelineItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isStartingRitual, setIsStartingRitual] = useState(false);
  const [isGeneratingWeeklySummary, setIsGeneratingWeeklySummary] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMemoryNoticeVisible, setIsMemoryNoticeVisible] = useState(false);

  const applySoraeState = useCallback((state: SoraeStateResponse) => {
    if (Array.isArray(state.messages)) {
      setMessages(
        state.messages.map((message) =>
          message.id === "assistant-welcome"
            ? { ...message, text: t("sorae_welcome_message") }
            : message,
        ),
      );
    }
    if (state.memoryStatus) setMemoryStatus(state.memoryStatus);
    if (state.activeContext) setActiveContext(state.activeContext);
    if (Array.isArray(state.behaviorSignals)) {
      setBehaviorSignals(state.behaviorSignals);
    }
    if (Array.isArray(state.userPatterns)) setUserPatterns(state.userPatterns);
    if (Array.isArray(state.memoryInsights)) {
      setMemoryInsights(state.memoryInsights);
    }
    if (state.recentSummary) setRecentSummary(state.recentSummary);
    if (state.followUpFocus) setFollowUpFocus(state.followUpFocus);
    if (state.riskState) setRiskState(state.riskState);
    if (typeof state.hasUserShared === "boolean") {
      setHasUserShared(state.hasUserShared);
    }
    if ("onboarding" in state) setOnboarding(state.onboarding ?? null);
    if ("latestCheckIn" in state) {
      setLatestCheckIn(state.latestCheckIn ?? null);
    }
    if ("weeklySummary" in state) {
      setWeeklySummary(state.weeklySummary ?? null);
    }
    if (Array.isArray(state.timelineItems)) {
      setTimelineItems(state.timelineItems);
    }
  }, [t]);

  const persistSoraeState = useCallback(
    async (state: SoraeStateResponse) => {
      if (!userId) return;

      await writeCachedSoraeState(userId, state);
    },
    [userId],
  );

  const resetLocalState = useCallback(() => {
    setMessages(createInitialMessages(t("sorae_welcome_message")));
    setMemoryStatus("empty");
    setActiveContext(defaultActiveContext);
    setBehaviorSignals(defaultBehaviorSignals);
    setUserPatterns([]);
    setMemoryInsights([]);
    setRecentSummary(defaultRecentSummary);
    setFollowUpFocus(defaultFollowUpFocus);
    setRiskState(defaultRiskState);
    setHasUserShared(false);
    setOnboarding(null);
    setLatestCheckIn(null);
    setWeeklySummary(null);
    setTimelineItems([]);
  }, [t]);

  useEffect(() => {
    const loadMemoryNotice = async () => {
      if (!userId) {
        setIsMemoryNoticeVisible(false);
        return;
      }

      const accepted = await AsyncStorage.getItem(memoryNoticeStorageKey);
      setIsMemoryNoticeVisible(accepted !== "true");
    };

    void loadMemoryNotice();
  }, [userId]);

  const acceptMemoryNotice = useCallback(async () => {
    setIsMemoryNoticeVisible(false);
    await AsyncStorage.setItem(memoryNoticeStorageKey, "true");
  }, []);

  const refreshState = useCallback(async (options?: RefreshStateOptions) => {
    if (!userId) {
      resetLocalState();
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    const cachedState = await readCachedSoraeState(userId);
    const hasCachedState = cachedState !== null;

    if (cachedState) {
      applySoraeState(cachedState.state);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    const shouldFetchRemote =
      options?.forceRemote ||
      !cachedState ||
      Date.now() - cachedState.cachedAt > soraeStateCacheFreshMs;

    if (!shouldFetchRemote) return;

    try {
      const state = await soraeApi.getState(locale);
      applySoraeState(state);
      await persistSoraeState(state);
    } catch {
      if (!hasCachedState) {
        setErrorMessage(
          t("sorae_error_load_memory"),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    applySoraeState,
    locale,
    persistSoraeState,
    resetLocalState,
    t,
    userId,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void refreshState();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [refreshState]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText || isSending) return;

      if (!userId) {
        setErrorMessage(t("sorae_error_auth_required"));
        return;
      }

      setErrorMessage("");
      setIsSending(true);
      setMessages((currentMessages) => [
        ...currentMessages,
        createLocalMessage("user", trimmedText),
      ]);

      try {
        const state = await soraeApi.sendReflection(trimmedText, locale);
        applySoraeState(state);
        await persistSoraeState(state);
      } catch {
        setErrorMessage(
          t("sorae_error_connect_failed"),
        );
        setMessages((currentMessages) => [
          ...currentMessages,
          createLocalMessage(
            "assistant",
            t("sorae_error_temporary_reply_failed"),
          ),
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [applySoraeState, isSending, locale, persistSoraeState, t, userId],
  );

  const resetMemory = useCallback(async () => {
    if (!userId || isResetting) return;

    setErrorMessage("");
    setIsResetting(true);

    try {
      const state = await soraeApi.resetMemory();
      applySoraeState(state);
      await persistSoraeState(state);
    } catch {
      setErrorMessage(
        t("sorae_error_reset_failed"),
      );
    } finally {
      setIsResetting(false);
    }
  }, [applySoraeState, isResetting, persistSoraeState, t, userId]);

  const saveOnboarding = useCallback(
    async (preferences: OnboardingPreferences) => {
      if (!userId || isSavingOnboarding) return;

      setErrorMessage("");
      setIsSavingOnboarding(true);

      try {
        const state = await soraeApi.saveOnboarding(preferences);
        await syncSoraeReminders(preferences.reminderCadence);
        applySoraeState(state);
        await persistSoraeState(state);
      } catch {
        setErrorMessage(
          t("sorae_error_save_preferences_failed"),
        );
      } finally {
        setIsSavingOnboarding(false);
      }
    },
    [applySoraeState, isSavingOnboarding, persistSoraeState, t, userId],
  );

  const saveCheckIn = useCallback(
    async (mood: string, energy: number, note?: string) => {
      if (!userId || isCheckingIn) return;

      setErrorMessage("");
      setIsCheckingIn(true);

      try {
        const state = await soraeApi.saveCheckIn(mood, energy, locale, note);
        applySoraeState(state);
        await persistSoraeState(state);
      } catch {
        setErrorMessage(
          t("sorae_error_check_in_failed"),
        );
      } finally {
        setIsCheckingIn(false);
      }
    },
    [applySoraeState, isCheckingIn, locale, persistSoraeState, t, userId],
  );

  const startRitual = useCallback(
    async (ritualId: RitualId) => {
      if (!userId || isStartingRitual) return;

      setErrorMessage("");
      setIsStartingRitual(true);

      try {
        const state = await soraeApi.startRitual(ritualId, locale);
        applySoraeState(state);
        await persistSoraeState(state);
      } catch {
        setErrorMessage(
          t("sorae_error_ritual_failed"),
        );
      } finally {
        setIsStartingRitual(false);
      }
    },
    [applySoraeState, isStartingRitual, locale, persistSoraeState, t, userId],
  );

  const refreshWeeklySummary = useCallback(async () => {
    if (!userId || isGeneratingWeeklySummary) return;

    setErrorMessage("");
    setIsGeneratingWeeklySummary(true);

    try {
      const state = await soraeApi.generateWeeklySummary(locale);
      applySoraeState(state);
      await persistSoraeState(state);
    } catch {
      setErrorMessage(
        t("sorae_error_weekly_failed"),
      );
    } finally {
      setIsGeneratingWeeklySummary(false);
    }
  }, [
    applySoraeState,
    isGeneratingWeeklySummary,
    locale,
    persistSoraeState,
    t,
    userId,
  ]);

  const sendVoiceMessage = useCallback(
    async (audioBase64: string, mimeType: string) => {
      if (!userId || isSendingVoice) return;

      setErrorMessage("");
      setIsSendingVoice(true);

      try {
        const state = await soraeApi.sendVoiceReflection(
          audioBase64,
          mimeType,
          locale,
        );
        applySoraeState(state);
        await persistSoraeState(state);
      } catch {
        setErrorMessage(
          t("sorae_error_voice_failed"),
        );
      } finally {
        setIsSendingVoice(false);
      }
    },
    [applySoraeState, isSendingVoice, locale, persistSoraeState, t, userId],
  );

  const value = useMemo(
    () => ({
      messages,
      memoryStatus,
      activeContext,
      behaviorSignals,
      userPatterns,
      memoryInsights,
      recentSummary,
      followUpFocus,
      riskState,
      hasUserShared,
      onboarding,
      latestCheckIn,
      weeklySummary,
      timelineItems,
      isLoading,
      isSending,
      isSendingVoice,
      isResetting,
      isSavingOnboarding,
      isCheckingIn,
      isStartingRitual,
      isGeneratingWeeklySummary,
      errorMessage,
      isMemoryNoticeVisible,
      acceptMemoryNotice,
      sendMessage,
      sendVoiceMessage,
      saveOnboarding,
      saveCheckIn,
      startRitual,
      refreshWeeklySummary,
      refreshState,
      resetMemory,
    }),
    [
      acceptMemoryNotice,
      activeContext,
      behaviorSignals,
      errorMessage,
      followUpFocus,
      hasUserShared,
      isMemoryNoticeVisible,
      isCheckingIn,
      isGeneratingWeeklySummary,
      isLoading,
      isResetting,
      isSavingOnboarding,
      isSending,
      isSendingVoice,
      isStartingRitual,
      latestCheckIn,
      memoryInsights,
      memoryStatus,
      messages,
      onboarding,
      recentSummary,
      refreshWeeklySummary,
      refreshState,
      resetMemory,
      riskState,
      saveCheckIn,
      saveOnboarding,
      sendMessage,
      sendVoiceMessage,
      startRitual,
      timelineItems,
      weeklySummary,
      userPatterns,
    ],
  );

  return (
    <SoraeAIContext.Provider value={value}>{children}</SoraeAIContext.Provider>
  );
};

function useSoraeAI() {
  const context = useContext(SoraeAIContext);

  if (context === undefined) {
    throw new Error("useSoraeAI must be used within a SoraeAIProvider");
  }

  return context;
}

export { useSoraeAI };
export type {
  ActiveContext,
  BehaviorSignal,
  ChatMessage,
  ChatRole,
  InsightKind,
  OnboardingPreferences,
  DailyCheckIn,
  MemoryInsight,
  MemoryStatus,
  PersonalTimelineItem,
  RitualId,
  RiskState,
  WeeklySummary,
};
export default SoraeAIProvider;
