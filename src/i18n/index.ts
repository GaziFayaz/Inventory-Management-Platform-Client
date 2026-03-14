import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enTranslations from "./locales/en.json"
import esTranslations from "./locales/es.json"

export const LANGUAGE_STORAGE_KEY = "app-language"
export const DEFAULT_LANGUAGE = "en" as const

export type AppLanguage = "en" | "es"

export const isAppLanguage = (value: string | null): value is AppLanguage =>
  value === "en" || value === "es"

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (isAppLanguage(storedLanguage)) {
    return storedLanguage
  }

  return DEFAULT_LANGUAGE
}

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslations,
    },
    es: {
      translation: esTranslations,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ["en", "es"],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
