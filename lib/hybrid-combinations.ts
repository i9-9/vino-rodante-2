import { WINE_VARIETALS, WINE_REGIONS } from './wine-data'

/**
 * High-value varietal-region combinations for SEO
 * These are the most searched and valuable combinations
 */
export const PRIORITY_HYBRID_COMBINATIONS = [
  // Malbec combinations (highest search volume)
  { varietal: WINE_VARIETALS.MALBEC, region: WINE_REGIONS.MENDOZA },
  { varietal: WINE_VARIETALS.MALBEC, region: WINE_REGIONS.SALTA },
  { varietal: WINE_VARIETALS.MALBEC, region: WINE_REGIONS.SAN_JUAN },
  { varietal: WINE_VARIETALS.MALBEC, region: WINE_REGIONS.VALLE_DE_UCO },
  { varietal: WINE_VARIETALS.MALBEC, region: WINE_REGIONS.LA_RIOJA },

  // Cabernet Sauvignon combinations
  { varietal: WINE_VARIETALS.CABERNET_SAUVIGNON, region: WINE_REGIONS.MENDOZA },
  { varietal: WINE_VARIETALS.CABERNET_SAUVIGNON, region: WINE_REGIONS.SAN_JUAN },
  { varietal: WINE_VARIETALS.CABERNET_SAUVIGNON, region: WINE_REGIONS.VALLE_DE_UCO },
  { varietal: WINE_VARIETALS.CABERNET_SAUVIGNON, region: WINE_REGIONS.SALTA },

  // Torrontés combinations (distinctive Argentine white)
  { varietal: WINE_VARIETALS.TORRONTES_RIOJANO, region: WINE_REGIONS.SALTA },
  { varietal: WINE_VARIETALS.TORRONTES_RIOJANO, region: WINE_REGIONS.LA_RIOJA },
  { varietal: WINE_VARIETALS.TORRONTES_RIOJANO, region: WINE_REGIONS.VALLE_CALCHAQUI },
  { varietal: WINE_VARIETALS.TORRONTES_SANJUANINO, region: WINE_REGIONS.SAN_JUAN },

  // Chardonnay combinations
  { varietal: WINE_VARIETALS.CHARDONNAY, region: WINE_REGIONS.MENDOZA },
  { varietal: WINE_VARIETALS.CHARDONNAY, region: WINE_REGIONS.VALLE_DE_UCO },
  { varietal: WINE_VARIETALS.CHARDONNAY, region: WINE_REGIONS.NEUQUEN },
  { varietal: WINE_VARIETALS.CHARDONNAY, region: WINE_REGIONS.RIO_NEGRO },

  // Pinot Noir combinations (Patagonian specialty)
  { varietal: WINE_VARIETALS.PINOT_NOIR, region: WINE_REGIONS.NEUQUEN },
  { varietal: WINE_VARIETALS.PINOT_NOIR, region: WINE_REGIONS.RIO_NEGRO },
  { varietal: WINE_VARIETALS.PINOT_NOIR, region: WINE_REGIONS.VALLE_DE_UCO },

  // Syrah combinations
  { varietal: WINE_VARIETALS.SYRAH, region: WINE_REGIONS.SAN_JUAN },
  { varietal: WINE_VARIETALS.SYRAH, region: WINE_REGIONS.MENDOZA },
  { varietal: WINE_VARIETALS.SYRAH, region: WINE_REGIONS.LA_RIOJA },

  // Bonarda combinations (Argentina's second red)
  { varietal: WINE_VARIETALS.BONARDA, region: WINE_REGIONS.MENDOZA },
  { varietal: WINE_VARIETALS.BONARDA, region: WINE_REGIONS.SAN_JUAN },
  { varietal: WINE_VARIETALS.BONARDA, region: WINE_REGIONS.LA_RIOJA },

  // Sauvignon Blanc combinations
  { varietal: WINE_VARIETALS.SAUVIGNON_BLANC, region: WINE_REGIONS.VALLE_DE_UCO },
  { varietal: WINE_VARIETALS.SAUVIGNON_BLANC, region: WINE_REGIONS.NEUQUEN },
  { varietal: WINE_VARIETALS.SAUVIGNON_BLANC, region: WINE_REGIONS.SALTA },

  // Merlot combinations
  { varietal: WINE_VARIETALS.MERLOT, region: WINE_REGIONS.MENDOZA },
  { varietal: WINE_VARIETALS.MERLOT, region: WINE_REGIONS.SAN_JUAN },

  // Tempranillo combinations
  { varietal: WINE_VARIETALS.TEMPRANILLO, region: WINE_REGIONS.LA_RIOJA },
  { varietal: WINE_VARIETALS.TEMPRANILLO, region: WINE_REGIONS.MENDOZA },

  // Specialty combinations
  { varietal: WINE_VARIETALS.TANNAT, region: WINE_REGIONS.MENDOZA },
  { varietal: WINE_VARIETALS.PETIT_VERDOT, region: WINE_REGIONS.MENDOZA },
  { varietal: WINE_VARIETALS.VIOGNIER, region: WINE_REGIONS.SALTA },
  { varietal: WINE_VARIETALS.RIESLING, region: WINE_REGIONS.RIO_NEGRO },
]

