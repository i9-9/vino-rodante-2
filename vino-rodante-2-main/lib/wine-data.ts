// Tipos de vino
export const WINE_TYPES = {
  RED: 'red',
  WHITE: 'white',
  SPARKLING: 'sparkling',
  ROSE: 'rose',
  DESSERT: 'dessert',
  FORTIFIED: 'fortified',
  NARANJO: 'naranjo',
} as const;

// Regiones vinícolas
export const WINE_REGIONS = {
  MENDOZA: 'mendoza',
  SAN_JUAN: 'san-juan',
  LA_RIOJA: 'la-rioja',
  CATAMARCA: 'catamarca',
  SALTA: 'salta',
  JUJUY: 'jujuy',
  TUCUMAN: 'tucuman',
  RIO_NEGRO: 'rio-negro',
  NEUQUEN: 'neuquen',
  BUENOS_AIRES: 'buenos-aires',
  CORDOBA: 'cordoba',
  ENTRE_RIOS: 'entre-rios',
  CHAPADMALAL: 'chapadmalal',
  VALLE_DE_UCO: 'valle-de-uco',
  VALLE_DEL_PEDERNAL: 'valle-del-pedernal',
  VALLE_CALCHAQUI: 'valle-calchaqui',
  VALLE_DE_FAMATINA: 'valle-de-famatina',
  VALLE_DEL_RIO_COLORADO: 'valle-del-rio-colorado',
} as const;

// Varietales
export const WINE_VARIETALS = {
  MALBEC: 'malbec',
  CABERNET_SAUVIGNON: 'cabernet-sauvignon',
  BONARDA: 'bonarda',
  SYRAH: 'syrah',
  MERLOT: 'merlot',
  TEMPRANILLO: 'tempranillo',
  PETIT_VERDOT: 'petit-verdot',
  CABERNET_FRANC: 'cabernet-franc',
  TANNAT: 'tannat',
  PINOT_NOIR: 'pinot-noir',
  TORRONTES_RIOJANO: 'torrontes-riojano',
  CHARDONNAY: 'chardonnay',
  SAUVIGNON_BLANC: 'sauvignon-blanc',
  PEDRO_GIMENEZ: 'pedro-gimenez',
  VIOGNIER: 'viognier',
  SEMILLON: 'semillon',
  GEWURZTRAMINER: 'gewurztraminer',
  RIESLING: 'riesling',
  CHENIN_BLANC: 'chenin-blanc',
  MOSCATEL_ALEJANDRIA: 'moscatel-alejandria',
  CRIOLLA_CHICA: 'criolla-chica',
  CRIOLLA_GRANDE: 'criolla-grande',
  MOSCATEL_ROSADO: 'moscatel-rosado',
  TORRONTES_SANJUANINO: 'torrontes-sanjuanino',
  TORRONTES_MENDOCINO: 'torrontes-mendocino',
  ORANGE_WINE: 'orange-wine',
  MALVASIA: 'malvasia',
  FIANO: 'fiano',
  GARNACHA: 'garnacha',
  BARBERA: 'barbera',
  NEBBIOLO: 'nebbiolo',
  BLEND: 'blend',
} as const;

// Tipos TypeScript
export type WineType = typeof WINE_TYPES[keyof typeof WINE_TYPES];
export type WineRegion = typeof WINE_REGIONS[keyof typeof WINE_REGIONS];
export type WineVarietal = typeof WINE_VARIETALS[keyof typeof WINE_VARIETALS];

// Interfaces para los datos completos
export interface WineTypeData {
  id: WineType;
  name: string;
  slug: string;
}

export interface WineRegionData {
  id: WineRegion;
  name: string;
  slug: string;
}

export interface WineVarietalData {
  id: WineVarietal;
  name: string;
  slug: string;
}

// Función para validar tipos de vino
export function isValidWineType(type: string): type is WineType {
  return Object.values(WINE_TYPES).includes(type as WineType);
}

// Función para validar regiones
export function isValidWineRegion(region: string): region is WineRegion {
  return Object.values(WINE_REGIONS).includes(region as WineRegion);
}

// Función para validar varietales
export function isValidWineVarietal(varietal: string): varietal is WineVarietal {
  return Object.values(WINE_VARIETALS).includes(varietal as WineVarietal);
}

// Función para obtener datos de un tipo de vino
export function getWineTypeData(type: WineType, t: any): WineTypeData {
  return {
    id: type,
    name: t.wineTypes[type] || type,
    slug: type,
  };
}

// Función para obtener datos de una región
export function getWineRegionData(region: WineRegion, t: any): WineRegionData {
  return {
    id: region,
    name: t.wineRegions[region] || region,
    slug: region,
  };
}

// Función para obtener datos de un varietal
export function getWineVarietalData(varietal: WineVarietal, t: any): WineVarietalData {
  return {
    id: varietal,
    name: t.wineVarietals[varietal] || varietal,
    slug: varietal,
  };
}

// Función para obtener todos los tipos de vino
export function getAllWineTypes(t: any): WineTypeData[] {
  return Object.values(WINE_TYPES).map(type => getWineTypeData(type, t));
}

// Función para obtener todas las regiones
export function getAllWineRegions(t: any): WineRegionData[] {
  return Object.values(WINE_REGIONS).map(region => getWineRegionData(region, t));
}

// Función para obtener todos los varietales
export function getAllWineVarietals(t: any): WineVarietalData[] {
  return Object.values(WINE_VARIETALS).map(varietal => getWineVarietalData(varietal, t));
}

// Devuelve un nombre bonito a partir de un slug (capitaliza y reemplaza guiones por espacios)
export function prettyLabel(slug: string) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Mapping de slug (URL) a valor real en la base de datos
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  red: "tinto",
  white: "blanco",
  rose: "rosado",
  sparkling: "espumante",
  naranjo: "naranjo",
  // Puedes agregar más si agregas más categorías
} 