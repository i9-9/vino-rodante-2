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
  // Get initial language from localStorage or default to Spanish
  const [language, setLanguageState] = useState<Language>("es")
  const [translations, setTranslations] = useState<Translations>(es)

  // Update translations when language changes
  useEffect(() => {
    // Get stored language preference from localStorage if available
    const storedLanguage = typeof window !== "undefined" ? (localStorage.getItem("language") as Language) : null
    const initialLanguage = storedLanguage || "es"

    setLanguageState(initialLanguage)
    setTranslations(initialLanguage === "en" ? en : es)
  }, [])

  // Function to change language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setTranslations(lang === "en" ? en : es)

    // Store language preference
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
    }
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
