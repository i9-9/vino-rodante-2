/**
 * Utilidades para cálculo de envíos
 */

export interface ShippingZone {
  name: string
  postalCodeRanges: Array<{ min: number; max: number }>
  shippingCost: number
}

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    name: "Capital Federal",
    postalCodeRanges: [{ min: 1000, max: 1499 }],
    shippingCost: 0
  },
  {
    name: "Gran Buenos Aires (GBA)",
    postalCodeRanges: [
      { min: 1500, max: 1999 }, // Zona Norte
      { min: 1600, max: 1899 }, // Zona Oeste  
      { min: 1800, max: 1899 }, // Zona Sur
      { min: 2000, max: 2999 }  // Conurbano
    ],
    shippingCost: 3000000
  },
  {
    name: "Interior del país",
    postalCodeRanges: [
      { min: 3000, max: 9999 }
    ],
    shippingCost: 5500000
  }
]

/**
 * Calcula el costo de envío basado en el código postal
 * @param postalCode - Código postal como string
 * @param baseShipping - Costo base de envío (por defecto 5500000)
 * @returns Costo del envío en centavos
 */
export function calculateShipping(postalCode: string, baseShipping: number = 5500000): number {
  if (!postalCode || postalCode.trim() === "") {
    return baseShipping
  }

  const postalCodeNum = parseInt(postalCode.trim())
  
  if (isNaN(postalCodeNum)) {
    return baseShipping
  }

  // Buscar zona de envío
  const zone = SHIPPING_ZONES.find(zone => 
    zone.postalCodeRanges.some(range => 
      postalCodeNum >= range.min && postalCodeNum <= range.max
    )
  )

  return zone ? zone.shippingCost : baseShipping
}

/**
 * Obtiene información de la zona de envío
 * @param postalCode - Código postal
 * @returns Información de la zona o null si no se encuentra
 */
export function getShippingZone(postalCode: string): ShippingZone | null {
  if (!postalCode || postalCode.trim() === "") {
    return null
  }

  const postalCodeNum = parseInt(postalCode.trim())
  
  if (isNaN(postalCodeNum)) {
    return null
  }

  return SHIPPING_ZONES.find(zone => 
    zone.postalCodeRanges.some(range => 
      postalCodeNum >= range.min && postalCodeNum <= range.max
    )
  ) || null
}

/**
 * Verifica si un código postal está en Capital Federal
 * @param postalCode - Código postal
 * @returns true si es Capital Federal
 */
export function isCapitalFederal(postalCode: string): boolean {
  const zone = getShippingZone(postalCode)
  return zone?.name === "Capital Federal"
}
