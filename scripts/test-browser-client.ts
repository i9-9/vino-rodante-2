import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testBrowserClient() {
  console.log('🔍 Testing browser client...')
  console.log('🔗 URL:', supabaseUrl)
  console.log('🔑 Anon Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT FOUND')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or anon key')
    return
  }

  // Use the same client creation as the app
  const supabase = createBrowserClient(supabaseUrl, supabaseKey)

  try {
    console.log('\n📊 Testing products query (same as getProducts)...')
    
    // Test the exact same query as getProducts
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    console.log('🔍 Browser client result:', { 
      dataLength: data?.length, 
      error: error?.message || error,
      firstProducts: data?.slice(0, 3).map(p => ({ 
        name: p.name, 
        category: p.category,
        is_visible: p.is_visible 
      }))
    })

    if (error) {
      console.error('❌ Browser client error:', error)
    } else {
      console.log(`✅ Browser client returned ${data?.length || 0} products`)
    }

  } catch (error) {
    console.error('💥 Exception in browser client test:', error)
  }
}

testBrowserClient().then(() => {
  console.log('\n🏁 Browser client test completed')
  process.exit(0)
}) 