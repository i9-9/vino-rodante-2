"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { es } from "@/lib/i18n/es"
import { en } from "@/lib/i18n/en"

type Language = "es" | "en"

// Definir la estructura completa de las traducciones
export interface Translations {
  common: {
    signIn: string
    signOut: string
    account: string
    menu: string
    [key: string]: string
  }
  navigation: {
    home: string
    products: string
    about: string
    contact: string
    account: string
    weeklyWine: string
    redWines: string
    whiteWines: string
    sparklingWines: string
    orangeWines: string
    [key: string]: string
  }
  megamenu: {
    collections: string
    featured: string
    newArrivals: string
    bestsellers: string
    giftSets: string
    [key: string]: string
  }
  account: {
    orders: string
    profile: string
    title: string
    profileInfo: string
    [key: string]: string
  }
  language: {
    [key: string]: string
  }
  [key: string]: unknown
}

interface TranslationsContextType {
  t: Translations
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
    <TranslationsContext.Provider value={{ t: translations, language, setLanguage }}>
      {children}
    </TranslationsContext.Provider>
  )
}

export function useTranslations() {
  const context = useContext(TranslationsContext)
  if (context === undefined) {
    throw new Error("useTranslations must be used within a TranslationsProvider")
  }
  return context.t
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
