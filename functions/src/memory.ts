import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {defaultMemory, welcomeMessage} from "./defaults";
import {
  checkInsRef,
  dailyRef,
  memoryRef,
  messagesRef,
  preferencesRef,
  weeklySummaryRef,
} from "./firestore";
import {
  normalizeActiveContext,
  normalizeBehaviorSignals,
  normalizeDailyCheckIn,
  normalizeMemoryInsights,
  normalizeMemoryStatus,
  normalizeOnboarding,
  normalizeRiskState,
  normalizeStringList,
  normalizeWeeklySummary,
} from "./normalizers";
import {
  compactText,
  isRecord,
  mergeUnique,
  readString,
} from "./text";
import type {AiMemoryPatch, MemoryState} from "./types";

const isLegacySeededMemory = (value: unknown) => {
  if (!isRecord(value)) return false;

  const activeContext = value.activeContext;
  const activeTitle = isRecord(activeContext) ?
    readString(activeContext.title)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") :
    "";
  const recentSummary = readString(value.recentSummary)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    activeTitle.includes("trabajo") &&
    (
      recentSummary.includes("estres laboral") ||
      recentSummary.includes("presion laboral")
    )
  );
};

export const ensureUserMemory = async (uid: string) => {
  const [messagesSnapshot, userMessagesSnapshot, memorySnapshot] =
    await Promise.all([
      messagesRef(uid).limit(1).get(),
      messagesRef(uid).where("role", "==", "user").limit(1).get(),
      memoryRef(uid).get(),
    ]);

  const hasMessages = !messagesSnapshot.empty;
  const hasUserMessages = !userMessagesSnapshot.empty;
  const memoryData = memorySnapshot.data();
  const needsLegacyReset =
    memorySnapshot.exists &&
    !hasUserMessages &&
    isLegacySeededMemory(memoryData);

  const now = Timestamp.now();
  const batch = memoryRef(uid).firestore.batch();
  let shouldCommit = false;

  if (!hasMessages) {
    batch.set(messagesRef(uid).doc("assistant-welcome"), {
      role: "assistant",
      text: welcomeMessage,
      createdAt: now,
      source: "system",
    });
    shouldCommit = true;
  } else if (!hasUserMessages) {
    batch.set(messagesRef(uid).doc("assistant-welcome"), {
      role: "assistant",
      text: welcomeMessage,
      updatedAt: now,
      source: "system",
    }, {merge: true});
    shouldCommit = true;
  }

  if (!memorySnapshot.exists) {
    batch.set(memoryRef(uid), {
      ...defaultMemory(),
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    });
    shouldCommit = true;
  } else if (needsLegacyReset) {
    batch.set(memoryRef(uid), {
      ...defaultMemory(),
      createdAt: memorySnapshot.get("createdAt") ?? now,
      updatedAt: now,
      messageCount: 0,
      migratedAt: now,
    });
    shouldCommit = true;
  }

  if (!shouldCommit) return;

  await batch.commit();
};

