import type {
  ActiveContext,
  MemoryState,
  RiskState,
  SoraeLocale,
} from "./types";

export const modelName = "gemini-2.5-flash";

export const fallbackModelName = "gemini-2.5-flash-lite";

export const maxUserMessageLength = 2200;

export const welcomeMessage =
  "I am here. Tell me what is on your mind today.";

export const fallbackReply =
  "I am with you. Let's pick one small next step and keep talking from there.";

export const fallbackReplyForLocale = (locale: SoraeLocale) =>
  locale === "es" ?
    "Estoy contigo. Partamos por un paso pequeño y lo vamos pensando juntos." :
    fallbackReply;

export const defaultActiveContext: ActiveContext = {
  title: "No context yet",
  timeframe: "Now",
  summary:
    "Sorae is still listening and has not formed context about this person yet.",
};

export const defaultRiskState: RiskState = {
  level: "none",
  summary: "No risk signals mentioned.",
  suggestedAction: "",
};

export const defaultMemory = (): MemoryState => ({
  memoryStatus: "empty",
  activeContext: defaultActiveContext,
  behaviorSignals: [],
  userPatterns: [],
  memoryInsights: [],
  recentSummary: "The user has not shared a reflection yet.",
  followUpFocus: "Listen first, without assuming context.",
  riskState: defaultRiskState,
  hasUserShared: false,
  onboarding: null,
  latestCheckIn: null,
  weeklySummary: null,
});
