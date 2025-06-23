export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'pending' | 'failed';

export type DeliveryStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed';

export type WineType = 'tinto' | 'blanco' | 'mixto' | 'naranjo';

export interface SubscriptionPlan {
  id: string;
  club: WineType;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  image: string;
  features: string[];
  price_weekly: number;
  price_biweekly: number;
  price_monthly: number;
  price_quarterly: number;
  discount_percentage: number;
  status: 'active' | 'inactive';
  display_order: number;
  is_visible: boolean;
  banner_image: string | null;
  type: string;
  wines_per_delivery: number;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  end_date: string | null;
  current_period_end: string;
  start_date: string;
  status: SubscriptionStatus;
  is_gift: boolean;
  frequency: SubscriptionFrequency;
  next_delivery_date: string;
  mercadopago_subscription_id: string;
  payment_method_id: string;
  total_paid: number;
  plan?: SubscriptionPlan;
}

export interface SubscriptionDelivery {
  id: string;
  subscription_id: string;
  delivery_date: string;
  status: DeliveryStatus;
  tracking_number: string | null;
  products: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  notes: string | null;
}

export interface CreateSubscriptionPayload {
  plan_id: string;
  frequency: SubscriptionFrequency;
  is_gift: boolean;
}

export interface UpdateSubscriptionPayload {
  status?: SubscriptionStatus;
  frequency?: SubscriptionFrequency;
  next_delivery_date?: string;
}

export interface SubscriptionPricing {
  weekly: number;
  biweekly: number;
  monthly: number;
  quarterly: number;
  discounts: {
    biweekly: number;
    monthly: number;
    quarterly: number;
  };
}

export interface MercadoPagoPreApprovalPayload {
  reason: string;
  external_reference: string;
  payer_email: string;
  auto_recurring: {
    frequency: number;
    frequency_type: 'weeks' | 'months';
    transaction_amount: number;
    currency_id: 'ARS';
  };
  back_url: string;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';
}

export interface SubscriptionWithDetails extends UserSubscription {
  plan: SubscriptionPlan;
  deliveries: SubscriptionDelivery[];
  customer: {
    name: string;
    email: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface SubscriptionApiError {
  code: string;
  message: string;
  details?: unknown;
} 