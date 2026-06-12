export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const readString = (value: unknown, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

export const readNumber = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return Math.max(0, Math.min(1, value));
};

export const toIsoDate = (value: unknown) => {
  if (!isRecord(value) || typeof value.toDate !== "function") {
    return undefined;
  }

  return value.toDate().toISOString();
};

export const compactText = (text: string, maxLength = 220) => {
  const compacted = text.replace(/\s+/g, " ").trim();
  if (compacted.length <= maxLength) return compacted;
  return `${compacted.slice(0, maxLength - 1).trim()}…`;
};

export const mergeUnique = (items: string[], maxItems: number) => {
  const uniqueItems: string[] = [];

  items.forEach((item) => {
    const normalized = compactText(item, 140);
    const duplicate = uniqueItems.some(
      (currentItem) =>
        currentItem.toLowerCase() === normalized.toLowerCase(),
    );

    if (normalized && !duplicate) uniqueItems.push(normalized);
  });

  return uniqueItems.slice(0, maxItems);
};
