#!/usr/bin/env tsx

/**
 * Script de verificación de salud para producción
 * Verifica que todos los sistemas críticos estén operativos
 */

import { config } from 'dotenv'

// Cargar variables de entorno
config({ path: '.env.local' })

interface HealthCheck {
  name: string
  status: 'OK' | 'ERROR' | 'WARNING'
  message: string
}

async function runHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []

  console.log('🏥 Iniciando verificación de salud para producción...\n')

  // 1. Verificar variables de entorno críticas
  console.log('📋 Verificando variables de entorno...')
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'MERCADO_PAGO_ACCESS_TOKEN': process.env.MERCADO_PAGO_ACCESS_TOKEN,
    'NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY': process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY,
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
  }

  for (const [key, value] of Object.entries(envVars)) {
    if (!value) {
      checks.push({
        name: `Environment Variable: ${key}`,
        status: 'ERROR',
        message: 'Variable not set'
      })
    } else {
      checks.push({
        name: `Environment Variable: ${key}`,
        status: 'OK',
        message: 'Configured'
      })
    }
  }

  // 2. Verificar configuración de MercadoPago
  console.log('💳 Verificando configuración de MercadoPago...')
  const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (mpToken) {
    if (mpToken.startsWith('PROD-')) {
      checks.push({
        name: 'MercadoPago Environment',
        status: 'OK',
        message: 'Configurado para PRODUCCIÓN'
      })
    } else if (mpToken.startsWith('TEST-')) {
      checks.push({
        name: 'MercadoPago Environment',
        status: 'WARNING',
        message: 'Configurado para SANDBOX (cambiar a PROD para producción)'
      })
    } else {
      checks.push({
        name: 'MercadoPago Environment',
        status: 'ERROR',
        message: 'Token format unknown'
      })
    }
  }

  // 3. Verificar URLs de producción
  console.log('🌐 Verificando URLs...')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    if (appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
      checks.push({
        name: 'App URL Configuration',
        status: 'WARNING',
        message: 'Using localhost (change to production domain)'
      })
    } else if (appUrl.startsWith('https://')) {
      checks.push({
        name: 'App URL Configuration',
        status: 'OK',
        message: 'Production HTTPS URL configured'
      })
    } else {
      checks.push({
        name: 'App URL Configuration',
        status: 'WARNING',
        message: 'Not using HTTPS'
      })
    }
  }

  // 4. Verificar configuración de Node
  console.log('⚙️ Verificando configuración de Node...')
  if (process.env.NODE_ENV === 'production') {
    checks.push({
      name: 'Node Environment',
      status: 'OK',
      message: 'Production mode'
    })
  } else {
    checks.push({
      name: 'Node Environment',
      status: 'WARNING',
      message: `Current: ${process.env.NODE_ENV || 'development'} (should be 'production')`
    })
  }

  return checks
}

async function main() {
  try {
    const checks = await runHealthChecks()
    
    console.log('\n📊 Reporte de Salud:\n')
    
    let okCount = 0
    let warningCount = 0
    let errorCount = 0
    
    checks.forEach(check => {
      const icon = check.status === 'OK' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌'
      console.log(`${icon} ${check.name}: ${check.message}`)
      
      if (check.status === 'OK') okCount++
      else if (check.status === 'WARNING') warningCount++
      else errorCount++
    })
    
    console.log('\n📈 Resumen:')
    console.log(`✅ OK: ${okCount}`)
    console.log(`⚠️ Warnings: ${warningCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    
    if (errorCount > 0) {
      console.log('\n🚨 HAY ERRORES CRÍTICOS - No lanzar a producción hasta resolverlos')
      process.exit(1)
    } else if (warningCount > 0) {
      console.log('\n⚠️ Hay warnings - Revisar antes del lanzamiento')
    } else {
      console.log('\n🎉 ¡Todos los checks pasaron! Listo para producción')
    }
    
  } catch (error) {
    console.error('💥 Error durante health check:', error)
    process.exit(1)
  }
}

main()