export const readMemory = async (uid: string): Promise<MemoryState> => {
  const [snapshot, preferencesSnapshot, checkInsSnapshot, weeklySnapshot] =
    await Promise.all([
      memoryRef(uid).get(),
      preferencesRef(uid).get(),
      checkInsRef(uid).orderBy("createdAt", "desc").limit(1).get(),
      weeklySummaryRef(uid).get(),
    ]);
  const fallback = defaultMemory();

  if (!snapshot.exists) return fallback;

  const data = snapshot.data() ?? {};
  const latestCheckInDoc = checkInsSnapshot.docs[0];
  const hasUserShared =
    data.hasUserShared === true ||
    (typeof data.messageCount === "number" && data.messageCount > 0);

  return {
    memoryStatus: normalizeMemoryStatus(
      data.memoryStatus,
      hasUserShared ? "forming" : "empty",
    ),
    activeContext: normalizeActiveContext(
      data.activeContext,
      fallback.activeContext,
    ),
    behaviorSignals: normalizeBehaviorSignals(
      data.behaviorSignals,
      fallback.behaviorSignals,
    ),
    userPatterns: normalizeStringList(
      data.userPatterns,
      fallback.userPatterns,
      6,
    ),
    memoryInsights: normalizeMemoryInsights(
      data.memoryInsights,
      fallback.memoryInsights,
    ),
    recentSummary: compactText(
      readString(data.recentSummary, fallback.recentSummary),
      360,
    ),
    followUpFocus: compactText(
      readString(data.followUpFocus, fallback.followUpFocus),
      220,
    ),
    riskState: normalizeRiskState(data.riskState, fallback.riskState),
    hasUserShared,
    onboarding: normalizeOnboarding(preferencesSnapshot.data()),
    latestCheckIn: latestCheckInDoc ?
      normalizeDailyCheckIn(latestCheckInDoc.id, latestCheckInDoc.data()) :
      null,
    weeklySummary: normalizeWeeklySummary(weeklySnapshot.data()),
  };
};

const mergeMemory = (
  previousMemory: MemoryState,
  patch: AiMemoryPatch,
): MemoryState => {
  const nextStatus = patch.memoryStatus ?
    normalizeMemoryStatus(patch.memoryStatus, previousMemory.memoryStatus) :
    previousMemory.memoryStatus;
  const activeContext = patch.activeContext ?
    normalizeActiveContext(patch.activeContext, previousMemory.activeContext) :
    previousMemory.activeContext;
  const behaviorSignals = patch.behaviorSignals ?
    normalizeBehaviorSignals(
      patch.behaviorSignals,
      previousMemory.behaviorSignals,
    ) :
    previousMemory.behaviorSignals;
  const userPatterns = mergeUnique(
    [
      ...previousMemory.userPatterns,
      ...(patch.userPatterns ?? []),
    ],
    6,
  );
  const memoryInsights = patch.memoryInsights ?
    normalizeMemoryInsights(
      patch.memoryInsights,
      previousMemory.memoryInsights,
    ) :
    previousMemory.memoryInsights;

  return {
    memoryStatus: nextStatus === "empty" ? "forming" : nextStatus,
    activeContext,
    behaviorSignals,
    userPatterns,
    memoryInsights,
    recentSummary: compactText(
      patch.recentSummary ?? previousMemory.recentSummary,
      360,
    ),
    followUpFocus: compactText(
      patch.followUpFocus ?? previousMemory.followUpFocus,
      220,
    ),
    riskState: patch.riskState ?
      normalizeRiskState(patch.riskState, previousMemory.riskState) :
      previousMemory.riskState,
    hasUserShared: true,
    onboarding: previousMemory.onboarding,
    latestCheckIn: previousMemory.latestCheckIn,
    weeklySummary: previousMemory.weeklySummary,
  };
};

export const updateMemory = async (
  uid: string,
  userText: string,
  assistantText: string,
  previousMemory: MemoryState,
  patch: AiMemoryPatch,
) => {
  const memory = mergeMemory(previousMemory, patch);
  const now = Timestamp.now();
  const dateId = new Date().toISOString().slice(0, 10);
  const batch = memoryRef(uid).firestore.batch();

  batch.set(memoryRef(uid), {
    ...memory,
    updatedAt: now,
    messageCount: FieldValue.increment(2),
  }, {merge: true});

  batch.set(dailyRef(uid, dateId), {
    date: dateId,
    memoryStatus: memory.memoryStatus,
    activeContext: memory.activeContext,
    behaviorSignals: memory.behaviorSignals,
    memoryInsights: memory.memoryInsights,
    recentSummary: memory.recentSummary,
    followUpFocus: memory.followUpFocus,
    riskState: memory.riskState,
    lastUserMessage: compactText(userText, 360),
    lastAssistantMessage: compactText(assistantText, 360),
    updatedAt: now,
    exchangeCount: FieldValue.increment(1),
  }, {merge: true});

  await batch.commit();

  return memory;
};
