import {defaultMemory, defaultRiskState} from "./defaults";
import {compactText, isRecord, readNumber, readString} from "./text";
import type {
  ActiveContext,
  BehaviorSignal,
  DailyCheckIn,
  InsightKind,
  MemoryInsight,
  MemoryStatus,
  OnboardingPreferences,
  RiskLevel,
  RiskState,
  WeeklySummary,
} from "./types";

export const normalizeActiveContext = (
  value: unknown,
  fallback = defaultMemory().activeContext,
): ActiveContext => {
  if (!isRecord(value)) return fallback;

  return {
    title: compactText(readString(value.title, fallback.title), 42),
    timeframe: compactText(readString(value.timeframe, fallback.timeframe), 24),
    summary: compactText(readString(value.summary, fallback.summary), 280),
  };
};

export const normalizeMemoryStatus = (
  value: unknown,
  fallback: MemoryStatus = "empty",
): MemoryStatus => {
  if (value === "forming" || value === "active" || value === "empty") {
    return value;
  }

  return fallback;
};

export const normalizeBehaviorSignals = (
  value: unknown,
  fallback = defaultMemory().behaviorSignals,
): BehaviorSignal[] => {
  if (!Array.isArray(value)) return fallback;

  const signals = value
    .map((item): BehaviorSignal | null => {
      if (!isRecord(item)) return null;

      const label = compactText(readString(item.label), 24);
      const signalValue = compactText(readString(item.value), 24);

      if (!label || !signalValue) return null;

      const signal: BehaviorSignal = {
        label,
        value: signalValue,
      };
      const confidence = readNumber(item.confidence);

      if (confidence !== undefined) signal.confidence = confidence;

      return signal;
    })
    .filter((item): item is BehaviorSignal => item !== null)
    .slice(0, 3);

  return signals;
};

export const normalizeStringList = (
  value: unknown,
  fallback: string[],
  maxItems: number,
) => {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .map((item) => compactText(readString(item), 140))
    .filter((item) => item.length > 0);

  return items.slice(0, maxItems);
};

const normalizeInsightKind = (value: unknown): InsightKind => {
  if (
    value === "fact" ||
    value === "emotion" ||
    value === "theme" ||
    value === "hypothesis"
  ) {
    return value;
  }

  return "hypothesis";
};

export const normalizeMemoryInsights = (
  value: unknown,
  fallback = defaultMemory().memoryInsights,
): MemoryInsight[] => {
  if (!Array.isArray(value)) return fallback;

  const insights = value
    .map((item): MemoryInsight | null => {
      if (!isRecord(item)) return null;

      const kind = normalizeInsightKind(item.kind);
      const label = compactText(readString(item.label), 32);
      const detail = compactText(readString(item.detail), 180);
      const confidence = readNumber(item.confidence) ?? 0.45;

      if (!label || !detail) return null;

      return {
        kind,
        label,
        detail,
        confidence,
      };
    })
    .filter((item): item is MemoryInsight => item !== null);

  return insights.slice(0, 8);
};

const normalizeRiskLevel = (
  value: unknown,
  fallback: RiskLevel = "none",
): RiskLevel => {
  if (value === "none" || value === "watch" || value === "urgent") {
    return value;
  }

  return fallback;
};

export const normalizeRiskState = (
  value: unknown,
  fallback = defaultRiskState,
): RiskState => {
  if (!isRecord(value)) return fallback;

  const level = normalizeRiskLevel(value.level, fallback.level);
  const summary = compactText(readString(value.summary, fallback.summary), 180);

  if (level === "none") {
    return {
      level,
      summary: summary || defaultRiskState.summary,
      suggestedAction: "",
    };
  }

  return {
    level,
    summary,
    suggestedAction: compactText(
      readString(value.suggestedAction, fallback.suggestedAction),
      220,
    ),
  };
};

const normalizeTone = (
  value: unknown,
): OnboardingPreferences["tone"] => {
  if (
    value === "gentle" ||
    value === "direct" ||
    value === "reflective" ||
    value === "practical"
  ) {
    return value;
  }

  return "gentle";
};

const normalizeReminderCadence = (
  value: unknown,
): OnboardingPreferences["reminderCadence"] => {
  if (
    value === "none" ||
    value === "daily" ||
    value === "weekdays" ||
    value === "weekly"
  ) {
    return value;
  }

  return "none";
};

export const normalizeOnboarding = (
  value: unknown,
): OnboardingPreferences | null => {
  if (!isRecord(value)) return null;
  const completedAt = readString(value.completedAt);

  return {
    goals: normalizeStringList(value.goals, [], 4),
    tone: normalizeTone(value.tone),
    reminderCadence: normalizeReminderCadence(value.reminderCadence),
    ...(completedAt ? {completedAt} : {}),
  };
};

export const normalizeDailyCheckIn = (
  id: string,
  value: unknown,
): DailyCheckIn | null => {
  if (!isRecord(value)) return null;

  const mood = compactText(readString(value.mood), 32);
  const energy =
    typeof value.energy === "number" && !Number.isNaN(value.energy) ?
      Math.max(1, Math.min(5, Math.round(value.energy))) :
      undefined;

  if (!mood || energy === undefined) return null;
  const note = compactText(readString(value.note), 180);
  const createdAt = readString(value.createdAtIso);

  return {
    id,
    mood,
    energy,
    ...(note ? {note} : {}),
    ...(createdAt ? {createdAt} : {}),
  };
};

export const normalizeWeeklySummary = (
  value: unknown,
): WeeklySummary | null => {
  if (!isRecord(value)) return null;

  const generatedAt = readString(value.generatedAt);
  const headline = compactText(readString(value.headline), 120);

  if (!generatedAt || !headline) return null;

  return {
    generatedAt,
    headline,
    themes: normalizeStringList(value.themes, [], 5),
    emotionalTone: compactText(readString(value.emotionalTone), 100),
    helpfulSignals: normalizeStringList(value.helpfulSignals, [], 5),
    suggestedRitual: compactText(readString(value.suggestedRitual), 160),
  };
};
