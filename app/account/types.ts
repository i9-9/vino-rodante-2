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
  is_admin: boolean
  created_at: string
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
  customer_id: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

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
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name?: string
  quantity: number
  price: number
  products?: {
    id: string
    name: string
    description?: string
    image?: string
    price: number
    varietal?: string
    year?: number
    region?: string
  }
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
  description: string | null
  price_monthly: number
  price_biweekly: number
  price_weekly: number
  club: string | null
  features: string[]
  image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  type: 'tinto' | 'blanco' | 'mixto' | 'premium'
  tagline: string | null
  banner_image: string | null
  display_order: number | null
  is_visible: boolean
  wines_per_delivery: number
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  frequency: SubscriptionFrequency
  start_date: string
  end_date: string | null
  current_period_end: string | null
  next_delivery_date: string | null
  mercadopago_subscription_id: string | null
  payment_method_id: string | null
  total_paid: number | null
  created_at: string
  updated_at: string
  subscription_plan: SubscriptionPlan
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

export type SubscriptionAction = 'pause' | 'cancel' | 'reactivate' | 'change-frequency'

export interface SubscriptionActionModalProps {
  isOpen: boolean
  onClose: () => void
  action: SubscriptionAction
  subscription: UserSubscription
  availablePlans?: SubscriptionPlan[]
  onConfirm: (reason?: string, newPlan?: string) => Promise<void>
}

export interface SubscriptionPlanFormData {
  name: string
  description: string
  tagline?: string
  image?: string
  features: string[]
  price_monthly: number
  price_quarterly: number
  discount_percentage?: number
  status: string
  display_order?: number
  is_visible: boolean
  banner_image?: string
  type: 'tinto' | 'blanco' | 'mixto' | 'premium'
  price_weekly: number
  price_biweekly: number
  wines_per_delivery: number
  is_active: boolean
} 