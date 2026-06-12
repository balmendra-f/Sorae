import {Timestamp} from "firebase-admin/firestore";
import {preferencesRef} from "./firestore";
import {normalizeOnboarding} from "./normalizers";
import type {OnboardingPreferences} from "./types";

export const savePreferences = async (
  uid: string,
  input: unknown,
) => {
  const preferences = normalizeOnboarding(input);

  if (!preferences || preferences.goals.length === 0) {
    throw new Error("invalid-preferences");
  }

  const completedAt = new Date().toISOString();
  const data: OnboardingPreferences = {
    goals: preferences.goals.slice(0, 4),
    tone: preferences.tone,
    reminderCadence: preferences.reminderCadence,
    completedAt,
  };

  await preferencesRef(uid).set({
    ...data,
    updatedAt: Timestamp.now(),
  }, {merge: true});

  return data;
};
