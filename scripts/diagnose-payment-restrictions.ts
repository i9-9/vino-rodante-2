#!/usr/bin/env tsx

import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function diagnosePaymentMethodIssue() {
  console.log('🔍 Diagnosing payment method restrictions...\n')

  const mp = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  })

  try {
    const preApproval = new PreApproval(mp)
    
    // Probar con configuración mínima (sin restricciones)
    const preApprovalData = {
      reason: `Test subscription - No restrictions`,
      external_reference: `test_no_restrictions_${Date.now()}`,
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
      site_id: 'MLA'
      // Sin configuración de payment_methods para máxima permisividad
    }

    console.log('📝 Testing with minimal configuration (no payment restrictions)...')
    console.log('💳 This should allow ALL available payment methods for your account')
    
    const result = await preApproval.create({ body: preApprovalData })
    
    console.log('✅ SUCCESS: PreApproval created with minimal restrictions')
    console.log('🆔 PreApproval ID:', result.id)
    console.log('🔗 Payment URL:', result.init_point)
    
    console.log('\n💡 Next steps:')
    console.log('1. Test this URL with different payment methods')
    console.log('2. Check which methods work and which don\'t')
    console.log('3. The issue might be:')
    console.log('   - Account verification status')
    console.log('   - Business type restrictions')
    console.log('   - Geographic restrictions')
    console.log('   - Card issuer restrictions')
    
    console.log('\n🔧 If the issue persists:')
    console.log('1. Check your MercadoPago dashboard')
    console.log('2. Verify account status')
    console.log('3. Contact MercadoPago support')
    console.log('4. Consider using a different test card')
    
  } catch (error: any) {
    console.error('❌ FAILED:', error.message)
    
    if (error.message.includes('payment') || error.message.includes('method')) {
      console.log('💡 This confirms payment method restrictions')
      console.log('🔧 Solution: Check MercadoPago account settings')
    }
  }
}

diagnosePaymentMethodIssue().catch(console.error)
