import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function checkProducts() {
  console.log('🔍 Checking all products in database...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Get all products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, is_visible')
    .order('name')
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log(`📊 Found ${products?.length || 0} products:`)
  products?.forEach(p => {
    console.log(`  - ${p.name} (slug: ${p.slug}, visible: ${p.is_visible})`)
  })
  
  // Check specifically for 40/40 products
  console.log('\n🔍 Checking for 40/40 products...')
  const fortyProducts = products?.filter(p => p.name.includes('40/40'))
  
  if (fortyProducts && fortyProducts.length > 0) {
    console.log('✅ Found 40/40 products:')
    fortyProducts.forEach(p => {
      console.log(`  - ${p.name} (slug: ${p.slug})`)
    })
  } else {
    console.log('❌ No 40/40 products found')
  }
  
  // Check for products with 'malbec' in name or slug
  console.log('\n🔍 Checking for Malbec products...')
  const malbecProducts = products?.filter(p => 
    p.name.toLowerCase().includes('malbec') || 
    p.slug.toLowerCase().includes('malbec')
  )
  
  if (malbecProducts && malbecProducts.length > 0) {
    console.log('✅ Found Malbec products:')
    malbecProducts.forEach(p => {
      console.log(`  - ${p.name} (slug: ${p.slug})`)
    })
  } else {
    console.log('❌ No Malbec products found')
  }
}

checkProducts().catch(console.error)

