import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TestPlan {
  club: string
  name: string
  slug: string
  description: string
  price_monthly: number
  price_quarterly: number
  price_weekly: number
  price_biweekly: number
  wines_per_delivery: number
  features: string[]
  status: string
  is_active: boolean
  is_visible: boolean
  type: string
  image: string
}

async function testSubscriptionPlansCRUD() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  let testPlanId: string | null = null

  try {
    console.log('🧪 Testing Subscription Plans CRUD...\n')

    // 1. CREATE - Crear un plan de prueba
    console.log('1️⃣ Testing CREATE operation...')
    const testPlan: TestPlan = {
      club: 'test-club',
      name: 'Plan de Prueba CRUD',
      slug: 'plan-prueba-crud',
      description: 'Plan creado automáticamente para testing',
      price_monthly: 2500,
      price_quarterly: 7000,
      price_weekly: 650,
      price_biweekly: 1200,
      wines_per_delivery: 2,
      features: ['Vinos seleccionados', 'Envío gratis', 'Degustación virtual'],
      status: 'active',
      is_active: true,
      is_visible: true,
      type: 'tinto',
      image: 'https://via.placeholder.com/400x300?text=Test+Plan+Image'
    }

    const { data: createdPlan, error: createError } = await supabase
      .from('subscription_plans')
      .insert(testPlan)
      .select()
      .single()

    if (createError) {
      console.error('❌ CREATE failed:', createError.message)
      return
    }

    testPlanId = createdPlan.id
    console.log('✅ CREATE successful - Plan ID:', testPlanId)

    // 2. READ - Leer el plan creado
    console.log('\n2️⃣ Testing READ operation...')
    const { data: readPlan, error: readError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', testPlanId)
      .single()

    if (readError) {
      console.error('❌ READ failed:', readError.message)
      return
    }

    console.log('✅ READ successful - Plan name:', readPlan.name)

    // Verificar que los datos coinciden
    if (readPlan.price_monthly !== testPlan.price_monthly) {
      console.error('❌ Data mismatch in price_monthly')
      return
    }
    console.log('✅ Data integrity verified')

    // 3. UPDATE - Actualizar el plan
    console.log('\n3️⃣ Testing UPDATE operation...')
    const updateData = {
      name: 'Plan de Prueba CRUD - ACTUALIZADO',
      price_monthly: 3000,
      description: 'Plan actualizado automáticamente para testing'
    }

    const { data: updatedPlan, error: updateError } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', testPlanId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ UPDATE failed:', updateError.message)
      return
    }

    console.log('✅ UPDATE successful - New name:', updatedPlan.name)
    console.log('✅ UPDATE successful - New price:', updatedPlan.price_monthly)

    // 4. DELETE - Eliminar el plan
    console.log('\n4️⃣ Testing DELETE operation...')
    const { error: deleteError } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', testPlanId)

    if (deleteError) {
      console.error('❌ DELETE failed:', deleteError.message)
      return
    }

    console.log('✅ DELETE successful')

    // 5. Verificar que se eliminó
    console.log('\n5️⃣ Verifying deletion...')
    const { data: deletedPlan, error: verifyError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', testPlanId)
      .single()

    if (verifyError && verifyError.code === 'PGRST116') {
      console.log('✅ Deletion verified - Plan no longer exists')
    } else {
      console.error('❌ Plan still exists after deletion')
      return
    }

    console.log('\n🎉 All CRUD operations completed successfully!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    
    // Cleanup en caso de error
    if (testPlanId) {
      console.log('\n🧹 Cleaning up test data...')
      await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', testPlanId)
    }
  }
}

// Ejecutar el test
testSubscriptionPlansCRUD() 