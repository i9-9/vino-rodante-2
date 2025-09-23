#!/usr/bin/env tsx

import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testMinimumAmounts() {
  console.log('🧪 Testing MercadoPago minimum amounts...\n')

  const mp = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  })

  const testAmounts = [1, 5, 10, 20, 50, 100]
  
  for (const amount of testAmounts) {
    console.log(`\n💰 Testing amount: $${amount} ARS`)
    
    try {
      const preApproval = new PreApproval(mp)
      
      const preApprovalData = {
        reason: `Test subscription - $${amount}`,
        external_reference: `test_${Date.now()}_${amount}`,
        payer_email: `test-${Date.now()}@example.com`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: 'ARS'
        },
        back_url: 'https://vino-rodante.vercel.app/checkout/success',
        status: 'pending',
        country_id: 'AR',
        site_id: 'MLA'
      }

      const result = await preApproval.create({ body: preApprovalData })
      
      console.log(`✅ SUCCESS: $${amount} ARS - PreApproval ID: ${result.id}`)
      
    } catch (error: any) {
      console.log(`❌ FAILED: $${amount} ARS - Error: ${error.message}`)
      
      if (error.message.includes('amount') || error.message.includes('minimum')) {
        console.log(`   💡 This suggests $${amount} is below minimum`)
      }
    }
  }
  
  console.log('\n🎯 Summary:')
  console.log('- If amount fails, it\'s below MercadoPago minimum')
  console.log('- If amount succeeds, it\'s above minimum')
  console.log('- Use the lowest successful amount as your minimum')
}

testMinimumAmounts().catch(console.error)
