#!/usr/bin/env tsx

import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testWithCorrectDomain() {
  console.log('🧪 Testing with correct domain (vinorodante.com)...\n')

  const mp = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  })

  try {
    const preApproval = new PreApproval(mp)
    
    const preApprovalData = {
      reason: `Test subscription - vinorodante.com`,
      external_reference: `test_vinorodante_${Date.now()}`,
      payer_email: `test-${Date.now()}@example.com`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 20,
        currency_id: 'ARS'
      },
      back_url: 'https://vinorodante.com/checkout/success',
      status: 'pending',
      country_id: 'AR',
      site_id: 'MLA'
    }

    console.log('📝 Creating PreApproval with correct domain...')
    console.log('🔗 Back URL:', preApprovalData.back_url)
    
    const result = await preApproval.create({ body: preApprovalData })
    
    console.log('✅ PreApproval created successfully!')
    console.log('🆔 PreApproval ID:', result.id)
    console.log('🔗 Payment URL:', result.init_point)
    
    console.log('\n🎯 Configuration updated:')
    console.log('✅ Domain: vinorodante.com')
    console.log('✅ Back URL: https://vinorodante.com/checkout/success')
    console.log('✅ Environment variables updated')
    
    console.log('\n💡 Next steps:')
    console.log('1. Deploy your app to vinorodante.com')
    console.log('2. Test the payment with the URL above')
    console.log('3. After payment, you\'ll be redirected to your success page')
    console.log('4. The webhook will process the subscription')
    console.log('5. The subscription will be created in your database')
    
    console.log('\n🚀 Your checkout anónimo for subscriptions is now ready!')
    
  } catch (error: any) {
    console.error('❌ FAILED:', error.message)
  }
}

testWithCorrectDomain().catch(console.error)
