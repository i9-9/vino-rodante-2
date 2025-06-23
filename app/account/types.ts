import type { Database } from '@/lib/database.types'

export type Profile = {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  image?: string
  price: number
  varietal?: string
  year?: number
  region?: string
}

export interface Address {
  id: string
  user_id: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
}

export type OrderStatus = 
  | 'pending'           // Pendiente de pago
  | 'in_preparation'    // En preparación
  | 'shipped'          // Enviado
  | 'delivered'        // Entregado
  | 'cancelled'        // Cancelado
  | 'refunded'         // Reembolsado

export type PaymentStatus = 
  | 'pending'    // Pendiente
  | 'paid'       // Pagado
  | 'failed'     // Fallido
  | 'refunded'   // Reembolsado

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  created_at: string
  customer?: Customer
  order_items: OrderItem[]
  shipping_address?: {
    line1: string
    line2?: string | null
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product: Product
}

export interface Subscription {
  id: string
  name: string
  description: string
  club: 'tinto' | 'blanco' | 'mixto' | 'naranjo'
  price_monthly: number
  price_bimonthly: number
  price_quarterly: number
  banner_image?: string
  image?: string
  tagline?: string
  features?: any
  is_visible: boolean
  created_at: string
}

export type WineType = 'tinto' | 'blanco' | 'mixto' | 'premium'

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly'

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired'

export type DeliveryStatus = 'scheduled' | 'shipped' | 'delivered' | 'failed'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  slug: string
  type: 'tinto' | 'blanco' | 'mixto' | 'premium'
  price_weekly: number
  price_biweekly: number
  price_monthly: number
  wines_per_delivery: number
  features: string[]
  is_active: boolean
  is_visible: boolean
  created_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  subscription_plan_id: string
  subscription_plan: SubscriptionPlan
  frequency: 'weekly' | 'biweekly' | 'monthly'
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  next_delivery_date: string
  created_at: string
}

export interface SubscriptionDelivery {
  id: string
  subscription_id: string
  delivery_date: string
  status: DeliveryStatus
  tracking_number: string | null
  products: {
    id: string
    name: string
    quantity: number
    price: number
  }[]
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
}

// Tipos de respuesta para Server Actions
export interface ActionResponse {
  success: boolean
  message?: string
  error?: string
  data?: any
}

// Tipos de validación
export interface ValidationErrors {
  [key: string]: string
}

// Estados de formulario
export interface FormState {
  errors?: ValidationErrors
  message?: string
  success?: boolean
  loading?: boolean
} 