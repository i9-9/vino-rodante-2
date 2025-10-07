// Image SEO utilities for generating optimized alt texts
export interface ProductImageInfo {
  name: string
  varietal?: string
  region: string
  year?: string
  category: string
  isBox?: boolean
}

// Generate SEO-optimized alt text for product images
export const generateProductAltText = (product: ProductImageInfo): string => {
  const { name, varietal, region, year, category, isBox } = product
  
  // Base structure for alt text
  let altText = name
  
  // Add varietal if available
  if (varietal && !isBox) {
    altText += ` - ${varietal}`
  }
  
  // Add region
  altText += ` de ${region}`
  
  // Add year if available
  if (year && !isBox) {
    altText += ` (${year})`
  }
  
  // Add category context
  const categoryMap: Record<string, string> = {
    'tinto': 'vino tinto argentino',
    'red': 'vino tinto argentino',
    'blanco': 'vino blanco argentino', 
    'white': 'vino blanco argentino',
    'rosado': 'vino rosado argentino',
    'rose': 'vino rosado argentino',
    'espumante': 'vino espumante argentino',
    'sparkling': 'vino espumante argentino',
    'box': 'box de vinos argentinos',
    'boxes': 'box de vinos argentinos'
  }
  
  const categoryLower = category.toLowerCase()
  const categoryDescription = categoryMap[categoryLower] || 'vino argentino'
  
  // Add category description
  altText += ` - ${categoryDescription}`
  
  // Add brand context
  altText += ' | Vino Rodante'
  
  return altText
}

// Generate alt text for different image types
export const generateImageAltText = {
  // Product main image
  product: (product: ProductImageInfo): string => {
    return generateProductAltText(product)
  },
  
  // Product thumbnail
  thumbnail: (product: ProductImageInfo): string => {
    const baseAlt = generateProductAltText(product)
    return `${baseAlt} - Imagen del producto`
  },
  
  // Product gallery image
  gallery: (product: ProductImageInfo, index: number): string => {
    const baseAlt = generateProductAltText(product)
    return `${baseAlt} - Vista ${index + 1} del producto`
  },
  
  // Hero/banner images
  hero: (title: string, description?: string): string => {
    return `${title} - ${description || 'Vino Rodante'}`
  },
  
  // Category images
  category: (categoryName: string, region?: string): string => {
    const baseAlt = `Vinos ${categoryName}`
    return region ? `${baseAlt} de ${region}` : baseAlt
  },
  
  // Box/collection images
  box: (boxName: string, wineCount?: number): string => {
    const countText = wineCount ? ` con ${wineCount} vinos` : ''
    return `${boxName} - Box de vinos argentinos${countText} | Vino Rodante`
  }
}

// Generate alt text for social media images
export const generateSocialImageAltText = (product: ProductImageInfo): string => {
  const { name, varietal, region, year, category } = product
  
  let altText = `${name}`
  
  if (varietal) {
    altText += ` - ${varietal}`
  }
  
  altText += ` de ${region}`
  
  if (year) {
    altText += ` (${year})`
  }
  
  // Add compelling description for social media
  altText += ` - Descubrí este ${category.toLowerCase()} premium en Vino Rodante`
  
  return altText
}

// Generate alt text for Open Graph images
export const generateOGImageAltText = (product: ProductImageInfo): string => {
  const { name, varietal, region } = product
  
  let altText = `${name}`
  
  if (varietal) {
    altText += ` - ${varietal}`
  }
  
  altText += ` de ${region} - Vino Rodante`
  
  return altText
}

// Validate alt text length (recommended 125 characters or less)
export const validateAltTextLength = (altText: string): {
  isValid: boolean
  length: number
  recommendation?: string
} => {
  const length = altText.length
  
  if (length <= 125) {
    return { isValid: true, length }
  }
  
  return {
    isValid: false,
    length,
    recommendation: `Consider shortening alt text. Current: ${length} chars, recommended: ≤125 chars`
  }
}

// Generate multiple alt text variations for A/B testing
export const generateAltTextVariations = (product: ProductImageInfo): string[] => {
  const baseAlt = generateProductAltText(product)
  
  return [
    baseAlt, // Full descriptive
    `${product.name} - ${product.varietal || product.category} de ${product.region}`, // Shorter
    `${product.name} - Vino argentino premium`, // Brand focused
    `${product.name} - ${product.varietal || product.category} | Vino Rodante` // Brand + varietal
  ]
}

// Generate alt text with keywords for specific searches
export const generateKeywordOptimizedAltText = (
  product: ProductImageInfo, 
  targetKeywords: string[]
): string => {
  const baseAlt = generateProductAltText(product)
  
  // Add target keywords if they fit naturally
  const keywordText = targetKeywords
    .filter(keyword => keyword.length <= 20) // Only short keywords
    .slice(0, 2) // Max 2 additional keywords
    .join(', ')
  
  if (keywordText && baseAlt.length + keywordText.length <= 125) {
    return `${baseAlt} - ${keywordText}`
  }
  
  return baseAlt
}
