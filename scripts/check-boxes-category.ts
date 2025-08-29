import { createClient } from '@supabase/supabase-js'

async function checkBoxesCategory() {
  console.log('🔍 Checking boxes category in production database...')
  
  try {
    // Usar la base de datos de producción
    const supabase = createClient(
      'https://vyiyvaqbyaywcysctcuv.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5aXl2YXFieWF5d2N5c2N0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2OTExNDUsImV4cCI6MjA2MTI2NzE0NX0.nC1-nUCl7lpPZi4uwwotrRRuTKhc_LirTSMd_xnwjc8'
    )
    
    // Buscar productos que contengan "box" en el nombre
    const { data: boxProducts, error: boxError } = await supabase
      .from('products')
      .select('*')
      .ilike('name', '%box%')
      .eq('is_visible', true)
    
    console.log('🔍 Box products by name:', { data: boxProducts, error: boxError, count: boxProducts?.length })
    
    if (boxProducts) {
      boxProducts.forEach(product => {
        console.log(`  - ${product.name} | Category: "${product.category}" | Visible: ${product.is_visible}`)
      })
    }
    
    // También buscar por categoría "boxes"
    const { data: categoryProducts, error: categoryError } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'boxes')
      .eq('is_visible', true)
    
    console.log('🔍 Products with category "boxes":', { data: categoryProducts, error: categoryError, count: categoryProducts?.length })
    
    if (categoryProducts) {
      categoryProducts.forEach(product => {
        console.log(`  - ${product.name} | Category: "${product.category}" | Visible: ${product.is_visible}`)
      })
    }
    
    // Buscar por categoría "Boxes" (con mayúscula)
    const { data: categoryBoxesProducts, error: categoryBoxesError } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'Boxes')
      .eq('is_visible', true)
    
    console.log('🔍 Products with category "Boxes":', { data: categoryBoxesProducts, error: categoryBoxesError, count: categoryBoxesProducts?.length })
    
    if (categoryBoxesProducts) {
      categoryBoxesProducts.forEach(product => {
        console.log(`  - ${product.name} | Category: "${product.category}" | Visible: ${product.is_visible}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

checkBoxesCategory()
