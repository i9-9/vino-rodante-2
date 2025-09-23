#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function getSubscriptionPlans() {
  console.log('🔍 Getting subscription plans...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.API_KEY! // Usar API_KEY que ya tienes configurado
  )

  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('id, name, is_active, is_visible')
      .eq('is_active', true)
      .eq('is_visible', true)
      .limit(3)

    if (error) {
      console.error('❌ Error fetching plans:', error)
      return
    }

    console.log('📦 Available subscription plans:')
    plans?.forEach(plan => {
      console.log(`  - ID: ${plan.id}`)
      console.log(`    Name: ${plan.name}`)
      console.log(`    Active: ${plan.is_active}`)
      console.log(`    Visible: ${plan.is_visible}`)
      console.log('')
    })

    if (plans && plans.length > 0) {
      console.log(`✅ Found ${plans.length} active plans`)
      console.log(`🎯 Use this plan ID for testing: ${plans[0].id}`)
    } else {
      console.log('❌ No active plans found')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

getSubscriptionPlans().catch(console.error)
