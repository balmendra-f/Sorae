import {HttpsError, onCall} from "firebase-functions/v2/https";
import {transcribeVoiceReflection} from "./ai";
import {getAuthenticatedUid} from "./auth";
import {maxUserMessageLength} from "./defaults";
import {
  checkInsRef,
  dailyCollectionRef,
  deleteCollection,
  memoryRef,
  messagesRef,
  preferencesRef,
  weeklySummaryRef,
} from "./firestore";
import {normalizeLocale} from "./locale";
import {ensureUserMemory, readMemory} from "./memory";
import {getRecentMessages} from "./messages";
import {saveCheckIn} from "./checkIns";
import {savePreferences} from "./preferences";
import {handleReflectionText} from "./reflectionFlow";
import {getRitualPrompt} from "./rituals";
import {createStateResponse} from "./stateResponse";
import {isRecord, readString} from "./text";
import {buildPersonalTimeline} from "./timeline";
import type {RitualId} from "./types";
import {generateWeeklySummary} from "./weeklySummary";

const loadSoraeState = async (uid: string) => {
  const [memory, messages, timelineItems] = await Promise.all([
    readMemory(uid),
    getRecentMessages(uid, 24),
    buildPersonalTimeline(uid),
  ]);

  return createStateResponse(messages, memory, undefined, timelineItems);
};

export const getSoraeState = onCall(async (request) => {
  const uid = getAuthenticatedUid(request);

  await ensureUserMemory(uid);

  return loadSoraeState(uid);
});

export const resetSoraeMemory = onCall(async (request) => {
  const uid = getAuthenticatedUid(request);

  await Promise.all([
    deleteCollection(messagesRef(uid)),
    deleteCollection(dailyCollectionRef(uid)),
    deleteCollection(checkInsRef(uid)),
    memoryRef(uid).delete(),
    preferencesRef(uid).delete(),
    weeklySummaryRef(uid).delete(),
  ]);

  await ensureUserMemory(uid);

  return loadSoraeState(uid);
});

export const sendReflection = onCall(
  {secrets: ["GEMINI_API_KEY"]},
  async (request) => {
    const uid = getAuthenticatedUid(request);
    const data = isRecord(request.data) ? request.data : {};
    const userText = readString(data.text);
    const locale = normalizeLocale(request.data);

    if (!userText) {
      throw new HttpsError(
        "invalid-argument",
        "The reflection cannot be empty.",
      );
    }

    if (userText.length > maxUserMessageLength) {
      throw new HttpsError(
        "invalid-argument",
        `The reflection must be under ${maxUserMessageLength} characters.`,
      );
    }

    return handleReflectionText(uid, userText, locale);
  },
);

export const saveSoraeOnboarding = onCall(async (request) => {
  const uid = getAuthenticatedUid(request);

  try {
    await savePreferences(uid, request.data);
  } catch {
    throw new HttpsError(
      "invalid-argument",
      "The initial preferences are not valid.",
    );
  }

  await ensureUserMemory(uid);

  return loadSoraeState(uid);
});

export const saveDailyCheckIn = onCall(
  {secrets: ["GEMINI_API_KEY"]},
  async (request) => {
    const uid = getAuthenticatedUid(request);
    const locale = normalizeLocale(request.data);
    let checkInReflection: string;

    try {
      checkInReflection = await saveCheckIn(uid, request.data);
    } catch {
      throw new HttpsError(
        "invalid-argument",
        "The daily check-in is not valid.",
      );
    }

    return handleReflectionText(uid, checkInReflection, locale);
  },
);

export const startGuidedRitual = onCall(
  {secrets: ["GEMINI_API_KEY"]},
  async (request) => {
    const uid = getAuthenticatedUid(request);
    const data = isRecord(request.data) ? request.data : {};
    const locale = normalizeLocale(request.data);
    const ritualId = readString(data.ritualId) as RitualId;
    const ritualPrompt = getRitualPrompt(ritualId, locale);

    if (!ritualPrompt) {
      throw new HttpsError("invalid-argument", "The ritual is not valid.");
    }

    return handleReflectionText(uid, ritualPrompt, locale);
  },
);

export const generateSoraeWeeklySummary = onCall(
  {secrets: ["GEMINI_API_KEY"]},
  async (request) => {
    const uid = getAuthenticatedUid(request);
    const locale = normalizeLocale(request.data);

    await ensureUserMemory(uid);
    await generateWeeklySummary(uid, locale);

    return loadSoraeState(uid);
  },
);

export const sendVoiceReflection = onCall(
  {secrets: ["GEMINI_API_KEY"]},
  async (request) => {
    const uid = getAuthenticatedUid(request);
    const data = isRecord(request.data) ? request.data : {};
    const audioBase64 = readString(data.audioBase64);
    const mimeType = readString(data.mimeType, "audio/mp4");
    const locale = normalizeLocale(request.data);
    const supportedMimeTypes = [
      "audio/mp4",
      "audio/m4a",
      "audio/aac",
      "audio/webm",
      "audio/wav",
    ];

    if (!audioBase64 || !supportedMimeTypes.includes(mimeType)) {
      throw new HttpsError(
        "invalid-argument",
        "The submitted audio is not valid.",
      );
    }

    if (audioBase64.length > 7000000) {
      throw new HttpsError(
        "invalid-argument",
        "The voice note is too long.",
      );
    }

    const transcript = await transcribeVoiceReflection(
      audioBase64,
      mimeType,
      locale,
    );

    if (!transcript) {
      throw new HttpsError(
        "invalid-argument",
        "The voice note could not be transcribed.",
      );
    }

    return handleReflectionText(uid, transcript, locale);
  },
);
