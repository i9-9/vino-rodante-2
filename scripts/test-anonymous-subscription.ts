#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { createOrUpdateGuestCustomer } from '@/lib/actions/guest-checkout'

// Test anonymous subscription checkout
async function testAnonymousSubscription() {
  console.log('🧪 Testing anonymous subscription checkout...\n')

  // Test data
  const testCustomerInfo = {
    name: 'Test User',
    email: 'test@example.com',
    address1: 'Test Address 123',
    address2: '',
    city: 'Buenos Aires',
    state: 'CABA',
    postalCode: '1000',
    country: 'Argentina'
  }

  try {
    console.log('1️⃣ Testing guest customer creation...')
    const guestResult = await createOrUpdateGuestCustomer(testCustomerInfo)
    
    if (!guestResult.success) {
      console.error('❌ Guest customer creation failed:', guestResult.error)
      return
    }
    
    console.log('✅ Guest customer created successfully:', guestResult.customerId)

    // Test API call
    console.log('\n2️⃣ Testing API call to create-recurring...')
    
    const subscriptionPayload = {
      planId: 'test-plan-id', // You'll need to replace with a real plan ID
      frequency: 'monthly',
      userId: guestResult.customerId
    }

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
