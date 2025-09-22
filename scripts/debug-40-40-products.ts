import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function debug4040Products() {
  console.log('🔍 Debugging 40/40 products...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Buscar productos que contengan "40" en el nombre
  const { data: products, error: searchError } = await supabase
    .from('products')
    .select('id, name, slug, is_visible')
    .or('name.ilike.%40%,name.ilike.%cuarenta%')
    .order('name')
  
  if (searchError) {
    console.error('❌ Error searching products:', searchError)
    return
  }
  
  console.log(`📊 Found ${products?.length || 0} products with "40" in name:`)
  console.log('')
  
  products?.forEach((product, index) => {
    console.log(`${index + 1}. Name: "${product.name}"`)
    console.log(`   Slug: "${product.slug}"`)
    console.log(`   Visible: ${product.is_visible}`)
    console.log('')
  })
  
  // Probar las variaciones que usa el catch-all
  console.log('🧪 Testing catch-all variations for "40-40-malbec":')
  const testSlug = '40-40-malbec'
  const variations = [
    testSlug, // '40-40-malbec'
    testSlug.replace(/-/g, ''), // '4040malbec'
    testSlug.replace(/-/g, '_'), // '40_40_malbec'
    testSlug.replace(/-/g, '').toLowerCase(), // '4040malbec'
  ]
  
  for (const variation of variations) {
    console.log(`\n🔍 Testing variation: "${variation}"`)
    
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, slug, is_visible')
      .eq('slug', variation)
      .eq('is_visible', true)
      .single()
    
    if (product && !error) {
      console.log(`✅ Found product: "${product.name}" (slug: "${product.slug}")`)
    } else {
      console.log(`❌ No product found with slug: "${variation}"`)
      if (error) {
        console.log(`   Error: ${error.message}`)
      }
    }
  }
  
  // También buscar por nombre que contenga "malbec" y "40"
  console.log('\n🔍 Searching for products with "malbec" and "40":')
  const { data: malbecProducts, error: malbecError } = await supabase
    .from('products')
    .select('id, name, slug, is_visible')
    .and('name.ilike.%malbec%,name.ilike.%40%')
    .order('name')
  
  if (malbecError) {
    console.error('❌ Error searching malbec products:', malbecError)
  } else {
    console.log(`📊 Found ${malbecProducts?.length || 0} products with "malbec" and "40":`)
    malbecProducts?.forEach((product, index) => {
      console.log(`${index + 1}. Name: "${product.name}"`)
      console.log(`   Slug: "${product.slug}"`)
      console.log(`   Visible: ${product.is_visible}`)
      console.log('')
    })
  }
}

debug4040Products().catch(console.error)
