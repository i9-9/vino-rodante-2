#!/usr/bin/env tsx

import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testWithOfficialTestCards() {
  console.log('🧪 Testing with official MercadoPago test cards...\n')

  const mp = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  })

  // Tarjetas de prueba oficiales de MercadoPago Argentina
  const testCards = [
    {
      number: '4509 9535 6623 3704',
      name: 'Visa Test Card',
      cvv: '123',
      expiry: '11/25'
    },
    {
      number: '5031 7557 3453 0604',
      name: 'Mastercard Test Card', 
      cvv: '123',
      expiry: '11/25'
    }
  ]

  try {
    const preApproval = new PreApproval(mp)
    
    const preApprovalData = {
      reason: `Test subscription - Official test cards`,
      external_reference: `test_official_cards_${Date.now()}`,
      payer_email: `test-${Date.now()}@example.com`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 20,
        currency_id: 'ARS'
      },
      back_url: 'https://vino-rodante.vercel.app/checkout/success',
      status: 'pending',
      country_id: 'AR',
      site_id: 'MLA'
    }

    console.log('📝 Creating PreApproval with official test cards...')
    
    const result = await preApproval.create({ body: preApprovalData })
    
    console.log('✅ SUCCESS: PreApproval created')
    console.log('🆔 PreApproval ID:', result.id)
    console.log('🔗 Payment URL:', result.init_point)
    
    console.log('\n💳 Official MercadoPago Test Cards:')
    testCards.forEach(card => {
      console.log(`\n📋 ${card.name}:`)
      console.log(`   Number: ${card.number}`)
      console.log(`   CVV: ${card.cvv}`)
      console.log(`   Expiry: ${card.expiry}`)
    })
    
    console.log('\n🎯 Instructions:')
    console.log('1. Use the payment URL above')
    console.log('2. Try the official test cards')
    console.log('3. If they work, the issue is with your original card')
    console.log('4. If they don\'t work, the issue is with your MercadoPago account')
    
    console.log('\n💡 Why cards appear as option:')
    console.log('- MercadoPago shows ALL available payment methods')
    console.log('- But your account may have restrictions')
    console.log('- Users can pay with cards WITHOUT having MercadoPago account')
    console.log('- The restriction is on YOUR account, not the user\'s')
    
  } catch (error: any) {
    console.error('❌ FAILED:', error.message)
  }
}

testWithOfficialTestCards().catch(console.error)
