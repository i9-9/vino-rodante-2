import { createClient } from '@/lib/supabase/server'

export async function getSubscriptionPlanByClub(club: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('club', club)
    .single()
  return { plan: data, error }
}

export async function getSubscriptionPlanProducts(planId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscription_plan_products')
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        description,
        price,
        image,
        category,
        year,
        region,
        varietal
      )
    `)
    .eq('plan_id', planId)
  return { products: data, error }
} 