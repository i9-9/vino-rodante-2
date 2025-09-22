import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Cargar variables de entorno
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

async function testProductUrls() {
  console.log('🧪 Testing product URLs...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // URLs a probar
  const testUrls = [
    '40-40-malbec',
    '40-40-chardonnay', 
    '40-40-cabernet-sauvignon',
    '40-40-cabernet-franc',
    '40-40-blend',
    'la-espera-malbec-syrah-joven'
  ]
  
  console.log('🔍 Testing direct slug access:')
  for (const slug of testUrls) {
    console.log(`\nTesting: /products/${slug}`)
    
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, slug, is_visible')
      .eq('slug', slug)
      .eq('is_visible', true)
      .single()
    
    if (product && !error) {
      console.log(`✅ Found: "${product.name}" (slug: "${product.slug}")`)
    } else {
      console.log(`❌ Not found: ${slug}`)
      if (error) {
        console.log(`   Error: ${error.message}`)
      }
    }
  }
  
  // Probar URLs con slashes (que deberían ser manejadas por el catch-all)
  console.log('\n🔍 Testing catch-all URLs (with slashes):')
  const catchAllUrls = [
    ['40', '40-malbec'],
    ['40', '40-chardonnay'],
    ['40', '40-cabernet-sauvignon'],
    ['40', '40-cabernet-franc'],
    ['40', '40-blend']
  ]
  
  for (const segments of catchAllUrls) {
    const expectedSlug = segments.join('-')
    console.log(`\nTesting: /products/${segments.join('/')} (should redirect to ${expectedSlug})`)
    
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, slug, is_visible')
      .eq('slug', expectedSlug)
      .eq('is_visible', true)
      .single()
    
    if (product && !error) {
      console.log(`✅ Found: "${product.name}" (slug: "${product.slug}")`)
    } else {
      console.log(`❌ Not found: ${expectedSlug}`)
      if (error) {
        console.log(`   Error: ${error.message}`)
      }
    }
  }
  
  console.log('\n🎉 URL testing completed!')
}

testProductUrls().catch(console.error)
