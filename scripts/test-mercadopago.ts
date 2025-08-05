#!/usr/bin/env tsx

import { config } from 'dotenv'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Load environment variables
config({ path: '.env.local' })

async function testMercadoPago() {
  console.log('🧪 Probando integración de MercadoPago...\n')

  // Check environment variables
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  console.log('📋 Variables de entorno:')
  console.log(`✅ ACCESS_TOKEN: ${accessToken ? 'Configurado' : '❌ Falta'}`)
  console.log(`✅ PUBLIC_KEY: ${publicKey ? 'Configurado' : '❌ Falta'}`)
  console.log(`✅ APP_URL: ${appUrl ? 'Configurado' : '❌ Falta'}`)

  if (!accessToken || !publicKey || !appUrl) {
    console.log('\n❌ Error: Variables de entorno faltantes')
    console.log('Copia el archivo .env.local.example a .env.local y configura las variables')
    process.exit(1)
  }

  // Test MercadoPago connection
  try {
    console.log('\n🔌 Probando conexión con MercadoPago...')
    
    const mp = new MercadoPagoConfig({
      accessToken: accessToken,
    })

    console.log('✅ Conexión exitosa con MercadoPago')
    console.log(`📍 Modo: ${accessToken.startsWith('TEST-') ? 'SANDBOX (Desarrollo)' : 'PRODUCCIÓN'}`)

  } catch (error) {
    console.log('❌ Error al conectar con MercadoPago:', error)
    process.exit(1)
  }

  // Test preference creation
  try {
    console.log('\n🛒 Probando creación de preferencia...')
    
    const mp = new MercadoPagoConfig({
      accessToken: accessToken,
    })

    const preference = new Preference(mp)
    
    const testItems = [
      {
        id: 'test-wine-1',
        title: 'Vino de Prueba - Malbec',
        quantity: 1,
        unit_price: 2500,
        currency_id: 'ARS',
        picture_url: 'https://example.com/wine.jpg',
        description: 'Vino de prueba para testing',
        category_id: 'wines'
      }
    ]

    const testCustomer = {
      name: 'Usuario Prueba',
      email: 'test@example.com'
    }

    const preferenceData = {
      items: testItems,
      payer: {
        name: testCustomer.name.split(' ')[0],
        surname: testCustomer.name.split(' ').slice(1).join(' ') || '',
        email: testCustomer.email,
      },
      external_reference: 'test-order-' + Date.now(),
      back_urls: {
        success: `${appUrl}/checkout/confirmation?orderId=test-order`,
        failure: `${appUrl}/checkout?error=payment_failed`,
        pending: `${appUrl}/checkout/pending?orderId=test-order`,
      },
      statement_descriptor: 'Vino Rodante',
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      payment_methods: {
        installments: 12,
        default_installments: 1,
        excluded_payment_types: [
          { id: 'ticket' }
        ]
      },
      metadata: {
        test: true,
        created_at: new Date().toISOString()
      }
    }

    console.log('📋 Datos de preferencia:', {
      back_urls: preferenceData.back_urls,
      notification_url: preferenceData.notification_url
    })

    const result = await preference.create({ body: preferenceData })

    console.log('✅ Preferencia creada exitosamente')
    console.log(`📋 ID de preferencia: ${result.id}`)
    console.log(`🔗 URL de pago: ${result.init_point}`)
    console.log(`🔗 URL de sandbox: ${result.sandbox_init_point}`)

  } catch (error: any) {
    console.log('❌ Error al crear preferencia:', error.message)
    if (error.response?.data) {
      console.log('Detalles del error:', error.response.data)
    }
    process.exit(1)
  }

  // Test webhook endpoint
  console.log('\n🌐 Probando endpoint de webhook...')
  console.log(`URL del webhook: ${appUrl}/api/webhooks/mercadopago`)
  console.log('⚠️  Para probar webhooks en desarrollo, usa ngrok:')
  console.log('   npm install -g ngrok')
  console.log('   ngrok http 3000')
  console.log('   Copia la URL de ngrok y configúrala en MercadoPago')

  console.log('\n🎉 ¡Pruebas completadas!')
  console.log('\n📝 Próximos pasos:')
  console.log('1. npm run dev')
  console.log('2. Ir a /checkout para probar el flujo completo')
  console.log('3. Usar tarjetas de prueba para simular pagos')
  
  console.log('\n💳 Tarjetas de prueba:')
  console.log('Visa: 4509 9535 6623 3704')
  console.log('Mastercard: 5031 4332 1540 6351')
  console.log('American Express: 3711 8030 3257 522')
  console.log('CVV: 123')
  console.log('Fecha: Cualquier fecha futura')
  console.log('DNI: 12345678')

  console.log('\n🔧 Configuración adicional:')
  console.log('- Configura webhooks en MercadoPago para recibir notificaciones')
  console.log('- Usa ngrok para desarrollo local')
  console.log('- Verifica que las URLs de redirección sean correctas')
}

testMercadoPago().catch(console.error) 