import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkSubscriptionPlans() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      throw error
    }

    console.log('Found subscription plans:', plans.length)
    console.log('\nPlans:')
    plans.forEach(plan => {
      console.log(`\n${plan.name} (${plan.type})`)
      console.log('- ID:', plan.id)
      console.log('- Slug:', plan.slug)
      console.log('- Active:', plan.is_active)
      console.log('- Visible:', plan.is_visible)
      console.log('- Features:', plan.features)
      console.log('- Prices:', {
        weekly: plan.price_weekly,
        biweekly: plan.price_biweekly,
        monthly: plan.price_monthly
      })
    })
  } catch (error) {
    console.error('Error checking subscription plans:', error)
  }
}

checkSubscriptionPlans() 