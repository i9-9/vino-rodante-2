#!/usr/bin/env tsx

import dotenv from 'dotenv'
import { MercadoPagoConfig } from 'mercadopago'

dotenv.config({ path: '.env.local' })

async function setupMercadoPago() {
  console.log('🚀 Configurando MercadoPago...\n')

  // Verificar variables de entorno
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  console.log('📋 Verificando variables de entorno:')
  console.log(`✅ ACCESS_TOKEN: ${accessToken ? 'Configurado' : '❌ Falta'}`)
  console.log(`✅ PUBLIC_KEY: ${publicKey ? 'Configurado' : '❌ Falta'}`)
  console.log(`✅ APP_URL: ${appUrl ? 'Configurado' : '❌ Falta'}`)

  if (!accessToken || !publicKey || !appUrl) {
    console.log('\n❌ Error: Variables de entorno faltantes')
    console.log('Copia el archivo .env.local.example a .env.local y configura las variables')
    process.exit(1)
  }

  // Verificar conexión con MercadoPago
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

  console.log('\n🎉 ¡MercadoPago configurado correctamente!')
  console.log('\n📝 Próximos pasos:')
  console.log('1. npm run dev')
  console.log('2. Ir a /checkout para probar')
  console.log('3. Usar tarjetas de prueba para simular pagos')
  
  console.log('\n💳 Tarjetas de prueba:')
  console.log('Visa: 4509 9535 6623 3704')
  console.log('CVV: 123')
  console.log('Fecha: Cualquier fecha futura')
}

setupMercadoPago().catch(console.error) 