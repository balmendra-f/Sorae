import {isRecord, readString} from "./text";
import type {SoraeLocale} from "./types";

export const normalizeLocale = (input: unknown): SoraeLocale => {
  const data = isRecord(input) ? input : {};
  const locale = readString(data.locale).toLowerCase();

  return locale.startsWith("es") ? "es" : "en";
};

export const languageNameForLocale = (locale: SoraeLocale) =>
  locale === "es" ? "Spanish" : "English";
