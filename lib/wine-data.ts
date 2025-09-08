// Tipos de vino
export const WINE_TYPES = {
  RED: 'red',
  WHITE: 'white',
  SPARKLING: 'sparkling',
  ROSE: 'rose',
  DESSERT: 'dessert',
  FORTIFIED: 'fortified',
  NARANJO: 'naranjo',
  CIDER: 'cider',
  GIN: 'gin',
  OTHER_DRINKS: 'other-drinks',
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
export function getWineTypeData(type: WineType, t: unknown): WineTypeData {
  return {
    id: type,
    name: t.wineTypes[type] || type,
    slug: type,
  };
}

// Función para obtener datos de una región
export function getWineRegionData(region: WineRegion, t: unknown): WineRegionData {
  return {
    id: region,
    name: t.wineRegions[region] || region,
    slug: region,
  };
}

// Función para obtener datos de un varietal
export function getWineVarietalData(varietal: WineVarietal, t: unknown): WineVarietalData {
  return {
    id: varietal,
    name: t.wineVarietals[varietal] || varietal,
    slug: varietal,
  };
}

// Función para obtener todos los tipos de vino
export function getAllWineTypes(t: unknown): WineTypeData[] {
  return Object.values(WINE_TYPES).map(type => getWineTypeData(type, t));
}

// Función para obtener todas las regiones
export function getAllWineRegions(t: unknown): WineRegionData[] {
  return Object.values(WINE_REGIONS).map(region => getWineRegionData(region, t));
}

// Función para obtener todos los varietales
export function getAllWineVarietals(t: unknown): WineVarietalData[] {
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
export const CATEGORY_SLUG_MAP: Record<string, string[]> = {
  // Mapeo URL → DB: Los productos en DB pueden estar en mayúsculas o minúsculas
  red: ["Tinto", "tinto"],           // /collections/red → busca productos con category="Tinto" o "tinto"
  white: ["Blanco", "blanco"],       // /collections/white → busca productos con category="Blanco" o "blanco"
  rose: ["Rosado", "rosado"],        // /collections/rose → busca productos con category="Rosado" o "rosado"
  sparkling: ["Espumante", "espumante"], // /collections/sparkling → busca productos con category="Espumante" o "espumante"
  naranjo: ["Naranjo", "naranjo"],   // /collections/naranjo → busca productos con category="Naranjo" o "naranjo"
  dessert: ["Dulce", "dulce"],       // /collections/dessert → busca productos con category="Dulce" o "dulce"
  fortified: ["fortified"],
  boxes: ["Boxes", "boxes"],         // /collections/boxes → busca productos con category="Boxes" o "boxes"
  "other-drinks": ["Otras Bebidas", "otras bebidas"], // /collections/other-drinks → busca productos con category="Otras Bebidas" o "otras bebidas"
  cider: ["Sidra", "sidra"],         // /collections/cider → busca productos con category="Sidra" o "sidra"
  gin: ["Gin", "gin"],
  // Fallbacks por si vienen directamente en español
  tinto: ["Tinto", "tinto"],
  blanco: ["Blanco", "blanco"],
  rosado: ["Rosado", "rosado"], 
  espumante: ["Espumante", "espumante"],
  dulce: ["Dulce", "dulce"],
  sidra: ["Sidra", "sidra"],
  "otras-bebidas": ["Otras Bebidas", "otras bebidas"],
}

// Mapping de regiones: slug → nombre completo (como se almacena en DB)
export const REGION_SLUG_MAP: Record<string, string> = {
  'mendoza': 'Mendoza',
  'san-juan': 'San Juan',
  'la-rioja': 'La Rioja',
  'catamarca': 'Catamarca',
  'salta': 'Salta',
  'jujuy': 'Jujuy',
  'tucuman': 'Tucumán',
  'rio-negro': 'Río Negro',
  'neuquen': 'Neuquén',
  'buenos-aires': 'Buenos Aires',
  'cordoba': 'Córdoba',
  'entre-rios': 'Entre Ríos',
  'chapadmalal': 'Chapadmalal',
  'valle-de-uco': 'Valle de Uco',
  'valle-del-pedernal': 'Valle del Pedernal',
  'valle-calchaqui': 'Valle Calchaquí',
  'valle-de-famatina': 'Valle de Famatina',
  'valle-del-rio-colorado': 'Valle del Río Colorado',
}

// Mapping inverso: nombre completo → slug
export const REGION_NAME_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(REGION_SLUG_MAP).map(([slug, name]) => [name, slug])
) 