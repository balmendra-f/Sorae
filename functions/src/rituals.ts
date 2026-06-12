import type {RitualId, SoraeLocale} from "./types";

export const ritualPrompts: Record<RitualId, Record<SoraeLocale, string>> = {
  "clear-thought": {
    en: "I want to do a brief ritual to organize a thought that keeps circling.",
    es:
      "Quiero hacer un ritual breve para ordenar un pensamiento que me " +
      "está dando vueltas.",
  },
  "close-day": {
    en: "I want to close the day with a brief and honest reflection.",
    es: "Quiero cerrar el día con una reflexión breve y honesta.",
  },
  "prepare-conversation": {
    en: "I want to prepare for a difficult conversation without losing clarity.",
    es: "Quiero prepararme para una conversación difícil sin perder claridad.",
  },
  "before-sleep": {
    en: "I want to release some of the weight before sleeping.",
    es: "Quiero soltar un poco el peso antes de dormir.",
  },
};

export const getRitualPrompt = (
  ritualId: RitualId,
  locale: SoraeLocale,
) => ritualPrompts[ritualId]?.[locale];
