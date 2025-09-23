#!/usr/bin/env tsx

import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function debugCardError() {
  console.log('🔍 Debugging card payment error...\n')

  const mp = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  })

  try {
    const preApproval = new PreApproval(mp)
    
    // Crear PreApproval con configuración mínima para debug
    const preApprovalData = {
      reason: `Debug subscription - Card error`,
      external_reference: `debug_card_${Date.now()}`,
      payer_email: `debug-${Date.now()}@example.com`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 20, // Monto mínimo
        currency_id: 'ARS'
      },
      back_url: 'https://vino-rodante.vercel.app/checkout/success',
      status: 'pending',
      country_id: 'AR',
      site_id: 'MLA'
    }

    console.log('📝 Creating PreApproval for debugging...')
    console.log('💳 Configuration:', {
      amount: preApprovalData.auto_recurring.transaction_amount,
      currency: preApprovalData.auto_recurring.currency_id,
      country: preApprovalData.country_id,
      site: preApprovalData.site_id
    })
    
    const result = await preApproval.create({ body: preApprovalData })
    
    console.log('✅ PreApproval created successfully')
    console.log('🆔 PreApproval ID:', result.id)
    console.log('🔗 Payment URL:', result.init_point)
    
    console.log('\n🔍 Possible causes of card error:')
    console.log('1. ❌ Account verification status')
    console.log('   - Your MercadoPago account may need verification')
    console.log('   - Check your dashboard for verification status')
    
    console.log('\n2. ❌ Card restrictions')
    console.log('   - Your specific card may be blocked')
    console.log('   - Try a different card from another bank')
    console.log('   - Check if your bank allows online payments')
    
    console.log('\n3. ❌ Geographic restrictions')
    console.log('   - Your location may have restrictions')
    console.log('   - Try from a different IP/location')
    
    console.log('\n4. ❌ Business type restrictions')
    console.log('   - Your business type may limit certain cards')
    console.log('   - Check your MercadoPago business settings')
    
    console.log('\n5. ❌ Card issuer restrictions')
    console.log('   - Your bank may block MercadoPago')
    console.log('   - Contact your bank to enable online payments')
    
    console.log('\n🧪 Test steps:')
    console.log('1. Try the payment URL above')
    console.log('2. Use a different card (different bank)')
    console.log('3. Try from a different device/network')
    console.log('4. Check your MercadoPago dashboard')
    console.log('5. Contact MercadoPago support with PreApproval ID')
    
    console.log('\n📞 MercadoPago Support Info:')
    console.log('PreApproval ID:', result.id)
    console.log('Account Token:', process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 20) + '...')
    console.log('Error: "La operación no acepta este medio de pago"')
    
  } catch (error: any) {
    console.error('❌ PreApproval creation failed:', error.message)
    
    if (error.message.includes('amount')) {
      console.log('💡 Amount-related error - check minimum amount')
    } else if (error.message.includes('country')) {
      console.log('💡 Country-related error - check country settings')
    } else if (error.message.includes('account')) {
      console.log('💡 Account-related error - check account status')
    }
  }
}

debugCardError().catch(console.error)
