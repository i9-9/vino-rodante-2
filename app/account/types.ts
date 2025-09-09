
export type Profile = {
  id: string
  name: string
  email: string
  phone: string | null
  created_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  is_admin: boolean
  created_at: string
  addresses: Address[]
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
  category?: string
  stock: number
  is_visible: boolean
  featured: boolean
  discount?: {
    id: string
    name: string
    discount_type: 'percentage' | 'fixed_amount'
    discount_value: number
    final_price: number
    savings: number
  }
}

export interface Address {
  id: string
  line1: string
  line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'in_preparation'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

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
  customer?: Customer | null
  order_items: OrderItem[]
  shipping_address?: {
    line1: string
    line2?: string | null
    city: string
    state: string
    postal_code: string
    country: string
  } | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  products?: {
    id: string
    name: string
    description?: string
    image?: string
    price: number
    varietal?: string
    year?: string | number
    region?: string
  }
}

export interface SubscriptionCustomer {
  id: string
  name: string
  email: string
  addresses: Address[]
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'pending'
export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly'

export interface SubscriptionPlan {
  id: string
  name: string
   club: string
  slug: string | null
  description: string | null
  tagline: string | null
  image: string
  features: string[] | null
  price_monthly: number
  price_quarterly: number
  discount_percentage: number
  status: string
  display_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
  banner_image: string | null
  type: 'tinto' | 'blanco' | 'mixto' | 'premium'
  price_weekly: number
  price_biweekly: number
  wines_per_delivery: number
  is_active: boolean
}

export interface UserSubscription {
  id: string
  customer_id: string
  plan_id: string
  start_date: string
  end_date: string | null
  current_period_end: string | null
  status: SubscriptionStatus
  is_gift: boolean
  frequency: SubscriptionFrequency
  next_delivery_date: string | null
  mercadopago_subscription_id: string | null
  payment_method_id: string | null
  total_paid: number | null
  subscription_plan?: SubscriptionPlan
  customer?: SubscriptionCustomer
}

export interface SubscriptionDetails {
  subscription_id: string
  customer_id: string
  plan_id: string
  start_date: string
  end_date: string | null
  current_period_end: string | null
  status: SubscriptionStatus
  is_gift: boolean
  frequency: SubscriptionFrequency
  next_delivery_date: string | null
  mercadopago_subscription_id: string | null
  payment_method_id: string | null
  total_paid: number | null
  // Plan fields
  name: string
  description: string | null
  price_monthly: number
  price_biweekly: number
  price_weekly: number
  club: string
  features: string[]
  image: string | null
  is_active: boolean
  type: 'tinto' | 'blanco' | 'mixto' | 'premium'
  created_at: string
  updated_at: string
  // User fields
  user_email: string | null
  user_name: string | null
}

export interface SubscriptionAddresses {
  subscription_id: string
  addresses: Address[]
}

export type WineType = 'tinto' | 'blanco' | 'mixto' | 'premium'

export type DeliveryStatus = 'scheduled' | 'shipped' | 'delivered' | 'failed'

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

export interface AuthUser {
  id: string
  email: string
  raw_user_meta_data: {
    full_name: string | null
  }
} 