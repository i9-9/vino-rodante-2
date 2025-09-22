import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function fixSlugs() {
  console.log('🔧 Fixing 40/40 product slugs...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // First, let's see what 40/40 products exist
  const { data: products, error: searchError } = await supabase
    .from('products')
    .select('id, name, slug')
    .ilike('name', '%40/40%')
  
  if (searchError) {
    console.error('❌ Error searching products:', searchError)
    return
  }
  
  console.log(`📊 Found ${products?.length || 0} 40/40 products:`)
  products?.forEach(p => {
    console.log(`  - ${p.name} (current slug: ${p.slug})`)
  })
  
  if (!products || products.length === 0) {
    console.log('❌ No 40/40 products found. Let me check all products...')
    
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, name, slug')
      .limit(20)
    
    if (allError) {
      console.error('❌ Error fetching all products:', allError)
      return
    }
    
    console.log('📊 All products in database:')
    allProducts?.forEach(p => {
      console.log(`  - ${p.name} (slug: ${p.slug})`)
    })
    return
  }
  
  // Update slugs for 40/40 products
  for (const product of products) {
    const newSlug = product.name
      .toLowerCase()
      .replace(/\//g, '-') // Replace / with -
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^a-z0-9-]/g, '') // Remove special characters
      .replace(/-+/g, '-') // Replace multiple - with single -
      .replace(/^-+|-+$/g, '') // Remove leading/trailing -
    
    console.log(`🔄 Updating ${product.name}:`)
    console.log(`  Old slug: ${product.slug}`)
    console.log(`  New slug: ${newSlug}`)
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ slug: newSlug })
      .eq('id', product.id)
    
    if (updateError) {
      console.error(`❌ Error updating ${product.name}:`, updateError)
    } else {
      console.log(`✅ Successfully updated ${product.name}`)
    }
  }
  
  console.log('🎉 Slug update completed!')
}

fixSlugs().catch(console.error)
