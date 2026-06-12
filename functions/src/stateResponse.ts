import type {ChatMessage, MemoryState, PersonalTimelineItem} from "./types";

export const createStateResponse = (
  messages: ChatMessage[],
  memory: MemoryState,
  response?: ChatMessage,
  timelineItems: PersonalTimelineItem[] = [],
) => ({
  messages,
  memoryStatus: memory.memoryStatus,
  activeContext: memory.activeContext,
  behaviorSignals: memory.behaviorSignals,
  userPatterns: memory.userPatterns,
  memoryInsights: memory.memoryInsights,
  recentSummary: memory.recentSummary,
  followUpFocus: memory.followUpFocus,
  riskState: memory.riskState,
  hasUserShared: memory.hasUserShared,
  onboarding: memory.onboarding,
  latestCheckIn: memory.latestCheckIn,
  weeklySummary: memory.weeklySummary,
  timelineItems,
  response,
});
