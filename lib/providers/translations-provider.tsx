"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { es } from "@/lib/i18n/es"
import { en } from "@/lib/i18n/en"

type Language = "es" | "en"
type Translations = typeof es | typeof en

interface TranslationsContextType {
  translations: Translations
  language: Language
  setLanguage: (lang: Language) => void
}

const TranslationsContext = createContext<TranslationsContextType | undefined>(undefined)

export function TranslationsProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with a default value
  const [language, setLanguageState] = useState<Language>("es")
  const [translations, setTranslations] = useState<Translations>(es)

  // Load initial language from localStorage on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") as Language
    if (storedLanguage) {
      setLanguageState(storedLanguage)
      setTranslations(storedLanguage === "en" ? en : es)
    }
  }, [])

  // Function to change language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setTranslations(lang === "en" ? en : es)
    localStorage.setItem("language", lang)
  }

  return (
    <TranslationsContext.Provider value={{ translations, language, setLanguage }}>
      {children}
    </TranslationsContext.Provider>
  )
}

export function useTranslations() {
  const context = useContext(TranslationsContext)
  if (context === undefined) {
    throw new Error("useTranslations must be used within a TranslationsProvider")
  }
  return context.translations
}

export function useLanguage() {
  const context = useContext(TranslationsContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a TranslationsProvider")
  }
  return {
    language: context.language,
    setLanguage: context.setLanguage,
  }
}
