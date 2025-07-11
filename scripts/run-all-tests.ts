import { spawn } from 'child_process'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  output: string
  error?: string
}

function runScript(scriptPath: string): Promise<TestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    let output = ''
    let errorOutput = ''

    const child = spawn('npx', ['tsx', scriptPath], {
      cwd: process.cwd(),
      env: process.env
    })

    child.stdout.on('data', (data) => {
      const text = data.toString()
      output += text
      process.stdout.write(text) // Mostrar output en tiempo real
    })

    child.stderr.on('data', (data) => {
      const text = data.toString()
      errorOutput += text
      process.stderr.write(text) // Mostrar errores en tiempo real
    })

    child.on('close', (code) => {
      const duration = Date.now() - startTime
      const status = code === 0 ? 'passed' : 'failed'
      
      resolve({
        name: scriptPath,
        status,
        duration,
        output,
        error: errorOutput || undefined
      })
    })

    child.on('error', (error) => {
      const duration = Date.now() - startTime
      resolve({
        name: scriptPath,
        status: 'failed',
        duration,
        output,
        error: error.message
      })
    })
  })
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive CRUD testing suite...\n')
  console.log('=' .repeat(60))
  
  const tests = [
    'scripts/check-storage-buckets.ts',
    'scripts/test-subscription-plans-crud.ts',
    'scripts/test-server-actions.ts',
    'scripts/test-all-cruds.ts'
  ]

  const results: TestResult[] = []
  let totalPassed = 0
  let totalFailed = 0

  for (const test of tests) {
    console.log(`\n📋 Running: ${test}`)
    console.log('-'.repeat(40))
    
    const result = await runScript(test)
    results.push(result)

    if (result.status === 'passed') {
      totalPassed++
      console.log(`\n✅ ${test} - PASSED (${result.duration}ms)`)
    } else {
      totalFailed++
      console.log(`\n❌ ${test} - FAILED (${result.duration}ms)`)
      if (result.error) {
        console.log(`Error: ${result.error}`)
      }
    }
  }

  // Reporte final
  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL TEST REPORT')
  console.log('='.repeat(60))
  
  results.forEach((result, index) => {
    const icon = result.status === 'passed' ? '✅' : '❌'
    const duration = `${result.duration}ms`
    console.log(`${icon} ${result.name.padEnd(40)} ${duration.padStart(8)}`)
  })

  console.log('-'.repeat(60))
  console.log(`✅ Passed: ${totalPassed}`)
  console.log(`❌ Failed: ${totalFailed}`)
  console.log(`📊 Total:  ${results.length}`)
  
  const successRate = Math.round((totalPassed / results.length) * 100)
  console.log(`🎯 Success Rate: ${successRate}%`)

  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! Your CRUD is working perfectly!')
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.')
  }

  // Devolver código de salida apropiado
  process.exit(totalFailed === 0 ? 0 : 1)
}

// Verificar variables de entorno antes de ejecutar
function checkEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(varName => console.error(`   - ${varName}`))
    console.error('\nPlease check your .env.local file.')
    process.exit(1)
  }

  console.log('✅ Environment variables check passed')
}

// Ejecutar
checkEnvironment()
runAllTests() 