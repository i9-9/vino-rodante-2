import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Cargar variables de entorno
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey)
  process.exit(1)
}

// Función para generar slug a partir del nombre (igual que en products.ts)
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\//g, '-') // Reemplazar slashes con guiones PRIMERO
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim()
    .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
}

async function fixSlugsWithSlashes() {
  console.log('🔧 Fixing product slugs with slashes...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Buscar productos que contengan slashes en el nombre
  const { data: products, error: searchError } = await supabase
    .from('products')
    .select('id, name, slug')
    .like('name', '%/%')
  
  if (searchError) {
    console.error('❌ Error searching products:', searchError)
    return
  }
  
  console.log(`📊 Found ${products?.length || 0} products with slashes in name:`)
  products?.forEach(p => {
    console.log(`  - ${p.name} (current slug: ${p.slug})`)
  })
  
  if (!products || products.length === 0) {
    console.log('✅ No products with slashes found. All good!')
    return
  }
  
  // Actualizar slugs para productos con slashes
  for (const product of products) {
    const newSlug = generateSlug(product.name)
    
    // Solo actualizar si el slug es diferente
    if (newSlug !== product.slug) {
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
    } else {
      console.log(`⏭️  Skipping ${product.name} - slug already correct`)
    }
  }
  
  console.log('🎉 Slug update completed!')
}

// También verificar subscription_plans
async function fixSubscriptionPlanSlugs() {
  console.log('🔧 Fixing subscription plan slugs with slashes...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Buscar planes que contengan slashes en el nombre
  const { data: plans, error: searchError } = await supabase
    .from('subscription_plans')
    .select('id, name, slug')
    .like('name', '%/%')
  
  if (searchError) {
    console.error('❌ Error searching subscription plans:', searchError)
    return
  }
  
  console.log(`📊 Found ${plans?.length || 0} subscription plans with slashes in name:`)
  plans?.forEach(p => {
    console.log(`  - ${p.name} (current slug: ${p.slug})`)
  })
  
  if (!plans || plans.length === 0) {
    console.log('✅ No subscription plans with slashes found. All good!')
    return
  }
  
  // Actualizar slugs para planes con slashes
  for (const plan of plans) {
    const newSlug = generateSlug(plan.name)
    
    // Solo actualizar si el slug es diferente
    if (newSlug !== plan.slug) {
      console.log(`🔄 Updating ${plan.name}:`)
      console.log(`  Old slug: ${plan.slug}`)
      console.log(`  New slug: ${newSlug}`)
      
      const { error: updateError } = await supabase
        .from('subscription_plans')
        .update({ slug: newSlug })
        .eq('id', plan.id)
      
      if (updateError) {
        console.error(`❌ Error updating ${plan.name}:`, updateError)
      } else {
        console.log(`✅ Successfully updated ${plan.name}`)
      }
    } else {
      console.log(`⏭️  Skipping ${plan.name} - slug already correct`)
    }
  }
  
  console.log('🎉 Subscription plan slug update completed!')
}

async function main() {
  try {
    await fixSlugsWithSlashes()
    console.log('\n' + '='.repeat(50) + '\n')
    await fixSubscriptionPlanSlugs()
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

main().catch(console.error)
