#!/usr/bin/env tsx

import { config } from 'dotenv'
import { MercadoPagoConfig } from 'mercadopago'

// Load environment variables
config({ path: '.env.local' })

console.log('🔍 Diagnóstico Completo de Problemas de Pago')
console.log('=' .repeat(50))

// Check environment variables
console.log('\n📋 VERIFICACIÓN DE VARIABLES DE ENTORNO:')
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
const appUrl = process.env.NEXT_PUBLIC_APP_URL

console.log(`✅ Access Token: ${accessToken ? 'Configurado' : '❌ FALTANTE'}`)
console.log(`✅ Public Key: ${publicKey ? 'Configurado' : '❌ FALTANTE'}`)
console.log(`✅ App URL: ${appUrl ? 'Configurado' : '❌ FALTANTE'}`)

if (!accessToken || !publicKey || !appUrl) {
  console.log('\n❌ PROBLEMA: Variables de entorno faltantes')
  console.log('   Ejecuta: npm run setup:mercadopago-account')
  process.exit(1)
}

// Test MercadoPago connection
console.log('\n🔗 VERIFICACIÓN DE CONEXIÓN CON MERCADO PAGO:')
try {
  const mercadopago = new MercadoPagoConfig({
    accessToken: accessToken
  })
  console.log('✅ Conexión con MercadoPago establecida')
} catch (error) {
  console.log('❌ Error de conexión:', error)
  process.exit(1)
}

console.log('\n🎯 POSIBLES CAUSAS DEL PROBLEMA:')
console.log('\n1️⃣ CONFIGURACIÓN DE CUENTA:')
console.log('   • ¿La cuenta de vendedor está activa?')
console.log('   • ¿Las credenciales son TEST (no PROD)?')
console.log('   • ¿El token no ha expirado?')

console.log('\n2️⃣ CONFIGURACIÓN DE APLICACIÓN:')
console.log('   • ¿La aplicación está en modo sandbox?')
console.log('   • ¿Los webhooks están configurados?')
console.log('   • ¿Las URLs de redirección son correctas?')

console.log('\n3️⃣ CONFIGURACIÓN DE PAGOS:')
console.log('   • ¿Los métodos de pago están habilitados?')
console.log('   • ¿Las tarjetas de prueba son válidas?')
console.log('   • ¿El monto es válido?')

console.log('\n4️⃣ PROBLEMAS ESPECÍFICOS:')
console.log('   • "Cuenta suspendida" → Límite de transacciones')
console.log('   • "Credenciales inválidas" → Token incorrecto')
console.log('   • "Tarjeta rechazada" → Tarjeta no válida')
console.log('   • "Error de redirección" → URLs incorrectas')

console.log('\n🔧 COMANDOS DE DIAGNÓSTICO:')
console.log('\n📊 Verificar configuración:')
console.log('   npm run setup:mercadopago-account')
console.log('   npm run test:mercadopago')

console.log('\n🌐 Verificar aplicación:')
console.log('   • Ve a https://www.mercadopago.com.ar/developers')
console.log('   • Inicia sesión con TESTUSER1260189804')
console.log('   • Verifica el estado de la aplicación')

console.log('\n💳 Verificar tarjetas:')
console.log('   • VISA: 4509 9535 6623 3704 (CVV: 123)')
console.log('   • MASTERCARD: 5031 4332 1540 6351 (CVV: 123)')
console.log('   • AMEX: 3711 8030 3257 522 (CVV: 1234)')

console.log('\n📝 PASOS DE VERIFICACIÓN:')
console.log('\n1️⃣ Verifica el estado de la cuenta:')
console.log('   • Ve a MercadoPago Developers')
console.log('   • Confirma que la cuenta está activa')
console.log('   • Verifica que no hay suspensiones')

console.log('\n2️⃣ Verifica las credenciales:')
console.log('   • Confirma que usas credenciales TEST')
console.log('   • Verifica que el token no haya expirado')
console.log('   • Prueba la conexión con la API')

console.log('\n3️⃣ Verifica la aplicación:')
console.log('   • Confirma que está en modo sandbox')
console.log('   • Verifica las URLs de redirección')
console.log('   • Revisa la configuración de webhooks')

console.log('\n4️⃣ Verifica el flujo:')
console.log('   • Usa las tarjetas exactas de arriba')
console.log('   • NO inicies sesión como comprador')
console.log('   • Usa montos pequeños (ej: $100)')

console.log('\n🚨 SI EL PROBLEMA PERSISTE:')
console.log('\n📞 Contacta soporte:')
console.log('   • https://www.mercadopago.com.ar/developers/es/support')
console.log('   • Foro de desarrolladores')
console.log('   • Email de soporte')

console.log('\n🔄 Alternativas:')
console.log('   • Usa una cuenta real de vendedor')
console.log('   • Prueba con diferentes tarjetas')
console.log('   • Verifica logs de error específicos')

console.log('\n📊 INFORMACIÓN PARA SOPORTE:')
console.log(`   • Access Token: ${accessToken?.substring(0, 10)}...`)
console.log(`   • Public Key: ${publicKey?.substring(0, 10)}...`)
console.log(`   • App URL: ${appUrl}`)
console.log('   • Fecha: ' + new Date().toISOString()) 