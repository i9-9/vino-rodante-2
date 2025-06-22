import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/get-translations'
import AccountClientNew from './AccountClientNew'
import { getProfile, getOrders, getAddresses } from './actions/auth-client'
import { getAllOrders } from './actions/admin-orders'
import { getAllProducts } from './actions/products'
import { getUserSubscriptions } from './actions/subscriptions'
import type { Profile } from '@/lib/types'
import type { Database } from '@/lib/database.types'
import type { Order, OrderStatus, Product, Subscription, Address } from './types'

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
  
  // OFICIAL: Siempre usar getUser() para proteger páginas
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
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

  const isAdmin = customerData?.is_admin || false
  const userRole = isAdmin ? 'admin' : 'user'

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
    userSubscriptionsResult,
    // Admin data if user is admin
    adminOrdersResult,
    adminSubscriptionsResult,
    adminProductsResult,
  ] = await Promise.all([
    getProfile(user.id),
    getOrders(user.id),
    getAddresses(user.id),
    getUserSubscriptions(user.id),
    // Only fetch admin data if user is admin
    isAdmin ? getAllOrders() : Promise.resolve({ data: null, error: null }),
    isAdmin ? Promise.resolve({ data: [], error: null }) : Promise.resolve({ data: null, error: null }),
    isAdmin ? getAllProducts() : Promise.resolve({ data: null, error: null }),
  ])

  // Debug logs
  console.log('Debug - Raw Orders Result:', ordersResult)
  console.log('Debug - Raw Admin Orders Result:', adminOrdersResult)
  console.log('Debug - Raw User Subscriptions Result:', userSubscriptionsResult)

  if (profileResult.error) {
    console.error('Error fetching profile:', profileResult.error)
  }

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
  const orders: Order[] = ordersResult.data?.map((orderData: any) => {
    const order: DbOrder = {
      id: orderData.id,
      user_id: orderData.user_id,
      status: orderData.status,
      total: orderData.total,
      created_at: orderData.created_at || new Date().toISOString(),
      customer: orderData.customer ? {
        id: orderData.customer.id,
        name: orderData.customer.name || '',
        email: orderData.customer.email || '',
        phone: orderData.customer.phone,
        address: orderData.customer.address,
        city: orderData.customer.city,
        state: orderData.customer.state,
        postal_code: orderData.customer.postal_code,
        country: orderData.customer.country
      } : undefined,
      order_items: orderData.order_items?.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price
      })) || []
    }

    return {
      id: order.id,
      user_id: order.user_id || user.id,
      status: order.status as OrderStatus,
      total: order.total,
      created_at: order.created_at,
      customer: order.customer,
      order_items: order.order_items.map(item => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.product_id,
          name: item.product_name || 'Producto sin nombre',
          description: undefined,
          image: undefined,
          price: item.price,
          varietal: undefined,
          year: undefined,
          region: undefined
        }
      }))
    }
  }) || []

  // Transform admin orders to match the expected type
  const adminOrders: Order[] | undefined = isAdmin 
    ? adminOrdersResult.data?.map((orderData: any) => {
        const order: DbOrder = {
          id: orderData.id,
          user_id: orderData.user_id,
          status: orderData.status,
          total: orderData.total,
          created_at: orderData.created_at || new Date().toISOString(),
          customer: orderData.customer ? {
            id: orderData.customer.id,
            name: orderData.customer.name || '',
            email: orderData.customer.email || '',
            phone: orderData.customer.phone,
            address: orderData.customer.address,
            city: orderData.customer.city,
            state: orderData.customer.state,
            postal_code: orderData.customer.postal_code,
            country: orderData.customer.country
          } : undefined,
          order_items: orderData.order_items?.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price
          })) || []
        }

        return {
          id: order.id,
          user_id: order.user_id || '',
          status: order.status as OrderStatus,
          total: order.total,
          created_at: order.created_at,
          customer: order.customer,
          order_items: order.order_items.map(item => ({
            id: item.id,
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product_id,
              name: item.product_name || 'Producto sin nombre',
              description: undefined,
              image: undefined,
              price: item.price,
              varietal: undefined,
              year: undefined,
              region: undefined
            }
          }))
        }
      })
    : undefined

  // Debug logs
  console.log('Debug - Transformed Orders:', orders)
  console.log('Debug - Transformed Admin Orders:', adminOrders)

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

  // Transform user subscriptions - now directly using the array returned by getUserSubscriptions
  const userSubscriptions = userSubscriptionsResult || []

  // DEBUG: Log final data being passed to client
  console.log('🔍 Server Debug - Final Data:', {
    userRole,
    isAdmin,
    profile,
    orders: orders.length,
    addresses: addresses.length,
    userSubscriptions: userSubscriptions.length,
    adminOrders: adminOrders?.length,
    adminSubscriptions: adminSubscriptionsResult.data?.length,
    adminProducts: adminProductsResult.data?.length
  })

  return (
    <AccountClientNew
      user={user}
      profile={profile}
      orders={orders}
      addresses={addresses}
      userSubscriptions={userSubscriptions}
      userRole={userRole}
      t={t}
      // Admin data
      adminOrders={adminOrders}
      adminSubscriptions={adminSubscriptionsResult.data || []}
      adminProducts={adminProductsResult.data || []}
    />
  )
}
