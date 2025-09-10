// Server-side translation utilities for static generation
import { es } from "@/lib/i18n/es"
import { en } from "@/lib/i18n/en"

export type Language = "es" | "en"

// Default translations (Spanish)
const defaultTranslations = es

// Get translations for a specific language
export function getTranslations(language: Language = "es") {
  return language === "en" ? en : es
}

// Get a specific translation key
export function getTranslation(key: string, language: Language = "es"): string {
  const translations = getTranslations(language)
  
  // Navigate through nested object using dot notation
  const keys = key.split('.')
  let value: any = translations
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return the key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key
}

// Collection-specific translations
export const collectionTranslations = {
  es: {
    boxes: {
      title: "Boxes de Vinos",
      description: "Descubrí nuestras cajas seleccionadas con los mejores vinos argentinos. Perfectas para regalar o para disfrutar en casa.",
      noProducts: "No se encontraron productos"
    },
    newArrivals: {
      title: "Novedades", 
      description: "Descubre nuestros vinos y boxes más recientes",
      noProducts: "No se encontraron productos"
    },
    bestsellers: {
      title: "Más Vendidos",
      description: "Los vinos y boxes más populares entre nuestros clientes", 
      noProducts: "No se encontraron productos"
    },
    wineTypes: {
      red: "Vinos Tintos",
      white: "Vinos Blancos", 
      sparkling: "Vinos Espumantes",
      rose: "Vinos Rosados",
      naranjo: "Vinos Naranjos",
      dessert: "Vinos Dulces",
      boxes: "Boxes de Vinos"
    },
    wineRegions: {
      mendoza: "Mendoza",
      "san-juan": "San Juan",
      "la-rioja": "La Rioja",
      catamarca: "Catamarca",
      salta: "Salta",
      jujuy: "Jujuy",
      tucuman: "Tucumán",
      "rio-negro": "Río Negro",
      neuquen: "Neuquén",
      "buenos-aires": "Buenos Aires",
      cordoba: "Córdoba",
      "entre-rios": "Entre Ríos",
      chapadmalal: "Chapadmalal",
      "valle-de-uco": "Valle de Uco",
      "valle-del-pedernal": "Valle del Pedernal",
      "valle-calchaqui": "Valle Calchaquí",
      "valle-de-famatina": "Valle de Famatina",
      "valle-del-rio-colorado": "Valle del Río Colorado"
    },
    wineVarietals: {
      malbec: "Malbec",
      "cabernet-sauvignon": "Cabernet Sauvignon",
      bonarda: "Bonarda",
      syrah: "Syrah",
      merlot: "Merlot",
      tempranillo: "Tempranillo",
      "petit-verdot": "Petit Verdot",
      "cabernet-franc": "Cabernet Franc",
      tannat: "Tannat",
      "pinot-noir": "Pinot Noir",
      "torrontes-riojano": "Torrontés Riojano",
      chardonnay: "Chardonnay",
      "sauvignon-blanc": "Sauvignon Blanc",
      "pedro-gimenez": "Pedro Giménez",
      viognier: "Viognier",
      semillon: "Semillón",
      gewurztraminer: "Gewürztraminer",
      riesling: "Riesling",
      "chenin-blanc": "Chenin Blanc",
      "moscatel-alejandria": "Moscatel Alejandría",
      "criolla-chica": "Criolla Chica",
      "criolla-grande": "Criolla Grande",
      "moscatel-rosado": "Moscatel Rosado",
      "torrontes-sanjuanino": "Torrontés Sanjuanino",
      "torrontes-mendocino": "Torrontés Mendocino",
      "orange-wine": "Vino Naranjo",
      malvasia: "Malvasía",
      fiano: "Fiano",
      garnacha: "Garnacha",
      barbera: "Barbera",
      nebbiolo: "Nebbiolo",
      blend: "Corte"
    }
  },
  en: {
    boxes: {
      title: "Wine Boxes",
      description: "Discover our selected boxes with the best Argentine wines. Perfect for gifting or enjoying at home.",
      noProducts: "No products found"
    },
    newArrivals: {
      title: "New Arrivals",
      description: "Discover our newest wines and boxes",
      noProducts: "No products found"
    },
    bestsellers: {
      title: "Bestsellers", 
      description: "The most popular wines and boxes among our customers",
      noProducts: "No products found"
    },
    wineTypes: {
      red: "Red Wines",
      white: "White Wines",
      sparkling: "Sparkling Wines", 
      rose: "Rosé Wines",
      naranjo: "Orange Wines",
      dessert: "Dessert Wines",
      boxes: "Wine Boxes"
    },
    wineRegions: {
      mendoza: "Mendoza",
      "san-juan": "San Juan", 
      "la-rioja": "La Rioja",
      catamarca: "Catamarca",
      salta: "Salta",
      jujuy: "Jujuy",
      tucuman: "Tucumán",
      "rio-negro": "Río Negro",
      neuquen: "Neuquén",
      "buenos-aires": "Buenos Aires",
      cordoba: "Córdoba",
      "entre-rios": "Entre Ríos",
      chapadmalal: "Chapadmalal",
      "valle-de-uco": "Valle de Uco",
      "valle-del-pedernal": "Valle del Pedernal",
      "valle-calchaqui": "Valle Calchaquí",
      "valle-de-famatina": "Valle de Famatina",
      "valle-del-rio-colorado": "Valle del Río Colorado"
    },
    wineVarietals: {
      malbec: "Malbec",
      "cabernet-sauvignon": "Cabernet Sauvignon",
      bonarda: "Bonarda",
      syrah: "Syrah",
      merlot: "Merlot",
      tempranillo: "Tempranillo",
      "petit-verdot": "Petit Verdot",
      "cabernet-franc": "Cabernet Franc",
      tannat: "Tannat",
      "pinot-noir": "Pinot Noir",
      "torrontes-riojano": "Torrontés Riojano",
      chardonnay: "Chardonnay",
      "sauvignon-blanc": "Sauvignon Blanc",
      "pedro-gimenez": "Pedro Giménez",
      viognier: "Viognier",
      semillon: "Semillón",
      gewurztraminer: "Gewürztraminer",
      riesling: "Riesling",
      "chenin-blanc": "Chenin Blanc",
      "moscatel-alejandria": "Moscatel Alejandría",
      "criolla-chica": "Criolla Chica",
      "criolla-grande": "Criolla Grande",
      "moscatel-rosado": "Moscatel Rosado",
      "torrontes-sanjuanino": "Torrontés Sanjuanino",
      "torrontes-mendocino": "Torrontés Mendocino",
      "orange-wine": "Orange Wine",
      malvasia: "Malvasía",
      fiano: "Fiano",
      garnacha: "Garnacha",
      barbera: "Barbera",
      nebbiolo: "Nebbiolo",
      blend: "Blend"
    }
  }
}

// Get collection translation
export function getCollectionTranslation(collection: string, key: string, language: Language = "es"): string {
  const translations = collectionTranslations[language]
  const collectionData = translations[collection as keyof typeof translations]
  
  if (collectionData && key in collectionData) {
    return collectionData[key as keyof typeof collectionData] as string
  }
  
  // Fallback to Spanish
  const esTranslations = collectionTranslations.es
  const esCollectionData = esTranslations[collection as keyof typeof esTranslations]
  
  if (esCollectionData && key in esCollectionData) {
    return esCollectionData[key as keyof typeof esCollectionData] as string
  }
  
  return key
}

