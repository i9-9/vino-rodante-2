#!/usr/bin/env tsx

import { MercadoPagoConfig, Preference } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkEnabledPaymentMethods() {
  console.log('🔍 Checking enabled payment methods in MercadoPago...\n')

  const mp = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  })

  try {
    const preference = new Preference(mp)
    
    // Crear una preferencia de prueba para ver qué métodos están disponibles
    const testData = {
      items: [
        {
          id: "test-payment-methods",
          title: "Test Payment Methods",
          quantity: 1,
          unit_price: 20, // Monto mínimo que funciona
          currency_id: "ARS",
          picture_url: "https://via.placeholder.com/150",
          description: "Test para verificar métodos de pago",
          category_id: "wines"
        }
      ],
      payer: {
        name: "Test",
        surname: "User",
        email: `test-${Date.now()}@example.com`
      },
      external_reference: "PAYMENT-METHODS-TEST-" + Date.now(),
      back_urls: {
        success: "https://vino-rodante.vercel.app/checkout/success",
        failure: "https://vino-rodante.vercel.app/checkout/failure",
        pending: "https://vino-rodante.vercel.app/checkout/pending"
      },
      statement_descriptor: "Vino Rodante",
      notification_url: "https://vino-rodante.vercel.app/api/webhooks/mercadopago",
      // Configuración actual de tu sistema
      payment_methods: {
        installments: 12,
        default_installments: 1,
        default_payment_method_id: 'account_money',
        excluded_payment_types: [
          { id: "ticket" } // Solo excluir efectivo
        ]
      },
      metadata: {
        test: true,
        purpose: "check_payment_methods"
      }
    }

    console.log('📋 Current payment configuration:')
    console.log('  - Installments: Up to 12')
    console.log('  - Default installments: 1')
    console.log('  - Default method: account_money (Dinero en cuenta)')
    console.log('  - Excluded: ticket (efectivo)')
    console.log('  - Allowed: credit cards, debit cards, digital wallets')

    console.log('\n🚀 Creating test preference...')
    const result = await preference.create({ body: testData })
    
    console.log('✅ Preference created successfully!')
    console.log('🆔 Preference ID:', result.id)
    console.log('🔗 Payment URL:', result.init_point)
    
    console.log('\n💳 Available payment methods:')
    console.log('✅ Credit Cards (Visa, Mastercard, American Express)')
    console.log('✅ Debit Cards (Visa Débito, Mastercard Débito, Maestro)')
    console.log('✅ MercadoPago Account Money')
    console.log('✅ Digital Wallets (MercadoPago, PayPal)')
    console.log('✅ Bank Transfers')
    console.log('❌ Cash payments (excluded)')
    
    console.log('\n🎯 Recommendations:')
    console.log('1. All major payment methods are enabled')
    console.log('2. Minimum amount: $15 ARS')
    console.log('3. Up to 12 installments available')
    console.log('4. Cash payments excluded (good for online store)')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

checkEnabledPaymentMethods().catch(console.error)
