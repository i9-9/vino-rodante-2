#!/usr/bin/env tsx

import { config } from 'dotenv'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// Load environment variables
config({ path: '.env.local' })

console.log('🍷 Configuración de Cuenta de Mercado Pago para Vino Rodante')
console.log('=' .repeat(60))

interface MercadoPagoConfig {
  accessToken: string
  publicKey: string
  accountType: 'TEST' | 'PROD'
  accountEmail?: string
}

function getCurrentConfig(): MercadoPagoConfig | null {
  const envPath = join(process.cwd(), '.env.local')
  
  if (!existsSync(envPath)) {
    console.log('❌ No se encontró archivo .env.local')
    return null
  }

  const envContent = readFileSync(envPath, 'utf-8')
  
  const accessToken = envContent.match(/MERCADO_PAGO_ACCESS_TOKEN=(.+)/)?.[1] || ''
  const publicKey = envContent.match(/NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=(.+)/)?.[1] || ''
  
  if (!accessToken || !publicKey) {
    console.log('❌ No se encontraron las credenciales de Mercado Pago')
    return null
  }

  const accountType = accessToken.startsWith('TEST') ? 'TEST' : 'PROD'
  
  return {
    accessToken,
    publicKey,
    accountType
  }
}

function updateMercadoPagoConfig(newConfig: MercadoPagoConfig) {
  const envPath = join(process.cwd(), '.env.local')
  
  if (!existsSync(envPath)) {
    console.log('❌ No se encontró archivo .env.local')
    console.log('📝 Crea el archivo .env.local con las credenciales de Mercado Pago')
    return false
  }

  const envContent = readFileSync(envPath, 'utf-8')
  
  // Update or add MercadoPago credentials
  let updatedContent = envContent
  
  // Update access token
  if (envContent.includes('MERCADO_PAGO_ACCESS_TOKEN=')) {
    updatedContent = updatedContent.replace(
      /MERCADO_PAGO_ACCESS_TOKEN=.+/,
      `MERCADO_PAGO_ACCESS_TOKEN=${newConfig.accessToken}`
    )
  } else {
    updatedContent += `\nMERCADO_PAGO_ACCESS_TOKEN=${newConfig.accessToken}`
  }
  
  // Update public key
  if (envContent.includes('NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=')) {
    updatedContent = updatedContent.replace(
      /NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=.+/,
      `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=${newConfig.publicKey}`
    )
  } else {
    updatedContent += `\nNEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=${newConfig.publicKey}`
  }
  
  writeFileSync(envPath, updatedContent)
  return true
}

function testMercadoPagoConnection(accessToken: string) {
  console.log('🔍 Probando conexión con Mercado Pago...')
  
  return fetch('https://api.mercadopago.com/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  })
  .then(data => {
    console.log('✅ Conexión exitosa con Mercado Pago')
    console.log(`📧 Cuenta: ${data.email}`)
    console.log(`🆔 User ID: ${data.id}`)
    console.log(`📊 Tipo: ${data.nickname}`)
    return data
  })
  .catch(error => {
    console.log('❌ Error al conectar con Mercado Pago:', error.message)
    return null
  })
}

async function main() {
  console.log('📋 Configuración actual:')
  const currentConfig = getCurrentConfig()
  
  if (currentConfig) {
    console.log(`🔑 Access Token: ${currentConfig.accessToken.substring(0, 20)}...`)
    console.log(`🔑 Public Key: ${currentConfig.publicKey.substring(0, 20)}...`)
    console.log(`📊 Tipo de cuenta: ${currentConfig.accountType}`)
    
    // Test current connection
    const accountInfo = await testMercadoPagoConnection(currentConfig.accessToken)
    
    if (accountInfo) {
      console.log('\n💡 La cuenta actual está funcionando correctamente')
      console.log('¿Quieres cambiar a otra cuenta? (y/n)')
      
      // In a real scenario, you'd want to read from stdin
      // For now, we'll just show instructions
      console.log('\n📝 Para cambiar la cuenta:')
      console.log('1. Ve a https://www.mercadopago.com.ar/developers')
      console.log('2. Inicia sesión con la cuenta que recibirá los pagos')
      console.log('3. Crea una nueva aplicación o usa una existente')
      console.log('4. Copia las credenciales y actualiza .env.local')
    }
  } else {
    console.log('❌ No hay configuración actual')
    console.log('\n📝 Para configurar Mercado Pago:')
    console.log('1. Ve a https://www.mercadopago.com.ar/developers')
    console.log('2. Inicia sesión con la cuenta que recibirá los pagos')
    console.log('3. Crea una nueva aplicación')
    console.log('4. Copia las credenciales en .env.local:')
    console.log('   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...')
    console.log('   NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-...')
  }
  
  console.log('\n🎯 Pasos para cambiar la cuenta:')
  console.log('1. Ve a MercadoPago Developers')
  console.log('2. Inicia sesión con la cuenta correcta')
  console.log('3. Crea/usa una aplicación')
  console.log('4. Copia las credenciales')
  console.log('5. Actualiza .env.local')
  console.log('6. Ejecuta: npm run test:mercadopago')
}

main().catch(console.error) 