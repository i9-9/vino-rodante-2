import { getApiUrl, getAppUrl, getAppBaseUrl } from '../lib/url-utils'

console.log('🧪 Testing URL flexibility...\n')

// Simular diferentes entornos
const originalEnv = { ...process.env }

console.log('🔍 Testing with different environment configurations:\n')

// Test 1: Puerto 3001 por defecto
console.log('1. Default development (port 3001):')
process.env.NODE_ENV = 'development'
process.env.PORT = '3001'
delete process.env.NEXT_PUBLIC_SITE_URL
delete process.env.VERCEL_URL

console.log(`   getAppBaseUrl(): ${getAppBaseUrl()}`)
console.log(`   getApiUrl('/api/discounts/active'): ${getApiUrl('/api/discounts/active')}`)
console.log(`   getAppUrl('/products/40-40-malbec'): ${getAppUrl('/products/40-40-malbec')}`)

// Test 2: Puerto 3000
console.log('\n2. Development with port 3000:')
process.env.PORT = '3000'

console.log(`   getAppBaseUrl(): ${getAppBaseUrl()}`)
console.log(`   getApiUrl('/api/discounts/active'): ${getApiUrl('/api/discounts/active')}`)
console.log(`   getAppUrl('/products/40-40-malbec'): ${getAppUrl('/products/40-40-malbec')}`)

// Test 3: Puerto 3002
console.log('\n3. Development with port 3002:')
process.env.PORT = '3002'

console.log(`   getAppBaseUrl(): ${getAppBaseUrl()}`)
console.log(`   getApiUrl('/api/discounts/active'): ${getApiUrl('/api/discounts/active')}`)
console.log(`   getAppUrl('/products/40-40-malbec'): ${getAppUrl('/products/40-40-malbec')}`)

// Test 4: Con NEXT_PUBLIC_SITE_URL definida
console.log('\n4. With NEXT_PUBLIC_SITE_URL defined:')
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

console.log(`   getAppBaseUrl(): ${getAppBaseUrl()}`)
console.log(`   getApiUrl('/api/discounts/active'): ${getApiUrl('/api/discounts/active')}`)
console.log(`   getAppUrl('/products/40-40-malbec'): ${getAppUrl('/products/40-40-malbec')}`)

// Test 5: Con VERCEL_URL (producción)
console.log('\n5. Production with VERCEL_URL:')
process.env.NODE_ENV = 'production'
process.env.VERCEL_URL = 'vinorodante-git-main-ivan.vercel.app'
delete process.env.NEXT_PUBLIC_SITE_URL

console.log(`   getAppBaseUrl(): ${getAppBaseUrl()}`)
console.log(`   getApiUrl('/api/discounts/active'): ${getApiUrl('/api/discounts/active')}`)
console.log(`   getAppUrl('/products/40-40-malbec'): ${getAppUrl('/products/40-40-malbec')}`)

// Test 6: Producción sin VERCEL_URL
console.log('\n6. Production without VERCEL_URL:')
delete process.env.VERCEL_URL

console.log(`   getAppBaseUrl(): ${getAppBaseUrl()}`)
console.log(`   getApiUrl('/api/discounts/active'): ${getApiUrl('/api/discounts/active')}`)
console.log(`   getAppUrl('/products/40-40-malbec'): ${getAppUrl('/products/40-40-malbec')}`)

// Restaurar variables de entorno originales
process.env = originalEnv

console.log('\n✅ URL flexibility testing completed!')
