import {GoogleGenAI} from "@google/genai";
import {Timestamp} from "firebase-admin/firestore";
import {modelName} from "./defaults";
import {weeklySummaryRef} from "./firestore";
import {languageNameForLocale} from "./locale";
import {readMemory} from "./memory";
import {getRecentMessages} from "./messages";
import {normalizeWeeklySummary} from "./normalizers";
import {readString} from "./text";
import type {SoraeLocale, WeeklySummary} from "./types";

const extractJson = (text: string) => {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fencedMatch?.[1] ?? trimmed;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new Error("Weekly summary response did not contain JSON.");
  }

  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as unknown;
};

const fallbackWeeklySummary = (): WeeklySummary => ({
  generatedAt: new Date().toISOString(),
  headline: "Sorae is gathering signals for your week.",
  themes: [],
  emotionalTone: "There is still too little information to summarize precisely.",
  helpfulSignals: [],
  suggestedRitual: "Try a brief check-in and talk with Sorae again.",
});

export const generateWeeklySummary = async (
  uid: string,
  locale: SoraeLocale,
) => {
  const [memory, messages] = await Promise.all([
    readMemory(uid),
    getRecentMessages(uid, 24),
  ]);

  if (!memory.hasUserShared && messages.length <= 1) {
    const summary = fallbackWeeklySummary();
    await weeklySummaryRef(uid).set(summary, {merge: true});
    return summary;
  }

  let summary = fallbackWeeklySummary();

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        "Summarize the user's emotional week for an app called Sorae.",
        `Write all user-facing fields in ${languageNameForLocale(locale)}.`,
        "Do not diagnose. Do not invent. Use only this memory and messages.",
        "Return valid JSON with generatedAt, headline, themes, " +
          "emotionalTone, helpfulSignals, and suggestedRitual.",
        `generatedAt: ${new Date().toISOString()}`,
        `Memory: ${JSON.stringify(memory)}`,
        `Messages: ${JSON.stringify(messages)}`,
      ].join("\n"),
    });
    const parsed = normalizeWeeklySummary(
      extractJson(readString(response.text)),
    );

    if (parsed) summary = parsed;
  } catch {
    summary = fallbackWeeklySummary();
  }

  await weeklySummaryRef(uid).set({
    ...summary,
    updatedAt: Timestamp.now(),
  }, {merge: true});

  return summary;
};
