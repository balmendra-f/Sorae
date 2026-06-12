import {defaultRiskState} from "./defaults";
import {compactText} from "./text";
import type {RiskState} from "./types";

export const detectRiskState = (text: string): RiskState => {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const urgentPatterns = [
    "suicid",
    "matarme",
    "quitarme la vida",
    "hacerme dano",
    "no quiero vivir",
    "kill myself",
    "self harm",
    "suicide",
    "acabar con todo",
  ];
  const watchPatterns = [
    "no puedo mas",
    "me siento vacio",
    "sin sentido",
    "desesperado",
    "desesperada",
  ];

  if (urgentPatterns.some((pattern) => normalized.includes(pattern))) {
    return {
      level: "urgent",
      summary: "The user mentions possible self-harm risk.",
      suggestedAction:
        "Seek nearby support now and contact local emergency services if " +
        "there is immediate risk.",
    };
  }

  if (watchPatterns.some((pattern) => normalized.includes(pattern))) {
    return {
      level: "watch",
      summary:
        "The user expresses intense distress; respond with care.",
      suggestedAction:
        "Stay calm and suggest nearby support if the distress grows.",
    };
  }

  return defaultRiskState;
};

export const ensureRiskGuidance = (reply: string, riskState: RiskState) => {
  if (riskState.level !== "urgent") return reply;

  const lowerReply = reply.toLowerCase();

  if (
    lowerReply.includes("emergency") ||
    lowerReply.includes("immediate help")
  ) {
    return reply;
  }

  return compactText(
    `${reply} If you are in immediate danger, seek nearby support now and ` +
    "contact local emergency services.",
    520,
  );
};
