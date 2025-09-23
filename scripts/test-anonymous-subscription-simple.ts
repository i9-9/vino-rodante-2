#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testAnonymousSubscription() {
  console.log('🧪 Testing anonymous subscription checkout...\n')

  // Test data
  const testCustomerInfo = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`, // Email único con timestamp
    address1: 'Test Address 123',
    address2: '',
    city: 'Buenos Aires',
    state: 'CABA',
    postalCode: '1000',
    country: 'Argentina'
  }

  try {
    console.log('1️⃣ Testing guest customer creation...')
    
    // Crear cliente de administrador para bypass RLS
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.API_KEY! // Usar API_KEY que ya tienes configurado
    )

    // Buscar cliente existente
    const { data: existingCustomer, error: findError } = await adminSupabase
      .from('customers')
      .select('id, name, email')
      .eq('email', testCustomerInfo.email)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Error finding existing customer:', findError)
      return
    }

    let customerId: string

    if (existingCustomer) {
      console.log('✅ Using existing customer:', existingCustomer.id)
      customerId = existingCustomer.id
    } else {
      // Cliente no existe, crear uno nuevo
      const { v4: uuidv4 } = await import('uuid')
      const guestCustomerId = uuidv4()
      
      const { data: customerData, error: customerError } = await adminSupabase
        .from('customers')
        .insert({
          id: guestCustomerId,
          name: testCustomerInfo.name,
          email: testCustomerInfo.email,
        })
        .select()
        .single()

      if (customerError) {
        console.error('❌ Error creating guest customer:', customerError)
        return
      }

      customerId = customerData.id
      console.log('✅ New guest customer created successfully:', customerId)
    }

    // Test API call
    console.log('\n2️⃣ Testing API call to create-recurring...')
    
    const subscriptionPayload = {
      planId: '7be66b9f-19ae-4e12-90d2-1e24e178a9dd', // Club Tinto plan ID
      frequency: 'monthly',
      userId: customerId
    }

    console.log('📤 Request payload:', subscriptionPayload)

    const response = await fetch('http://localhost:3000/api/subscriptions/create-recurring', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionPayload)
    })

    console.log('📊 Response status:', response.status)
    console.log('📊 Response ok:', response.ok)

    const responseText = await response.text()
    console.log('📊 Response text:', responseText)

    if (!response.ok) {
      console.error('❌ API call failed:', responseText)
    } else {
      console.log('✅ API call successful')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAnonymousSubscription().catch(console.error)
