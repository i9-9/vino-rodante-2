import { createClient } from '@supabase/supabase-js'

async function testBoxesDirect() {
  console.log('🔍 Testing boxes query directly...')
  
  try {
    // Usar la base de datos local
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    )
    
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

testBoxesDirect()
