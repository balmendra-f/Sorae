import * as Localization from "expo-localization";
import i18n, { LanguageDetectorAsyncModule } from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./translations/en.json";
import es from "./translations/es.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const languageDetector: LanguageDetectorAsyncModule = {
  type: "languageDetector",
  async: true,
  detect: async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem("language");
      if (storedLanguage) {
        return storedLanguage;
      }
    } catch (e) {
      // Ignore
    }

    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      return locales[0].languageCode || "en";
    }
    return "en";
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem("language", lng);
    } catch (e) {
      // Ignore
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
