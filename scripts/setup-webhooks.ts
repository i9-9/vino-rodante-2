#!/usr/bin/env tsx

import { config } from 'dotenv'
import { execSync } from 'child_process'

// Load environment variables
config({ path: '.env.local' })

console.log('🌐 Configurando webhooks para MercadoPago...\n')

// Check if ngrok is installed
try {
  execSync('ngrok --version', { stdio: 'ignore' })
  console.log('✅ ngrok está instalado')
} catch (error) {
  console.log('❌ ngrok no está instalado')
  console.log('Instalando ngrok...')
  try {
    execSync('npm install -g ngrok', { stdio: 'inherit' })
    console.log('✅ ngrok instalado correctamente')
  } catch (installError) {
    console.log('❌ Error al instalar ngrok')
    console.log('Instala ngrok manualmente: https://ngrok.com/download')
    process.exit(1)
  }
}

// Start ngrok
console.log('\n🚀 Iniciando ngrok...')
console.log('Esto creará un túnel público para tu servidor local')
console.log('Presiona Ctrl+C para detener ngrok')

try {
  execSync('ngrok http 3000', { stdio: 'inherit' })
} catch (error) {
  console.log('\n✅ ngrok detenido')
}

console.log('\n📝 Instrucciones para configurar webhooks:')
console.log('1. Copia la URL de ngrok (ej: https://abc123.ngrok.io)')
console.log('2. Ve a MercadoPago Developers')
console.log('3. En tu aplicación, ve a "Notificaciones"')
console.log('4. Agrega la URL: https://abc123.ngrok.io/api/webhooks/mercadopago')
console.log('5. Guarda la configuración')
console.log('\n💡 Ahora los webhooks funcionarán en desarrollo local') 