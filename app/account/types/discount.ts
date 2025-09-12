export interface Discount {
  id: string
  name: string
  description: string | null
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  min_purchase_amount: number
  max_discount_amount: number | null
  start_date: string
  end_date: string
  is_active: boolean
  usage_limit: number | null
  used_count: number
  applies_to: 'all_products' | 'category' | 'specific_products'
  target_value: string
  days_of_week: number[] // 0=Sunday, 1=Monday, 2=Tuesday, etc.
  created_at: string
  updated_at: string
}

export interface DiscountFormData {
  name: string
  description: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  min_purchase_amount: number
  max_discount_amount: number | null
  start_date: string
  end_date: string
  is_active: boolean
  usage_limit: number | null
  applies_to: 'all_products' | 'category' | 'specific_products'
  target_value: string
  days_of_week: number[] // 0=Sunday, 1=Monday, 2=Tuesday, etc.
}

export interface DiscountWithProducts extends Discount {
  products?: Array<{
    id: string
    name: string
    price: number
    category: string
  }>
}

export interface ProductWithDiscount {
  id: string
  name: string
  price: number
  category: string
  region: string
  year: string
  varietal: string
  stock: number
  featured: boolean
  is_visible: boolean
  image: string
  slug: string
  created_at: string
  discount?: {
    id: string
    name: string
    discount_type: 'percentage' | 'fixed_amount'
    discount_value: number
    final_price: number
    savings: number
  }
}

// Constantes para el formulario
export const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Porcentaje (%)' },
  { value: 'fixed_amount', label: 'Monto fijo ($)' }
] as const

export const APPLIES_TO_OPTIONS = [
  { value: 'all_products', label: 'Todos los productos' },
  { value: 'category', label: 'Por categoría' },
  { value: 'specific_products', label: 'Productos específicos' }
] as const

export const PRODUCT_CATEGORIES = [
  'Tinto',
  'Blanco', 
  'Rosado',
  'Espumante',
  'Naranjo',
  'Dulce',
  'Boxes',
  'Otras Bebidas'
] as const

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
] as const
