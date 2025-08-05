#!/usr/bin/env tsx

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

console.log('💳 Guía: Flujo de Pago Correcto con Tarjetas de Prueba')
console.log('=' .repeat(60))

console.log('\n🎯 CONFIGURACIÓN CORRECTA:')
console.log('   ✅ Vendedor: Cuenta de prueba (TESTUSER1260189804)')
console.log('   ❌ Comprador: NO usar cuenta de prueba')
console.log('   ✅ Comprador: Usar tarjetas de prueba directamente')

console.log('\n💳 TARJETAS DE PRUEBA VÁLIDAS:')
console.log('\n🔵 VISA:')
console.log('   Número: 4509 9535 6623 3704')
console.log('   CVV: 123')
console.log('   Fecha: Cualquier fecha futura')

console.log('\n🔴 MASTERCARD:')
console.log('   Número: 5031 4332 1540 6351')
console.log('   CVV: 123')
console.log('   Fecha: Cualquier fecha futura')

console.log('\n🟢 AMEX:')
console.log('   Número: 3711 8030 3257 522')
console.log('   CVV: 1234')
console.log('   Fecha: Cualquier fecha futura')

console.log('\n📋 PASOS PARA PROBAR:')
console.log('\n1️⃣ Ve a tu checkout:')
console.log('   http://localhost:3000/checkout')

console.log('\n2️⃣ Completa la información:')
console.log('   • Nombre: Test User')
console.log('   • Email: test@example.com')
console.log('   • Dirección: Cualquier dirección')

console.log('\n3️⃣ En Mercado Pago:')
console.log('   • Selecciona "Tarjeta"')
console.log('   • Usa una de las tarjetas de arriba')
console.log('   • NO inicies sesión con cuenta de comprador')

console.log('\n4️⃣ Resultados esperados:')
console.log('   ✅ Pago aprobado: 4509 9535 6623 3704')
console.log('   ✅ Pago pendiente: 5031 4332 1540 6351')
console.log('   ❌ Pago rechazado: 4000 0000 0000 0002')

console.log('\n⚠️  ERRORES A EVITAR:')
console.log('   ❌ NO uses cuenta de comprador de prueba')
console.log('   ❌ NO inicies sesión en Mercado Pago como comprador')
console.log('   ❌ NO uses cuentas de prueba para pagar')

console.log('\n🔧 COMANDOS DE PRUEBA:')
console.log('   npm run test:mercadopago')
console.log('   npm run dev')

console.log('\n📞 SOPORTE:')
console.log('   Si sigues teniendo problemas:')
console.log('   • Verifica que usas credenciales TEST')
console.log('   • Confirma que no hay cuenta de comprador')
console.log('   • Usa las tarjetas exactas de arriba') 