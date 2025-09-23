#!/usr/bin/env tsx

import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testWithCorrectURL() {
  console.log('🧪 Testing with corrected URL...\n')

  const mp = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  })

  try {
    const preApproval = new PreApproval(mp)
    
    const preApprovalData = {
      reason: `Test subscription - Corrected URL`,
      external_reference: `test_corrected_url_${Date.now()}`,
      payer_email: `test-${Date.now()}@example.com`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 20,
        currency_id: 'ARS'
      },
      back_url: 'http://localhost:3000/checkout/success', // URL corregida
      status: 'pending',
      country_id: 'AR',
      site_id: 'MLA'
    }

    console.log('📝 Creating PreApproval with corrected URL...')
    console.log('🔗 Back URL:', preApprovalData.back_url)
    
    const result = await preApproval.create({ body: preApprovalData })
    
    console.log('✅ PreApproval created successfully')
    console.log('🆔 PreApproval ID:', result.id)
    console.log('🔗 Payment URL:', result.init_point)
    
    console.log('\n🎯 Now when you complete the payment:')
    console.log('1. MercadoPago will redirect to: http://localhost:3000/checkout/success')
    console.log('2. Your local server will handle the success page')
    console.log('3. The webhook will process the subscription')
    console.log('4. The subscription will be created in your database')
    
    console.log('\n💡 For production, change the URL to your actual domain:')
    console.log('back_url: "https://yourdomain.com/checkout/success"')
    
  } catch (error: any) {
    console.error('❌ FAILED:', error.message)
  }
}

testWithCorrectURL().catch(console.error)
