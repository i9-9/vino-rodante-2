#!/usr/bin/env tsx

import { config } from 'dotenv'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// Load environment variables
config({ path: '.env.local' })

console.log('🍷 Configuración de Cuentas de Prueba de Mercado Pago')
console.log('=' .repeat(60))

interface TestAccount {
  type: 'SELLER' | 'BUYER'
  email: string
  accessToken: string
  publicKey: string
  description: string
}

function getCurrentConfig() {
  const envPath = join(process.cwd(), '.env.local')
  
  if (!existsSync(envPath)) {
    console.log('❌ No se encontró archivo .env.local')
    return null
  }

  const envContent = readFileSync(envPath, 'utf-8')
  
  const accessToken = envContent.match(/MERCADO_PAGO_ACCESS_TOKEN=(.+)/)?.[1] || ''
  const publicKey = envContent.match(/NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=(.+)/)?.[1] || ''
  
  return { accessToken, publicKey }
}

async function testMercadoPagoConnection(accessToken: string) {
  try {
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return {
      email: data.email,
      id: data.id,
      nickname: data.nickname,
      success: true
    }
  } catch (error: any) {
    return {
      error: error.message,
      success: false
    }
  }
}

async function main() {
  console.log('📋 Configuración actual:')
  const currentConfig = getCurrentConfig()
  
  if (currentConfig?.accessToken) {
    console.log(`🔑 Access Token: ${currentConfig.accessToken.substring(0, 20)}...`)
    console.log(`🔑 Public Key: ${currentConfig.publicKey.substring(0, 20)}...`)
    
    const accountInfo = await testMercadoPagoConnection(currentConfig.accessToken)
    
    if (accountInfo.success) {
      console.log('✅ Conexión exitosa con Mercado Pago')
      console.log(`📧 Cuenta: ${accountInfo.email}`)
      console.log(`🆔 User ID: ${accountInfo.id}`)
      console.log(`📊 Tipo: ${accountInfo.nickname}`)
    } else {
      console.log('❌ Error al conectar:', accountInfo.error)
    }
  }
  
  console.log('\n🎯 Configuración de Cuentas de Prueba')
  console.log('=' .repeat(50))
  
  console.log('\n📝 PASOS PARA CONFIGURAR LAS CUENTAS DE PRUEBA:')
  console.log('\n1️⃣ CUENTA DE VENDEDOR (Recibe pagos):')
  console.log('   • Ve a https://www.mercadopago.com.ar/developers')
  console.log('   • Inicia sesión con la cuenta que RECIBIRÁ los pagos')
  console.log('   • Crea una aplicación llamada "Vino Rodante"')
  console.log('   • Copia las credenciales de PRODUCCIÓN:')
  console.log('     - Access Token: APP_USR-...')
  console.log('     - Public Key: APP_USR-...')
  
  console.log('\n2️⃣ CUENTA DE COMPRADOR (Realiza pagos):')
  console.log('   • Ve a https://www.mercadopago.com.ar/developers')
  console.log('   • Inicia sesión con OTRA cuenta (diferente a la del vendedor)')
  console.log('   • Crea una aplicación llamada "Vino Rodante - Comprador"')
  console.log('   • Copia las credenciales de PRODUCCIÓN:')
  console.log('     - Access Token: APP_USR-...')
  console.log('     - Public Key: APP_USR-...')
  
  console.log('\n3️⃣ CONFIGURACIÓN EN .env.local:')
  console.log('   # Cuenta del Vendedor (recibe pagos)')
  console.log('   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-token_del_vendedor')
  console.log('   NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-public_key_del_vendedor')
  
  console.log('\n4️⃣ TARJETAS DE PRUEBA:')
  console.log('   Para probar pagos, usa estas tarjetas:')
  console.log('   • Mastercard: 5031 4332 1540 6351')
  console.log('   • Visa: 4509 9535 6623 3704')
  console.log('   • American Express: 3711 8030 3257 522')
  console.log('   • CVV: 123')
  console.log('   • Fecha: Cualquier fecha futura')
  console.log('   • Nombre: Cualquier nombre')
  
  console.log('\n5️⃣ ESCENARIOS DE PRUEBA:')
  console.log('   • Pago aprobado: Usa cualquier tarjeta válida')
  console.log('   • Pago rechazado: Usa tarjeta 4000 0000 0000 0002')
  console.log('   • Pago pendiente: Usa tarjeta 4000 0000 0000 0127')
  
  console.log('\n6️⃣ VERIFICACIÓN:')
  console.log('   • Ejecuta: npm run test:mercadopago')
  console.log('   • Ve a /checkout y prueba un pago')
  console.log('   • Verifica que el pago llegue a la cuenta del vendedor')
  
  console.log('\n⚠️  IMPORTANTE:')
  console.log('   • Las cuentas de VENDEDOR y COMPRADOR deben ser DIFERENTES')
  console.log('   • Usa credenciales de PRODUCCIÓN (APP_USR-...)')
  console.log('   • Los pagos de prueba son REALES pero se cancelan automáticamente')
  console.log('   • Para producción, usa las mismas credenciales del vendedor')
}

main().catch(console.error) 