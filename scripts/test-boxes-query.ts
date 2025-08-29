import { createClient } from '@/utils/supabase/client'

async function testBoxesQuery() {
  console.log('🔍 Testing boxes query...')
  
  try {
    const supabase = createClient()
    
    // Query directa a la base de datos
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'boxes')
      .eq('is_visible', true)
    
    console.log('🔍 Direct query result:', { data, error, count: data?.length })
    
    if (error) {
      console.error('❌ Error:', error)
    } else {
      console.log('✅ Success! Found', data?.length, 'boxes products')
      data?.forEach(product => {
        console.log(`  - ${product.name} (${product.category}) - Visible: ${product.is_visible}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

testBoxesQuery()
