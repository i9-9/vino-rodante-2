#!/usr/bin/env tsx

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

console.log('🍷 Obtención de Credenciales de Cuenta de Prueba')
console.log('=' .repeat(50))

console.log('\n📋 CUENTA DE VENDEDOR DE PRUEBA:')
console.log('   • Usuario: TESTUSER1260189804')
console.log('   • Contraseña: miccg1r3jv')
console.log('   • Email: vino@vinorodante.com')

console.log('\n📝 PASOS PARA OBTENER LAS CREDENCIALES:')
console.log('\n1️⃣ Accede a la cuenta de prueba:')
console.log('   • Ve a: https://www.mercadopago.com.ar/developers')
console.log('   • Inicia sesión con:')
console.log('     - Usuario: TESTUSER1260189804')
console.log('     - Contraseña: miccg1r3jv')

console.log('\n2️⃣ Crea una aplicación:')
console.log('   • Haz clic en "Crear aplicación"')
console.log('   • Nombre: "Vino Rodante - Test"')
console.log('   • Tipo: E-commerce')

console.log('\n3️⃣ Obtén las credenciales:')
console.log('   • Ve a la pestaña "Credenciales"')
console.log('   • Copia las credenciales de TEST:')
console.log('     - Access Token: TEST-...')
console.log('     - Public Key: TEST-...')

console.log('\n4️⃣ Actualiza .env.local:')
console.log('   • Reemplaza las credenciales actuales con las nuevas')
console.log('   • MERCADO_PAGO_ACCESS_TOKEN=TEST-nuevo_token')
console.log('   • NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-nueva_public_key')

console.log('\n5️⃣ Verifica la configuración:')
console.log('   • npm run test:mercadopago')

console.log('\n⚠️  IMPORTANTE:')
console.log('   • Usa las credenciales de TEST (no PROD)')
console.log('   • Esta cuenta es solo para pruebas')
console.log('   • Los pagos de prueba son ficticios')

console.log('\n🔗 Enlaces útiles:')
console.log('   • MercadoPago Developers: https://www.mercadopago.com.ar/developers')
console.log('   • Documentación: https://www.mercadopago.com.ar/developers/es/docs') 