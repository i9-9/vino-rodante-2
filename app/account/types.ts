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
  created_at: string
  is_admin: boolean
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: string | null
  year: string | null
  region: string | null
  varietal: string | null
  stock: number
  featured: boolean
  is_visible: boolean
  created_at: string
  customer_id: string | null
}

export interface Address {
  id: string
  customer_id: string
  line1: string
  line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  created_at: string
  order_items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export interface Subscription {
  id: string
  name: string
  description: string
  price: number
  interval: 'monthly' | 'quarterly' | 'yearly'
  active: boolean
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  club: string
  name: string
  price_bimonthly: number
  price_monthly: number
  price_quarterly: number
  description: string
  features: Record<string, any>
  image: string
  slug: string
  created_at: string
  is_active: boolean
}

export interface UserSubscription {
  customer_id: string
  plan_id: string
  start_date: string
  end_date: string | null
  current_period_end: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  is_gift: boolean
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