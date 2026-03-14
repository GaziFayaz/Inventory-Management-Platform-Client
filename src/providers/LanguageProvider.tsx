/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import i18n, {
  DEFAULT_LANGUAGE,
  isAppLanguage,
  LANGUAGE_STORAGE_KEY,
  type AppLanguage,
} from "@/i18n"

type LanguageProviderProps = {
  children: React.ReactNode
}

type LanguageProviderState = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

const LanguageProviderContext = React.createContext<
  LanguageProviderState | undefined
>(undefined)

function getCurrentLanguage(): AppLanguage {
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language

  if (isAppLanguage(currentLanguage)) {
    return currentLanguage
  }

  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = React.useState<AppLanguage>(() =>
    getCurrentLanguage()
  )

  const setLanguage = React.useCallback((nextLanguage: AppLanguage) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
    setLanguageState(nextLanguage)
    void i18n.changeLanguage(nextLanguage)
  }, [])

  React.useEffect(() => {
    const onLanguageChanged = (nextLanguage: string) => {
      if (!isAppLanguage(nextLanguage)) {
        return
      }

      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
      setLanguageState(nextLanguage)
    }

    i18n.on("languageChanged", onLanguageChanged)

    return () => {
      i18n.off("languageChanged", onLanguageChanged)
    }
  }, [])

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) {
        return
      }

      if (event.key !== LANGUAGE_STORAGE_KEY) {
        return
      }

      if (!isAppLanguage(event.newValue)) {
        setLanguageState(DEFAULT_LANGUAGE)
        void i18n.changeLanguage(DEFAULT_LANGUAGE)
        return
      }

      setLanguageState(event.newValue)
      void i18n.changeLanguage(event.newValue)
    }

    window.addEventListener("storage", onStorage)

    return () => {
      window.removeEventListener("storage", onStorage)
    }
  }, [setLanguage])

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language, setLanguage]
  )

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  )
}

export const useLanguage = () => {
  const context = React.useContext(LanguageProviderContext)

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }

  return context
}
