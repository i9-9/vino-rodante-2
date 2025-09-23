#!/usr/bin/env tsx

import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testDebitCardSupport() {
  console.log('🧪 Testing debit card support in MercadoPago subscriptions...\n')

  const mp = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  })

  try {
    const preApproval = new PreApproval(mp)
    
    const preApprovalData = {
      reason: `Test subscription - Debit card support`,
      external_reference: `test_debit_${Date.now()}`,
      payer_email: `test-${Date.now()}@example.com`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 20, // Monto mínimo que funciona
        currency_id: 'ARS'
      },
      back_url: 'https://vino-rodante.vercel.app/checkout/success',
      status: 'pending',
      country_id: 'AR',
      site_id: 'MLA',
      // Configuración específica para tarjetas de débito
      payment_methods: {
        installments: 1,
        default_installments: 1,
        // NO excluir ningún método de pago
        excluded_payment_types: [],
        excluded_payment_methods: []
      }
    }

    console.log('📝 Testing PreApproval with debit card support...')
    console.log('💳 Payment methods config:', preApprovalData.payment_methods)
    
    const result = await preApproval.create({ body: preApprovalData })
    
    console.log('✅ SUCCESS: PreApproval created with debit card support')
    console.log('🔗 Payment URL:', result.init_point)
    console.log('🆔 PreApproval ID:', result.id)
    
    console.log('\n💡 Recommendations:')
    console.log('1. Use amount >= $15 ARS (minimum)')
    console.log('2. Don\'t exclude any payment methods')
    console.log('3. Set installments to 1 for subscriptions')
    console.log('4. Test with real debit cards in production')
    
  } catch (error: any) {
    console.error('❌ FAILED:', error.message)
    
    if (error.message.includes('debit') || error.message.includes('card')) {
      console.log('💡 This suggests debit card restrictions')
    }
  }
}

testDebitCardSupport().catch(console.error)
