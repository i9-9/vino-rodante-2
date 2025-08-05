#!/usr/bin/env tsx

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

console.log('🚀 Configuración de Cuenta de Producción')
console.log('=' .repeat(50))

console.log('\n✅ VENTAJAS DE USAR PRODUCCIÓN:')
console.log('   • Sin límites de transacciones')
console.log('   • Más estable y confiable')
console.log('   • Funciona con tarjetas de prueba')
console.log('   • Webhooks funcionan correctamente')
console.log('   • Sin suspensiones temporales')

console.log('\n⚠️  CONSIDERACIONES IMPORTANTES:')
console.log('   • Los pagos reales se procesarán')
console.log('   • Usa solo tarjetas de prueba para testing')
console.log('   • Mantén el modo sandbox en desarrollo')
console.log('   • Configura webhooks correctamente')

console.log('\n📋 PASOS PARA CONFIGURAR PRODUCCIÓN:')
console.log('\n1️⃣ CREAR CUENTA REAL:')
console.log('   • Ve a https://www.mercadopago.com.ar/developers')
console.log('   • Crea una cuenta real (no de prueba)')
console.log('   • Usa vino@vinorodante.com')
console.log('   • Completa la verificación de identidad')

console.log('\n2️⃣ CONFIGURAR APLICACIÓN:')
console.log('   • Ve a "Mis aplicaciones"')
console.log('   • Crea una nueva aplicación')
console.log('   • Nombre: "Vino Rodante"')
console.log('   • Descripción: "E-commerce de vinos"')

console.log('\n3️⃣ OBTENER CREDENCIALES:')
console.log('   • Copia el "Access Token" (APP-...)')
console.log('   • Copia el "Public Key" (APP-...)')
console.log('   • NO uses credenciales TEST')

console.log('\n4️⃣ ACTUALIZAR .env.local:')
console.log('   MERCADO_PAGO_ACCESS_TOKEN=APP-...')
console.log('   NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP-...')
console.log('   NEXT_PUBLIC_APP_URL=http://localhost:3000')

console.log('\n5️⃣ CONFIGURAR WEBHOOKS:')
console.log('   • URL: http://localhost:3000/api/webhooks/mercadopago')
console.log('   • Eventos: payment, payment.updated')
console.log('   • Método: POST')

console.log('\n6️⃣ PROBAR INTEGRACIÓN:')
console.log('   • Ejecuta: npm run test-specific-payment')
console.log('   • Usa tarjetas de prueba para testing')
console.log('   • Verifica que los webhooks funcionen')

console.log('\n💳 TARJETAS DE PRUEBA PARA PRODUCCIÓN:')
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

console.log('\n🔧 COMANDOS DE VERIFICACIÓN:')
console.log('   npm run test-specific-payment')
console.log('   npm run check-account-status')
console.log('   npm run debug-payment-issues')

console.log('\n🚨 IMPORTANTE:')
console.log('   • Solo usa tarjetas de prueba para testing')
console.log('   • No proceses pagos reales en desarrollo')
console.log('   • Configura correctamente los webhooks')
console.log('   • Mantén las credenciales seguras')

console.log('\n📞 SOPORTE:')
console.log('   • https://www.mercadopago.com.ar/developers/es/support')
console.log('   • Email: soporte@mercadopago.com')

console.log('\n✅ CONCLUSIÓN:')
console.log('   Usar producción es la mejor opción para')
console.log('   terminar la integración de manera confiable.') 