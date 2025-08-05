#!/usr/bin/env tsx

import { config } from 'dotenv'
import { MercadoPagoConfig } from 'mercadopago'

// Load environment variables
config({ path: '.env.local' })

console.log('🔍 Verificación del Estado de la Cuenta de Vendedor')
console.log('=' .repeat(50))

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

if (!accessToken) {
  console.log('❌ Access Token no configurado')
  process.exit(1)
}

async function checkAccountStatus() {
  try {
    console.log('\n🔧 Configurando MercadoPago...')
    const mercadopago = new MercadoPagoConfig({
      accessToken: accessToken
    })

    console.log('\n📊 Verificando estado de la cuenta...')
    console.log('Access Token:', accessToken.substring(0, 20) + '...')

    // Verificar si es credencial TEST o PROD
    const isTest = accessToken.startsWith('TEST-')
    console.log('\n🎯 TIPO DE CREDENCIALES:')
    console.log(`   ${isTest ? '✅ TEST' : '❌ PRODUCCIÓN'}`)

    if (!isTest) {
      console.log('\n⚠️  ADVERTENCIA:')
      console.log('   Estás usando credenciales de PRODUCCIÓN')
      console.log('   Para pruebas, usa credenciales TEST')
      console.log('   Ve a MercadoPago Developers y crea una aplicación TEST')
    }

    console.log('\n🔍 POSIBLES PROBLEMAS:')
    console.log('\n1️⃣ CUENTA SUSPENDIDA:')
    console.log('   • Ve a https://www.mercadopago.com.ar/developers')
    console.log('   • Inicia sesión con TESTUSER1260189804')
    console.log('   • Verifica si hay suspensiones o límites')

    console.log('\n2️⃣ LÍMITES DE TRANSACCIONES:')
    console.log('   • Las cuentas de prueba tienen límites diarios')
    console.log('   • Si excediste el límite, espera 24 horas')
    console.log('   • O crea una nueva cuenta de prueba')

    console.log('\n3️⃣ CONFIGURACIÓN DE APLICACIÓN:')
    console.log('   • Verifica que la aplicación esté en modo sandbox')
    console.log('   • Confirma que las URLs de redirección sean correctas')
    console.log('   • Revisa la configuración de webhooks')

    console.log('\n4️⃣ PROBLEMAS ESPECÍFICOS:')
    console.log('   • "Una de las partes es de prueba" → Usa tarjetas sin cuenta')
    console.log('   • "Cuenta suspendida" → Espera o crea nueva cuenta')
    console.log('   • "Credenciales inválidas" → Renueva el token')

    console.log('\n💡 RECOMENDACIONES:')
    console.log('\n✅ SI EL PROBLEMA PERSISTE:')
    console.log('   1. Crea una nueva cuenta de prueba')
    console.log('   2. Obtén nuevas credenciales TEST')
    console.log('   3. Actualiza el .env.local')
    console.log('   4. Prueba con tarjetas de prueba')

    console.log('\n✅ ALTERNATIVA: CUENTA REAL')
    console.log('   1. Usa una cuenta real de vendedor')
    console.log('   2. Configura credenciales de producción')
    console.log('   3. Prueba con tarjetas de prueba')

    console.log('\n📞 SOPORTE:')
    console.log('   • https://www.mercadopago.com.ar/developers/es/support')
    console.log('   • Foro de desarrolladores')
    console.log('   • Email: soporte@mercadopago.com')

    console.log('\n📊 INFORMACIÓN PARA DIAGNÓSTICO:')
    console.log(`   • Token: ${accessToken.substring(0, 20)}...`)
    console.log(`   • Tipo: ${isTest ? 'TEST' : 'PRODUCCIÓN'}`)
    console.log('   • Fecha: ' + new Date().toISOString())

  } catch (error: any) {
    console.log('\n❌ ERROR AL VERIFICAR CUENTA:')
    console.log('Error:', error.message)
    
    if (error.response?.data) {
      console.log('\nRespuesta de MercadoPago:')
      console.log(JSON.stringify(error.response.data, null, 2))
    }
  }
}

checkAccountStatus()
  .then(() => {
    console.log('\n✅ Verificación completada')
  })
  .catch((error) => {
    console.log('\n❌ Verificación falló:', error.message)
  }) 