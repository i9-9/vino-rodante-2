import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/get-translations'
import AccountClientNew from './AccountClientNew'
import { getProfile, getOrders, getAddresses } from './actions/auth-client'
import { getAllOrders } from './actions/admin-orders'
import type { Profile } from '@/lib/types'
import type { Database } from '@/lib/database.types'
import type { Order, Product, Subscription, Address } from './types'

type DbOrder = Database['public']['Tables']['orders']['Row']
type DbOrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name?: string
  quantity: number
  price: number
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
  
  // OFICIAL: Siempre usar getUser() para proteger páginas
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/sign-in')
  }

  // DEBUG: Log user info
  console.log('🔍 Server Debug - User Info:', {
    userEmail: user.email,
    userId: user.id
  });

  // Fetch customer profile with is_admin field
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single()

  // DEBUG: Log customer data
  console.log('🔍 Server Debug - Customer Data:', {
    customerData,
    customerError: customerError?.message,
    isAdmin: customerData?.is_admin
  });

  const userRole = customerData?.is_admin ? 'admin' : 'user'
  const isAdmin = userRole === 'admin'

  // DEBUG: Log role assignment
  console.log('🔍 Server Debug - Role Assignment:', {
    userRole,
    isAdmin,
    customerDataExists: !!customerData,
    customerDataType: typeof customerData,
    customerDataValue: customerData
  });

  // Fetch all required data in parallel
  const [
    profileResult,
    ordersResult,
    addressesResult,
    // Admin data if user is admin
    adminOrdersResult,
    adminSubscriptionsResult,
    adminProductsResult,
  ] = await Promise.all([
    getProfile(user.id),
    getOrders(user.id),
    getAddresses(user.id),
    // Only fetch admin data if user is admin
    isAdmin ? getAllOrders() : Promise.resolve({ data: null, error: null }),
    isAdmin ? supabase.from('subscriptions').select('*') : Promise.resolve({ data: null, error: null }),
    isAdmin ? supabase.from('products').select('*') : Promise.resolve({ data: null, error: null }),
  ])

  // Transform addresses to match the expected type
  const addresses: Address[] = addressesResult.data?.map(address => ({
    id: address.id,
    customer_id: user.id,
    line1: address.street || '',
    line2: address.line2 || null,
    city: address.city || '',
    state: address.state || '',
    postal_code: address.postal_code || '',
    country: address.country || '',
    is_default: address.is_default || false,
    created_at: address.created_at || new Date().toISOString()
  })) || []

  // Transform orders to match the expected type
  const orders: Order[] = ordersResult.data?.map(order => ({
    id: order.id,
    user_id: order.user_id || user.id,
    status: order.status as 'pending' | 'processing' | 'completed' | 'cancelled',
    total: order.total,
    created_at: order.created_at || new Date().toISOString(),
    order_items: (order.order_items ?? []).map((item: DbOrderItem) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name: item.product_name ?? 'Producto sin nombre',
      price: item.price,
      quantity: item.quantity
    }))
  })) || []

  // Transform admin orders to match the expected type
  const adminOrders: Order[] | undefined = isAdmin 
    ? adminOrdersResult.data?.map(order => ({
        id: order.id,
        user_id: order.user_id || '',
        status: order.status as 'pending' | 'processing' | 'completed' | 'cancelled',
        total: order.total,
        created_at: order.created_at || new Date().toISOString(),
        order_items: (order.order_items || []).map((item: DbOrderItem) => ({
          id: item.id,
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name || 'Producto sin nombre',
          price: item.price,
          quantity: item.quantity
        }))
      }))
    : undefined

  // Transform admin subscriptions to match the expected type
  const adminSubscriptions: Subscription[] | undefined = isAdmin
    ? adminSubscriptionsResult.data?.map(subscription => ({
        id: subscription.id,
        name: subscription.name,
        description: subscription.description,
        price: subscription.price,
        interval: subscription.interval as 'monthly' | 'quarterly' | 'yearly',
        active: subscription.active,
        created_at: subscription.created_at || new Date().toISOString()
      }))
    : undefined

  // Transform admin products to match the expected type
  const adminProducts: Product[] | undefined = isAdmin
    ? adminProductsResult.data?.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        year: product.year,
        region: product.region,
        varietal: product.varietal,
        featured: product.featured,
        image: product.image || '/placeholder.jpg',
        is_visible: product.is_visible,
        created_at: product.created_at || new Date().toISOString(),
        customer_id: product.customer_id
      }))
    : undefined

  // Transform profile to match the expected type
  const profile: Profile = customerData ? {
    id: user.id,
    name: customerData.name || '',
    email: user.email || '',
    created_at: customerData.created_at || new Date().toISOString()
  } : {
    id: user.id,
    name: '',
    email: user.email || '',
    created_at: new Date().toISOString()
  }

  // DEBUG: Log final data being passed to client
  console.log('🔍 Server Debug - Final Data:', {
    userRole,
    isAdmin,
    hasProfile: !!customerData,
    ordersCount: orders.length,
    addressesCount: addresses.length,
    adminOrdersCount: adminOrders?.length || 0,
    adminSubscriptionsCount: adminSubscriptions?.length || 0,
    adminProductsCount: adminProducts?.length || 0,
    // Add raw data for inspection
    customerData,
    profileResult: profileResult.data,
    adminOrdersResult: adminOrdersResult?.data,
    adminSubscriptionsResult: adminSubscriptionsResult?.data,
    adminProductsResult: adminProductsResult?.data
  });

  return (
    <AccountClientNew
      user={user}
      profile={profile}
      orders={orders}
      addresses={addresses}
      userRole={userRole}
      t={t}
      // Admin data
      adminOrders={adminOrders}
      adminSubscriptions={adminSubscriptions}
      adminProducts={adminProducts}
    />
  )
}
