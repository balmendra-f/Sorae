import {checkInsRef, dailyCollectionRef} from "./firestore";
import {compactText, isRecord, readString, toIsoDate} from "./text";
import type {
  BehaviorSignal,
  MemoryInsight,
  PersonalTimelineItem,
  TimelineCategory,
} from "./types";

const decisionPatterns = [
  "decidi",
  "decidio",
  "decidir",
  "decision",
  "voy a",
  "elegi",
  "resolver",
  "resolvi",
  "acorde",
  "acordamos",
  "i decided",
  "decision",
  "i will",
  "i'm going to",
  "we agreed",
];

const normalizeForMatching = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isDecisionLike = (text: string) => {
  const normalized = normalizeForMatching(text);

  return decisionPatterns.some((pattern) => normalized.includes(pattern));
};

const readDate = (value: Record<string, unknown>, fallbackId: string) =>
  readString(value.createdAtIso) ||
  toIsoDate(value.updatedAt) ||
  toIsoDate(value.createdAt) ||
  `${fallbackId}T12:00:00.000Z`;

const readInsights = (value: unknown): MemoryInsight[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): MemoryInsight | null => {
      if (!isRecord(item)) return null;

      const kind = readString(item.kind) as MemoryInsight["kind"];
      const label = compactText(readString(item.label), 36);
      const detail = compactText(readString(item.detail), 120);

      if (!label && !detail) return null;

      return {
        kind,
        label: label || detail,
        detail,
        confidence:
          typeof item.confidence === "number" && !Number.isNaN(item.confidence) ?
            item.confidence :
            0.45,
      };
    })
    .filter((item): item is MemoryInsight => item !== null);
};

const readSignals = (value: unknown): BehaviorSignal[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): BehaviorSignal | null => {
      if (!isRecord(item)) return null;

      const label = compactText(readString(item.label), 24);
      const signalValue = compactText(readString(item.value), 24);

      if (!label || !signalValue) return null;

      return {label, value: signalValue};
    })
    .filter((item): item is BehaviorSignal => item !== null);
};

const uniqueTags = (tags: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  tags.forEach((tag) => {
    const normalized = compactText(tag, 42);
    const key = normalized.toLowerCase();

    if (!normalized || seen.has(key)) return;

    seen.add(key);
    result.push(normalized);
  });

  return result.slice(0, 4);
};

const categoryForDaily = (
  text: string,
  insights: MemoryInsight[],
  exchangeCount: number,
): TimelineCategory => {
  if (isDecisionLike(text)) return "decision";

  const hasTheme = insights.some(
    (insight) => insight.kind === "theme" || insight.kind === "hypothesis",
  );

  if (hasTheme || exchangeCount > 1) return "theme";

  return "reflection";
};

export const buildPersonalTimeline = async (
  uid: string,
): Promise<PersonalTimelineItem[]> => {
  const [dailySnapshot, checkInsSnapshot] = await Promise.all([
    dailyCollectionRef(uid).orderBy("updatedAt", "desc").limit(12).get(),
    checkInsRef(uid).orderBy("createdAt", "desc").limit(8).get(),
  ]);

  const dailyItems = dailySnapshot.docs
    .map((doc): PersonalTimelineItem | null => {
      const data = doc.data();
      const activeContext = isRecord(data.activeContext) ?
        data.activeContext :
        {};
      const title = compactText(
        readString(activeContext.title, readString(data.date, "Reflection")),
        70,
      );
      const summary = compactText(
        readString(data.recentSummary, readString(activeContext.summary)),
        240,
      );
      const lastUserMessage = compactText(readString(data.lastUserMessage), 180);
      const body = summary || lastUserMessage;

      if (!title && !body) return null;

      const insights = readInsights(data.memoryInsights);
      const signals = readSignals(data.behaviorSignals);
      const exchangeCount =
        typeof data.exchangeCount === "number" && !Number.isNaN(data.exchangeCount) ?
          data.exchangeCount :
          0;
      const category = categoryForDaily(
        `${title} ${body} ${lastUserMessage}`,
        insights,
        exchangeCount,
      );
      const insightTags = insights
        .filter((insight) => insight.kind !== "fact")
        .map((insight) => insight.label);
      const signalTags = signals.map((signal) => `${signal.label}: ${signal.value}`);

      return {
        id: `daily-${doc.id}`,
        category,
        date: readDate(data, doc.id),
        title,
        body,
        tags: uniqueTags([...insightTags, ...signalTags]),
      };
    })
    .filter((item): item is PersonalTimelineItem => item !== null);

  const checkInItems = checkInsSnapshot.docs
    .map((doc): PersonalTimelineItem | null => {
      const data = doc.data();
      const mood = compactText(readString(data.mood), 32);
      const note = compactText(readString(data.note), 180);
      const energy =
        typeof data.energy === "number" && !Number.isNaN(data.energy) ?
          Math.max(1, Math.min(5, Math.round(data.energy))) :
          undefined;

      if (!mood && energy === undefined) return null;

      return {
        id: `check-in-${doc.id}`,
        category: "mood",
        date: readDate(data, doc.id),
        title: mood || doc.id,
        body: note,
        tags: energy === undefined ? [] : [`${energy}/5`],
        ...(mood ? {mood} : {}),
        ...(energy === undefined ? {} : {energy}),
      };
    })
    .filter((item): item is PersonalTimelineItem => item !== null);

  return [...dailyItems, ...checkInItems]
    .sort((left, right) => Date.parse(right.date) - Date.parse(left.date))
    .slice(0, 12);
};
