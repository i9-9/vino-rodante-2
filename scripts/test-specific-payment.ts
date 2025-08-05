#!/usr/bin/env tsx

import { config } from 'dotenv'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Load environment variables
config({ path: '.env.local' })

console.log('💳 Prueba Específica de Pago con MercadoPago')
console.log('=' .repeat(50))

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
const appUrl = process.env.NEXT_PUBLIC_APP_URL

if (!accessToken || !appUrl) {
  console.log('❌ Variables de entorno faltantes')
  process.exit(1)
}

async function testPayment() {
  try {
    console.log('\n🔧 Configurando MercadoPago...')
    const mercadopago = new MercadoPagoConfig({
      accessToken: accessToken
    })

    console.log('\n📋 Creando preferencia de prueba...')
    const preference = new Preference(mercadopago)

    const testData = {
      items: [
        {
          id: "test-wine-1",
          title: "Vino de Prueba",
          quantity: 1,
          unit_price: 1000,
          currency_id: "ARS",
          picture_url: "https://via.placeholder.com/150",
          description: "Vino de prueba para testing",
          category_id: "wines"
        }
      ],
      payer: {
        name: "Test",
        surname: "User",
        email: "test@example.com"
      },
      external_reference: "TEST-ORDER-" + Date.now(),
      back_urls: {
        success: `${appUrl}/checkout/confirmation?orderId=TEST-ORDER`,
        failure: `${appUrl}/checkout?error=payment_failed&orderId=TEST-ORDER`,
        pending: `${appUrl}/checkout/pending?orderId=TEST-ORDER`
      },
      statement_descriptor: "Vino Rodante",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      payment_methods: {
        installments: 12,
        default_installments: 1,
        excluded_payment_types: [
          { id: "ticket" }
        ]
      },
      metadata: {
        order_id: "TEST-ORDER",
        customer_email: "test@example.com",
        total_amount: 1000,
        test: true
      }
    }

    console.log('\n📊 Datos de preferencia:')
    console.log(JSON.stringify(testData, null, 2))

    console.log('\n🚀 Creando preferencia...')
    const result = await preference.create({
      body: testData
    })

    console.log('\n✅ Preferencia creada exitosamente!')
    console.log('ID de preferencia:', result.id)
    console.log('Init Point:', result.init_point)
    console.log('Sandbox Init Point:', result.sandbox_init_point)

    console.log('\n🔗 URLs de prueba:')
    console.log('Producción:', result.init_point)
    console.log('Sandbox:', result.sandbox_init_point)

    console.log('\n💳 TARJETAS DE PRUEBA PARA USAR:')
    console.log('\n🔵 VISA (Aprobado):')
    console.log('   Número: 4509 9535 6623 3704')
    console.log('   CVV: 123')
    console.log('   Fecha: Cualquier fecha futura')

    console.log('\n🔴 MASTERCARD (Pendiente):')
    console.log('   Número: 5031 4332 1540 6351')
    console.log('   CVV: 123')
    console.log('   Fecha: Cualquier fecha futura')

    console.log('\n🟢 AMEX (Rechazado):')
    console.log('   Número: 3711 8030 3257 522')
    console.log('   CVV: 1234')
    console.log('   Fecha: Cualquier fecha futura')

    console.log('\n📝 INSTRUCCIONES:')
    console.log('1. Ve a la URL de sandbox:')
    console.log(`   ${result.sandbox_init_point}`)
    console.log('\n2. Usa una de las tarjetas de arriba')
    console.log('\n3. NO inicies sesión como comprador')
    console.log('\n4. Completa el pago')
    console.log('\n5. Revisa los logs para ver el error específico')

    return result

  } catch (error: any) {
    console.log('\n❌ ERROR DURANTE LA PRUEBA:')
    console.log('Tipo de error:', error.constructor.name)
    console.log('Mensaje:', error.message)
    
    if (error.response?.data) {
      console.log('\n📊 Respuesta de MercadoPago:')
      console.log(JSON.stringify(error.response.data, null, 2))
    }
    
    if (error.response?.status) {
      console.log('\n📊 Código de estado:', error.response.status)
    }

    console.log('\n🔍 POSIBLES CAUSAS:')
    console.log('• Token de acceso inválido o expirado')
    console.log('• Cuenta de vendedor suspendida')
    console.log('• Configuración de aplicación incorrecta')
    console.log('• URLs de redirección inválidas')
    console.log('• Límite de transacciones excedido')

    throw error
  }
}

// Ejecutar la prueba
testPayment()
  .then(() => {
    console.log('\n✅ Prueba completada')
  })
  .catch((error) => {
    console.log('\n❌ Prueba falló:', error.message)
    process.exit(1)
  }) 