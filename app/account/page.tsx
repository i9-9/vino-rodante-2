'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getTranslations } from '@/lib/get-translations'
import AccountClientNew from './AccountClientNew'
import { getProfile, getOrders, getAddresses } from './actions/auth-client'
import { getAllOrders } from './actions/admin-orders'
import { getAllProducts } from './actions/products'
import { getUserSubscriptions, getAllSubscriptionPlans, getAvailablePlans } from './actions/subscriptions'
import type { Profile } from '@/lib/types'
import type { Database } from '@/lib/database.types'
import type { Order, OrderStatus, Product, Subscription, Address, Customer, SubscriptionPlan } from './types'

type DbOrder = Database['public']['Tables']['orders']['Row'] & {
  customer?: {
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
  order_items?: DbOrderItem[]
}

type DbOrderItem = {
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

type DbProfile = {
  id: string
  name: string
  created_at: string
  is_admin: boolean
}

export default async function AccountPage() {
  const supabase = await createClient()
  const t = await getTranslations()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth/sign-in')
  }

  // Get user profile and check if admin
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single()

  const isAdmin = customer?.is_admin || false

  // Get user orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get user addresses
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  // Get user subscriptions with plan details
  const { data: userSubscriptions } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_plan:subscription_plans(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get subscription plans
  const { data: availablePlans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('display_order', { ascending: true })

  // Ensure features is never null and filter active plans for non-admin users
  const plansWithFeatures = (availablePlans || [])
    .filter(plan => isAdmin || plan.is_active)
    .map(plan => ({
      ...plan,
      features: plan.features || []
    }))

  // Admin data
  let adminOrders: Order[] = []
  let adminProducts: Product[] = []
  let adminSubscriptions: UserSubscription[] = []
  let adminUsers: Customer[] = []

  if (isAdmin) {
    // Get all orders for admin
    const { data: allOrders } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        customer:customers!user_id(
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    adminOrders = allOrders || []

    // Get all products for admin
    const { data: allProducts } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    adminProducts = allProducts || []

    // Get all subscriptions for admin
    const { data: allSubscriptions } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(*),
        customer:customers(
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    adminSubscriptions = allSubscriptions || []

    // Get all users for admin
    const { data: allUsers } = await supabase
      .from('customers')
      .select('id, name, email, is_admin, created_at')
      .order('name', { ascending: true })
    adminUsers = allUsers || []
  }

  return (
    <AccountClientNew
      user={user}
      profile={customer || { id: user.id, email: user.email }}
      orders={orders || []}
      addresses={addresses || []}
      userSubscriptions={userSubscriptions || []}
      availablePlans={plansWithFeatures}
      userRole={isAdmin ? 'admin' : 'user'}
      t={t}
      adminOrders={adminOrders}
      adminProducts={adminProducts}
      adminSubscriptions={adminSubscriptions}
      adminUsers={adminUsers}
    />
  )
}
