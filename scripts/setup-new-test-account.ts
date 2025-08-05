#!/usr/bin/env tsx

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

console.log('🆕 Configuración de Nueva Cuenta de Prueba')
console.log('=' .repeat(50))

console.log('\n📋 PASOS PARA NUEVA CUENTA DE PRUEBA:')
console.log('\n1️⃣ CREAR NUEVA CUENTA:')
console.log('   • Ve a https://www.mercadopago.com.ar/developers')
console.log('   • Haz clic en "Crear cuenta"')
console.log('   • Usa un email diferente (ej: test2@example.com)')
console.log('   • Completa el registro')

console.log('\n2️⃣ CONFIGURAR APLICACIÓN:')
console.log('   • Ve a "Mis aplicaciones"')
console.log('   • Haz clic en "Crear aplicación"')
console.log('   • Nombre: "Vino Rodante Test 2"')
console.log('   • Descripción: "Integración de prueba"')

console.log('\n3️⃣ OBTENER CREDENCIALES:')
console.log('   • Ve a la aplicación creada')
console.log('   • Copia el "Access Token" (TEST-...)')
console.log('   • Copia el "Public Key" (TEST-...)')

console.log('\n4️⃣ ACTUALIZAR .env.local:')
console.log('   • Reemplaza MERCADO_PAGO_ACCESS_TOKEN')
console.log('   • Reemplaza NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY')
console.log('   • Guarda el archivo')

console.log('\n5️⃣ PROBAR INTEGRACIÓN:')
console.log('   • Ejecuta: npm run test-specific-payment')
console.log('   • Prueba el pago con tarjetas de prueba')

console.log('\n💡 ALTERNATIVA: CUENTA REAL')
console.log('\nSi las cuentas de prueba siguen dando problemas:')
console.log('   • Usa una cuenta real de vendedor')
console.log('   • Configura credenciales de producción')
console.log('   • Prueba con tarjetas de prueba')

console.log('\n🔧 COMANDOS ÚTILES:')
console.log('   npm run setup:mercadopago-account')
console.log('   npm run test-specific-payment')
console.log('   npm run check-account-status')

console.log('\n📞 SOPORTE:')
console.log('   • https://www.mercadopago.com.ar/developers/es/support')
console.log('   • Email: soporte@mercadopago.com')

console.log('\n⚠️  NOTA:')
console.log('   Las cuentas de prueba tienen limitaciones.')
console.log('   Para pruebas confiables, considera una cuenta real.') 