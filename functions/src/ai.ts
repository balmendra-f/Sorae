import {GoogleGenAI} from "@google/genai";
import {logger} from "firebase-functions";
import {
  fallbackModelName,
  fallbackReplyForLocale,
  modelName,
} from "./defaults";
import {
  normalizeActiveContext,
  normalizeBehaviorSignals,
  normalizeMemoryInsights,
  normalizeMemoryStatus,
  normalizeRiskState,
  normalizeStringList,
} from "./normalizers";
import {buildSoraePrompt} from "./prompt";
import {detectRiskState, ensureRiskGuidance} from "./risk";
import {compactText, isRecord, readString} from "./text";
import type {
  AiMemoryPatch,
  AiResponse,
  ChatMessage,
  MemoryState,
  SoraeLocale,
} from "./types";

const modelCandidates = [modelName, fallbackModelName];

const generateText = async (contents: string, logContext: object) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not available in this function.");
  }

  const ai = new GoogleGenAI({apiKey});
  let lastError: unknown;

  for (const model of modelCandidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      });

      return readString(response.text);
    } catch (error) {
      lastError = error;
      logger.warn("Gemini generation failed for model candidate.", {
        ...logContext,
        model,
        error,
      });
    }
  }

  throw lastError instanceof Error ?
    lastError :
    new Error("Gemini generation failed for all model candidates.");
};

const extractJson = (text: string) => {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fencedMatch?.[1] ?? trimmed;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new Error("Gemini response did not contain JSON.");
  }

  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as unknown;
};

export const createFallbackMemory = (
  previousMemory: MemoryState,
  userText: string,
): AiMemoryPatch => {
  const riskState = detectRiskState(userText);
  const summary = `Latest user reflection: ${compactText(userText)}`;

  return {
    memoryStatus: "forming",
    activeContext: {
      title: "Recent reflection",
      timeframe: "Now",
      summary,
    },
    behaviorSignals: [],
    userPatterns: [],
    memoryInsights: [
      {
        kind: "fact",
        label: "Recent reflection",
        detail: compactText(userText, 180),
        confidence: 0.6,
      },
    ],
    recentSummary: summary,
    followUpFocus: riskState.level === "urgent" ?
      "Prioritize safety and immediate support." :
      previousMemory.hasUserShared ?
        previousMemory.followUpFocus :
        "Understand which part needs more space right now.",
    riskState,
  };
};

const normalizeAiResponse = (
  rawText: string,
  previousMemory: MemoryState,
  userText: string,
  locale: SoraeLocale,
): AiResponse => {
  const fallbackReply = fallbackReplyForLocale(locale);

  try {
    const parsed = extractJson(rawText);

    if (!isRecord(parsed)) {
      throw new Error("Parsed Gemini response was not an object.");
    }

    const memoryRecord = isRecord(parsed.memory) ? parsed.memory : {};
    const detectedRisk = detectRiskState(userText);
    const aiRiskState = normalizeRiskState(
      memoryRecord.riskState,
      previousMemory.riskState,
    );
    const riskState = detectedRisk.level === "urgent" &&
      aiRiskState.level !== "urgent" ?
      detectedRisk :
      aiRiskState;
    const reply = ensureRiskGuidance(
      compactText(readString(parsed.reply), 520) || fallbackReply,
      riskState,
    );
    const status = normalizeMemoryStatus(
      memoryRecord.memoryStatus,
      previousMemory.memoryStatus,
    );

    return {
      reply,
      memory: {
        memoryStatus: status === "empty" ? "forming" : status,
        activeContext: normalizeActiveContext(
          memoryRecord.activeContext,
          previousMemory.activeContext,
        ),
        behaviorSignals: normalizeBehaviorSignals(
          memoryRecord.behaviorSignals,
          previousMemory.behaviorSignals,
        ),
        userPatterns: normalizeStringList(
          memoryRecord.userPatterns,
          previousMemory.userPatterns,
          6,
        ),
        memoryInsights: normalizeMemoryInsights(
          memoryRecord.memoryInsights,
          previousMemory.memoryInsights,
        ),
        recentSummary: compactText(
          readString(memoryRecord.recentSummary, previousMemory.recentSummary),
          360,
        ),
        followUpFocus: compactText(
          readString(memoryRecord.followUpFocus, previousMemory.followUpFocus),
          220,
        ),
        riskState,
      },
    };
  } catch {
    const riskState = detectRiskState(userText);
    const reply = ensureRiskGuidance(
      compactText(readString(rawText, fallbackReply), 520),
      riskState,
    );

    return {
      reply,
      memory: createFallbackMemory(previousMemory, userText),
    };
  }
};

export const generateSoraeResponse = async (
  previousMemory: MemoryState,
  recentMessages: ChatMessage[],
  userText: string,
  locale: SoraeLocale,
) => {
  const rawText = readString(
    await generateText(
      buildSoraePrompt(previousMemory, recentMessages, userText, locale),
      {feature: "sendReflection", locale},
    ),
    fallbackReplyForLocale(locale),
  );

  return normalizeAiResponse(rawText, previousMemory, userText, locale);
};

export const transcribeVoiceReflection = async (
  audioBase64: string,
  mimeType: string,
  locale: SoraeLocale,
) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not available in this function.");
  }

  const ai = new GoogleGenAI({apiKey});
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Transcribe this audio as a personal reflection. " +
              `Prefer ${locale === "es" ? "Spanish" : "English"} when the ` +
              "audio language is ambiguous. Return only the transcription, " +
              "without markdown or analysis.",
          },
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
        ],
      },
    ],
  });

  return compactText(readString(response.text), 2200);
};
