import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.API_KEY! // Service role key

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  console.log('🔗 URL:', supabaseUrl)
  console.log('🔑 Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT FOUND')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or key')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test basic connection
    console.log('\n📡 Testing basic connection...')
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.log('⚠️  Auth warning (expected for service role):', authError.message)
    } else {
      console.log('✅ Basic connection successful')
    }

    // Check if products table exists and has data
    console.log('\n📊 Checking products table...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, price, stock')
      .limit(5)

    if (productsError) {
      console.error('❌ Error fetching products:', productsError)
      console.log('📝 Error details:', {
        message: productsError.message,
        code: productsError.code,
        details: productsError.details,
        hint: productsError.hint
      })
    } else {
      console.log('✅ Products table accessible')
      console.log('📦 Sample products:', products?.length || 0)
      if (products && products.length > 0) {
        console.log('🍷 First few products:')
        products.forEach(p => {
          console.log(`  - ${p.name} (${p.category}) - $${p.price} - Stock: ${p.stock}`)
        })
      } else {
        console.log('⚠️  No products found in the database')
      }
    }

    // Check table structure
    console.log('\n🏗️  Checking table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_schema', { table_name: 'products' })
      .single()

    if (tableError) {
      console.log('⚠️  Could not get table schema:', tableError.message)
    } else {
      console.log('✅ Table schema retrieved')
    }

    // Count total products
    console.log('\n🔢 Counting total products...')
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error counting products:', countError)
    } else {
      console.log(`📊 Total products in database: ${count}`)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testConnection().then(() => {
  console.log('\n🏁 Test completed')
  process.exit(0)
}) 