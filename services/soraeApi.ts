import { functions } from "@/firebase";
import type {
  OnboardingPreferences,
  RitualId,
  SoraeLocale,
  SoraeStateResponse,
} from "@/types/sorae";
import { httpsCallable, type HttpsCallable } from "firebase/functions";

const getSoraeState = httpsCallable<
  { locale?: SoraeLocale },
  SoraeStateResponse
>(
  functions,
  "getSoraeState",
);

const sendReflection = httpsCallable<
  { text: string; locale?: SoraeLocale },
  SoraeStateResponse
>(functions, "sendReflection");

const resetSoraeMemory = httpsCallable<
  Record<string, never>,
  SoraeStateResponse
>(functions, "resetSoraeMemory");

const saveSoraeOnboarding = httpsCallable<
  OnboardingPreferences,
  SoraeStateResponse
>(functions, "saveSoraeOnboarding");

const saveDailyCheckIn = httpsCallable<
  { mood: string; energy: number; note?: string; locale?: SoraeLocale },
  SoraeStateResponse
>(functions, "saveDailyCheckIn");

const startGuidedRitual = httpsCallable<
  { ritualId: RitualId; locale?: SoraeLocale },
  SoraeStateResponse
>(functions, "startGuidedRitual");

const generateSoraeWeeklySummary = httpsCallable<
  { locale?: SoraeLocale },
  SoraeStateResponse
>(functions, "generateSoraeWeeklySummary");

const sendVoiceReflection = httpsCallable<
  { audioBase64: string; mimeType: string; locale?: SoraeLocale },
  SoraeStateResponse
>(functions, "sendVoiceReflection");

const callSorae = async <Request, Response>(
  callable: HttpsCallable<Request, Response>,
  payload: Request,
) => {
  const result = await callable(payload);

  return result.data;
};

export const soraeApi = {
  getState: (locale: SoraeLocale) => callSorae(getSoraeState, { locale }),
  sendReflection: (text: string, locale: SoraeLocale) =>
    callSorae(sendReflection, { text, locale }),
  resetMemory: () => callSorae(resetSoraeMemory, {}),
  saveOnboarding: (preferences: OnboardingPreferences) =>
    callSorae(saveSoraeOnboarding, preferences),
  saveCheckIn: (
    mood: string,
    energy: number,
    locale: SoraeLocale,
    note?: string,
  ) => callSorae(saveDailyCheckIn, { mood, energy, note, locale }),
  startRitual: (ritualId: RitualId, locale: SoraeLocale) =>
    callSorae(startGuidedRitual, { ritualId, locale }),
  generateWeeklySummary: (locale: SoraeLocale) =>
    callSorae(generateSoraeWeeklySummary, { locale }),
  sendVoiceReflection: (
    audioBase64: string,
    mimeType: string,
    locale: SoraeLocale,
  ) => callSorae(sendVoiceReflection, { audioBase64, mimeType, locale }),
};
