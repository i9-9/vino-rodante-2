"use client"

import { useTranslations as useClientTranslations } from "@/lib/providers/translations-provider"
import { getCollectionTranslation, type Language } from "@/lib/translations-server"
import { useEffect, useState } from "react"

// Hook that works in both server and client contexts
export function useTranslationsHybrid() {
  const [isClient, setIsClient] = useState(false)
  const [language, setLanguage] = useState<Language>("es")
  
  // Try to get client translations if available
  let clientTranslations: any = null
  try {
    clientTranslations = useClientTranslations()
  } catch {
    // Client translations not available (SSR/SSG context)
    clientTranslations = null
  }
  
  useEffect(() => {
    setIsClient(true)
    // Get language from localStorage if available
    const storedLanguage = localStorage.getItem("language") as Language
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
  }, [])
  
  // Use client translations if available, otherwise use server translations
  const getTranslation = (key: string) => {
    if (isClient && clientTranslations) {
      // Client-side: use the full translation system
      const keys = key.split('.')
      let value: any = clientTranslations
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          return key
        }
      }
      
      return typeof value === 'string' ? value : key
    } else {
      // Server-side: use server translations
      return getCollectionTranslation('', key, language)
    }
  }
  
  const getCollectionTranslation = (collection: string, key: string) => {
    if (isClient && clientTranslations) {
      // Client-side: use the full translation system
      const collectionData = clientTranslations[collection]
      if (collectionData && key in collectionData) {
        return collectionData[key]
      }
      return key
    } else {
      // Server-side: use server translations
      return getCollectionTranslation(collection, key, language)
    }
  }
  
  return {
    t: {
      get: getTranslation,
      collection: getCollectionTranslation
    },
    language,
    isClient
  }
}

