import { createClient } from '@/lib/supabase/server'

export async function getSubscriptionPlanByClub(club: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('club', club)
    .single()
  return { plan: data, error }
} 