/**
 * Generate all possible hybrid combinations (full matrix)
 * Use this sparingly - generates 100+ combinations
 */
export function generateAllHybridCombinations() {
  const combinations: Array<{ varietal: string; region: string }> = []

  // Only use common/commercial varietals for full matrix
  const commonVarietals = [
    WINE_VARIETALS.MALBEC,
    WINE_VARIETALS.CABERNET_SAUVIGNON,
    WINE_VARIETALS.BONARDA,
    WINE_VARIETALS.SYRAH,
    WINE_VARIETALS.MERLOT,
    WINE_VARIETALS.TEMPRANILLO,
    WINE_VARIETALS.PINOT_NOIR,
    WINE_VARIETALS.TORRONTES_RIOJANO,
    WINE_VARIETALS.CHARDONNAY,
    WINE_VARIETALS.SAUVIGNON_BLANC,
  ]

  // Only use major wine regions
  const majorRegions = [
    WINE_REGIONS.MENDOZA,
    WINE_REGIONS.SAN_JUAN,
    WINE_REGIONS.LA_RIOJA,
    WINE_REGIONS.SALTA,
    WINE_REGIONS.NEUQUEN,
    WINE_REGIONS.RIO_NEGRO,
    WINE_REGIONS.VALLE_DE_UCO,
    WINE_REGIONS.VALLE_CALCHAQUI,
  ]

  for (const varietal of commonVarietals) {
    for (const region of majorRegions) {
      combinations.push({ varietal, region })
    }
  }

  return combinations
}

/**
 * Get hybrid page slug from varietal and region
 */
export function getHybridSlug(varietal: string, region: string): string {
  return `${varietal}-${region}`
}

/**
 * Parse hybrid slug into varietal and region
 */
export function parseHybridSlug(slug: string): { varietal: string; region: string } | null {
  const parts = slug.split('-')

  if (parts.length < 2) return null

  // The last segment is the region, the rest is the varietal
  const region = parts[parts.length - 1]
  const varietal = parts.slice(0, -1).join('-')

  return { varietal, region }
}

/**
 * Get all hybrid slugs for sitemap generation
 */
export function getAllHybridSlugs(): string[] {
  // Use priority combinations by default to avoid generating too many pages
  return PRIORITY_HYBRID_COMBINATIONS.map(({ varietal, region }) =>
    getHybridSlug(varietal, region)
  )
}

/**
 * Get high-value hybrid slugs for priority indexing
 */
export function getHighValueHybridSlugs(): string[] {
  // Top 20 most valuable combinations
  return PRIORITY_HYBRID_COMBINATIONS.slice(0, 20).map(({ varietal, region }) =>
    getHybridSlug(varietal, region)
  )
}
