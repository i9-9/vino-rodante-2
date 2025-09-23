#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkSubscriptionStatus() {
  console.log('🔍 Checking subscription status...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.API_KEY!
  )

  const preapprovalId = '8c7e2c5619b04db885b34186411438a8'

  try {
    // Buscar la suscripción por el ID de MercadoPago
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('mercadopago_subscription_id', preapprovalId)
      .single()

    if (error) {
      console.log('❌ Subscription not found in database:', error.message)
      console.log('💡 This means the webhook may not have processed yet')
      return
    }

    console.log('✅ Subscription found in database!')
    console.log('📋 Subscription details:')
    console.log('  - ID:', subscription.id)
    console.log('  - User ID:', subscription.user_id)
    console.log('  - Plan ID:', subscription.plan_id)
    console.log('  - Status:', subscription.status)
    console.log('  - Frequency:', subscription.frequency)
    console.log('  - Start Date:', subscription.start_date)
    console.log('  - Next Delivery:', subscription.next_delivery_date)
    console.log('  - MercadoPago ID:', subscription.mercadopago_subscription_id)

    // Verificar el plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('name, description')
      .eq('id', subscription.plan_id)
      .single()

    if (!planError && plan) {
      console.log('📦 Plan details:')
      console.log('  - Name:', plan.name)
      console.log('  - Description:', plan.description)
    }

    // Verificar el usuario
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('name, email')
      .eq('id', subscription.user_id)
      .single()

    if (!customerError && customer) {
      console.log('👤 Customer details:')
      console.log('  - Name:', customer.name)
      console.log('  - Email:', customer.email)
    }

    console.log('\n🎉 SUCCESS: The subscription was created successfully!')
    console.log('💡 The payment error was likely temporary or resolved during the process')

  } catch (error) {
    console.error('❌ Error checking subscription:', error)
  }
}

checkSubscriptionStatus().catch(console.error)
