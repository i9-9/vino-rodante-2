import type { Discount, ProductWithDiscount } from '@/app/account/types/discount'

/**
 * Calcula el precio final de un producto aplicando un descuento
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discount: Discount
): { finalPrice: number; savings: number; discountAmount: number } {
  let discountAmount = 0

  if (discount.discount_type === 'percentage') {
    discountAmount = (originalPrice * discount.discount_value) / 100
  } else {
    discountAmount = discount.discount_value
  }

  // Aplicar límite máximo de descuento si existe
  if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
    discountAmount = discount.max_discount_amount
  }

  // No permitir descuentos negativos
  if (discountAmount < 0) {
    discountAmount = 0
  }

  // No permitir que el precio final sea negativo
  const finalPrice = Math.max(0, originalPrice - discountAmount)
  const savings = discountAmount

  return { finalPrice, savings, discountAmount }
}

/**
 * Verifica si un descuento es válido en la fecha actual
 */
export function isDiscountValid(discount: Discount, currentDate: Date = new Date()): boolean {
  const startDate = new Date(discount.start_date)
  const endDate = new Date(discount.end_date)
  
  return (
    discount.is_active &&
    currentDate >= startDate &&
    currentDate <= endDate &&
    (!discount.usage_limit || discount.used_count < discount.usage_limit)
  )
}

/**
 * Verifica si un descuento aplica a un producto específico
 */
export function doesDiscountApplyToProduct(
  discount: Discount,
  productId: string,
  productCategory: string
): boolean {
  if (discount.applies_to === 'all_products') {
    return true
  }
  
  if (discount.applies_to === 'category') {
    return discount.target_value === productCategory
  }
  
  if (discount.applies_to === 'specific_products') {
    try {
      const targetProducts = JSON.parse(discount.target_value)
      return Array.isArray(targetProducts) && targetProducts.includes(productId)
    } catch {
      return false
    }
  }
  
  return false
}

/**
 * Encuentra el mejor descuento aplicable para un producto
 */
export function findBestDiscountForProduct(
  product: { id: string; price: number; category: string },
  discounts: Discount[],
  currentDate: Date = new Date()
): Discount | null {
  const applicableDiscounts = discounts.filter(discount => 
    isDiscountValid(discount, currentDate) &&
    doesDiscountApplyToProduct(discount, product.id, product.category)
  )

  if (applicableDiscounts.length === 0) {
    return null
  }

  // Encontrar el descuento que genere mayor ahorro
  let bestDiscount = null
  let bestSavings = 0

  applicableDiscounts.forEach(discount => {
    const { savings } = calculateDiscountedPrice(product.price, discount)
    if (savings > bestSavings) {
      bestSavings = savings
      bestDiscount = discount
    }
  })

  return bestDiscount
}

/**
 * Aplica descuentos a una lista de productos
 */
export function applyDiscountsToProducts(
  products: Array<{ id: string; price: number; category: string; [key: string]: any }>,
  discounts: Discount[],
  currentDate: Date = new Date()
): ProductWithDiscount[] {
  return products.map(product => {
    const bestDiscount = findBestDiscountForProduct(product, discounts, currentDate)
    
    if (!bestDiscount) {
      return { ...product } as ProductWithDiscount
    }

    const { finalPrice, savings } = calculateDiscountedPrice(product.price, bestDiscount)
    
    return {
      ...product,
      discount: {
        id: bestDiscount.id,
        name: bestDiscount.name,
        discount_type: bestDiscount.discount_type,
        discount_value: bestDiscount.discount_value,
        final_price: finalPrice,
        savings: savings
      }
    } as ProductWithDiscount
  })
}

/**
 * Formatea un precio con descuento para mostrar
 */
export function formatDiscountedPrice(
  originalPrice: number,
  finalPrice: number,
  currency: string = '$'
): { original: string; final: string; savings: string; percentage: string } {
  const savings = originalPrice - finalPrice
  const percentage = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0

  return {
    original: `${currency}${originalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    final: `${currency}${finalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    savings: `${currency}${savings.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    percentage: `${percentage}%`
  }
}

/**
 * Valida si un descuento puede aplicarse a una compra
 */
export function validateDiscountForPurchase(
  discount: Discount,
  totalAmount: number,
  currentDate: Date = new Date()
): { isValid: boolean; reason?: string } {
  if (!isDiscountValid(discount, currentDate)) {
    return { isValid: false, reason: 'El descuento no está activo o ha expirado' }
  }

  if (totalAmount < discount.min_purchase_amount) {
    return { 
      isValid: false, 
      reason: `El monto mínimo de compra es $${discount.min_purchase_amount.toLocaleString('es-AR')}` 
    }
  }

  if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
    return { isValid: false, reason: 'El descuento ha alcanzado su límite de uso' }
  }

  return { isValid: true }
}

/**
 * Obtiene el estado de un descuento para mostrar en la UI
 */
export function getDiscountStatus(discount: Discount, currentDate: Date = new Date()): {
  status: 'active' | 'inactive' | 'expired' | 'upcoming' | 'limit_reached'
  label: string
  color: string
} {
  const startDate = new Date(discount.start_date)
  const endDate = new Date(discount.end_date)

  if (!discount.is_active) {
    return { status: 'inactive', label: 'Inactivo', color: 'text-gray-500' }
  }

  if (currentDate < startDate) {
    return { status: 'upcoming', label: 'Próximo', color: 'text-blue-500' }
  }

  if (currentDate > endDate) {
    return { status: 'expired', label: 'Expirado', color: 'text-red-500' }
  }

  if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
    return { status: 'limit_reached', label: 'Límite alcanzado', color: 'text-orange-500' }
  }

  return { status: 'active', label: 'Activo', color: 'text-green-500' }
}
