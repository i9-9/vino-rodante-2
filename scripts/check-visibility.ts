import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.API_KEY!

async function checkVisibility() {
  console.log('🔍 Checking product visibility...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Check the structure and values of is_visible field
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, is_visible')
    .limit(10)
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log('📊 Products with visibility status:')
  products?.forEach(p => {
    console.log(`  - ${p.name}: is_visible = ${p.is_visible} (${typeof p.is_visible})`)
  })
  
  // Count visible vs non-visible
  const { data: visibleCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_visible', true)
    
  const { data: notVisibleCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_visible', false)
    
  const { data: nullVisibleCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .is('is_visible', null)
  
  console.log('\n📈 Visibility Statistics:')
  console.log(`  - Visible (true): ${visibleCount}`)
  console.log(`  - Not visible (false): ${notVisibleCount}`)  
  console.log(`  - Null visibility: ${nullVisibleCount}`)
  
  // Test the actual query used in getProducts
  console.log('\n🧪 Testing getProducts query...')
  const { data: testData, error: testError } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(5)
    
  if (testError) {
    console.error('❌ getProducts query failed:', testError)
  } else {
    console.log(`✅ getProducts query returned ${testData?.length || 0} products`)
    testData?.forEach(p => {
      console.log(`  - ${p.name} (${p.category})`)
    })
  }
}

checkVisibility().then(() => {
  console.log('\n🏁 Check completed')
  process.exit(0)
}) 