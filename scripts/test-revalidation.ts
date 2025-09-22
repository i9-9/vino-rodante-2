import { config } from 'dotenv'

// Cargar variables de entorno
config({ path: '.env.local' })

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'your-secret-key'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

async function testRevalidation() {
  console.log('🧪 Testing revalidation API...\n')

  const testCases = [
    {
      name: 'Revalidate all products',
      payload: { secret: REVALIDATE_SECRET }
    },
    {
      name: 'Revalidate products tag',
      payload: { secret: REVALIDATE_SECRET, tag: 'products' }
    },
    {
      name: 'Revalidate featured products',
      payload: { secret: REVALIDATE_SECRET, tag: 'featured-products' }
    },
    {
      name: 'Revalidate specific path',
      payload: { secret: REVALIDATE_SECRET, path: '/products' }
    }
  ]

  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.name}`)
    
    try {
      const response = await fetch(`${BASE_URL}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload)
      })

      const result = await response.json()

      if (response.ok) {
        console.log(`✅ Success:`, result)
      } else {
        console.log(`❌ Error:`, result)
      }
    } catch (error) {
      console.log(`❌ Exception:`, error)
    }
    
    console.log('')
  }

  // Test GET endpoint
  console.log('🔍 Testing GET endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/revalidate`)
    const result = await response.json()
    console.log('✅ GET response:', result)
  } catch (error) {
    console.log('❌ GET error:', error)
  }
}

testRevalidation().catch(console.error)
