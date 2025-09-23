#!/usr/bin/env tsx

import { MercadoPagoConfig } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkMercadoPagoAccount() {
  console.log('🔍 Checking MercadoPago account configuration...\n')

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT FOUND')

  if (!accessToken) {
    console.error('❌ No access token found')
    return
  }

  try {
    const mp = new MercadoPagoConfig({
      accessToken: accessToken,
    })

    console.log('✅ MercadoPago client created successfully')
    
    // Verificar el tipo de cuenta
    if (accessToken.startsWith('TEST-')) {
      console.log('🧪 Account Type: TEST (Sandbox)')
    } else if (accessToken.startsWith('APP_USR-')) {
      console.log('🏪 Account Type: PRODUCTION (Argentina)')
    } else if (accessToken.startsWith('APP-')) {
      console.log('🏪 Account Type: PRODUCTION (Other country)')
    } else {
      console.log('❓ Account Type: Unknown')
    }

    // Verificar configuración de país
    console.log('\n🌍 Country Configuration:')
    console.log('  - Token prefix suggests: Argentina (APP_USR-)')
    console.log('  - Currency: ARS (Pesos Argentinos)')
    console.log('  - Site ID: MLA (MercadoLibre Argentina)')

    console.log('\n💡 Possible solutions for "Cannot operate between different countries":')
    console.log('  1. Verify your MercadoPago account is registered in Argentina')
    console.log('  2. Check if the customer email domain is from Argentina')
    console.log('  3. Ensure site_id is set to "MLA" for Argentina')
    console.log('  4. Verify currency_id is "ARS"')

  } catch (error) {
    console.error('❌ Error checking account:', error)
  }
}

checkMercadoPagoAccount().catch(console.error)
