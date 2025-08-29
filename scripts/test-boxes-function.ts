import { createClient } from '@supabase/supabase-js'

async function testBoxesFunction() {
  console.log('🔍 Testing updated getProductsByCategory function...')
  
  try {
    // Usar la base de datos de producción
    const supabase = createClient(
      'https://vyiyvaqbyaywcysctcuv.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5aXl2YXFieWF5d2N5c2N0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2OTExNDUsImV4cCI6MjA2MTI2NzE0NX0.nC1-nUCl7lpPZi4uwwotrRRuTKhc_LirTSMd_xnwjc8'
    )
    
    // Simular la lógica de getProductsByCategory para 'boxes'
    const searchCategories = ['Boxes', 'boxes']
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('category', searchCategories)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
    
    console.log('🔍 Updated function result:', { data, error, count: data?.length })
    
    if (error) {
      console.error('❌ Error:', error)
    } else {
      console.log('✅ Success! Found', data?.length, 'boxes products')
      data?.forEach(product => {
        console.log(`  - ${product.name} | Category: "${product.category}" | Price: $${product.price}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

testBoxesFunction()
