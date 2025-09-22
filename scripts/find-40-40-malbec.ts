import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function find4040Malbec() {
  console.log('🔍 Searching for 40/40 Malbec products...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Buscar productos que contengan "malbec" (case insensitive)
  const { data: malbecProducts, error: malbecError } = await supabase
    .from('products')
    .select('id, name, slug, is_visible, category, region, year, varietal')
    .ilike('name', '%malbec%')
    .order('name')
  
  if (malbecError) {
    console.error('❌ Error searching malbec products:', malbecError)
    return
  }
  
  console.log(`📊 Found ${malbecProducts?.length || 0} products with "malbec" in name:`)
  console.log('')
  
  malbecProducts?.forEach((product, index) => {
    console.log(`${index + 1}. Name: "${product.name}"`)
    console.log(`   Slug: "${product.slug}"`)
    console.log(`   Visible: ${product.is_visible}`)
    console.log(`   Category: ${product.category}`)
    console.log(`   Region: ${product.region}`)
    console.log(`   Year: ${product.year}`)
    console.log(`   Varietal: ${product.varietal}`)
    console.log('')
  })
  
  // Buscar específicamente productos que podrían ser "40/40"
  console.log('🔍 Searching for products that might be "40/40" variants:')
  const { data: fortyProducts, error: fortyError } = await supabase
    .from('products')
    .select('id, name, slug, is_visible')
    .or('name.ilike.%40%,name.ilike.%cuarenta%')
    .order('name')
  
  if (fortyError) {
    console.error('❌ Error searching 40 products:', fortyError)
  } else {
    console.log(`📊 Found ${fortyProducts?.length || 0} products with "40" in name:`)
    fortyProducts?.forEach((product, index) => {
      console.log(`${index + 1}. Name: "${product.name}"`)
      console.log(`   Slug: "${product.slug}"`)
      console.log(`   Visible: ${product.is_visible}`)
      console.log('')
    })
  }
  
  // Probar búsqueda por slug exacto
  console.log('🔍 Testing exact slug search for "40-40-malbec":')
  const { data: exactProduct, error: exactError } = await supabase
    .from('products')
    .select('id, name, slug, is_visible')
    .eq('slug', '40-40-malbec')
    .single()
  
  if (exactProduct && !exactError) {
    console.log(`✅ Found exact match: "${exactProduct.name}" (slug: "${exactProduct.slug}")`)
  } else {
    console.log(`❌ No exact match found for slug "40-40-malbec"`)
    if (exactError) {
      console.log(`   Error: ${exactError.message}`)
    }
  }
  
  // Buscar por slug que contenga "40" y "malbec"
  console.log('\n🔍 Searching for products with slug containing "40" and "malbec":')
  const { data: slugProducts, error: slugError } = await supabase
    .from('products')
    .select('id, name, slug, is_visible')
    .and('slug.ilike.%40%,slug.ilike.%malbec%')
    .order('slug')
  
  if (slugError) {
    console.error('❌ Error searching slug products:', slugError)
  } else {
    console.log(`📊 Found ${slugProducts?.length || 0} products with "40" and "malbec" in slug:`)
    slugProducts?.forEach((product, index) => {
      console.log(`${index + 1}. Name: "${product.name}"`)
      console.log(`   Slug: "${product.slug}"`)
      console.log(`   Visible: ${product.is_visible}`)
      console.log('')
    })
  }
}

find4040Malbec().catch(console.error)
