import { createClient } from '@/lib/supabase/server'

export async function getAllOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, status, total, created_at,
      customers (id, name, email),
      order_items (
        id, product_id, quantity, price,
        products (name)
      )
    `)
    .order('created_at', { ascending: false })

  return { data, error }
} 