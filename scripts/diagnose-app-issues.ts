#!/usr/bin/env tsx

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

console.log('🔍 Diagnóstico de Problemas de la Aplicación')
console.log('=' .repeat(50))

console.log('\n📋 PROBLEMAS COMUNES:')
console.log('\n1️⃣ CACHE CORRUPTO:')
console.log('   • Solución: rm -rf .next')
console.log('   • Causa: Archivos de build corruptos')

console.log('\n2️⃣ PUERTOS OCUPADOS:')
console.log('   • Solución: pkill -f "next dev"')
console.log('   • Causa: Procesos anteriores no terminados')

console.log('\n3️⃣ VARIABLES DE ENTORNO:')
console.log('   • Verificar .env.local')
console.log('   • Credenciales de MercadoPago')
console.log('   • URLs de Supabase')

console.log('\n4️⃣ DEPENDENCIAS:')
console.log('   • npm install')
console.log('   • Verificar package.json')

console.log('\n5️⃣ ERRORES DE COMPILACIÓN:')
console.log('   • TypeScript errors')
console.log('   • Import errors')
console.log('   • Syntax errors')

console.log('\n🔧 COMANDOS DE DIAGNÓSTICO:')
console.log('\n📊 Limpiar cache:')
console.log('   rm -rf .next')
console.log('   rm -rf node_modules/.cache')

console.log('\n📊 Matar procesos:')
console.log('   pkill -f "next dev"')
console.log('   pkill -f "node"')

console.log('\n📊 Reinstalar dependencias:')
console.log('   npm install')
console.log('   npm install --legacy-peer-deps')

console.log('\n📊 Verificar build:')
console.log('   npm run build')
console.log('   npm run lint')

console.log('\n📊 Verificar variables:')
console.log('   • MERCADO_PAGO_ACCESS_TOKEN')
console.log('   • NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY')
console.log('   • NEXT_PUBLIC_APP_URL')

console.log('\n🎯 SOLUCIÓN RÁPIDA:')
console.log('\n1️⃣ Limpiar todo:')
console.log('   rm -rf .next')
console.log('   pkill -f "next dev"')

console.log('\n2️⃣ Reinstalar:')
console.log('   npm install')

console.log('\n3️⃣ Iniciar:')
console.log('   npm run dev')

console.log('\n4️⃣ Verificar:')
console.log('   • http://localhost:3000')
console.log('   • http://localhost:3000/checkout')

console.log('\n🚨 SI EL PROBLEMA PERSISTE:')
console.log('\n📞 Verificar logs:')
console.log('   • Consola del navegador')
console.log('   • Terminal del servidor')
console.log('   • Logs de Next.js')

console.log('\n📞 Problemas específicos:')
console.log('   • Error de compilación')
console.log('   • Error de runtime')
console.log('   • Error de importación')

console.log('\n📊 INFORMACIÓN ÚTIL:')
console.log('   • Node.js version')
console.log('   • Next.js version')
console.log('   • TypeScript version')
console.log('   • Sistema operativo')

console.log('\n✅ PREVENCIÓN:')
console.log('   • Limpiar cache regularmente')
console.log('   • Usar Ctrl+C para terminar procesos')
console.log('   • Verificar variables de entorno')
console.log('   • Mantener dependencias actualizadas') 