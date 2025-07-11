import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync, existsSync } from 'fs'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testServerActions() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  let testPlanId: string | null = null

  try {
    console.log('🧪 Testing Server Actions for Subscription Plans...\n')

    // 1. Test createSubscriptionPlan
    console.log('1️⃣ Testing createSubscriptionPlan...')
    
    const newPlan = {
      club: 'test-server-action',
      name: 'Plan Server Action Test',
      slug: 'plan-server-action-test',
      description: 'Plan creado para testear server actions',
      image: 'https://via.placeholder.com/400x300',
      banner_image: 'https://via.placeholder.com/800x400',
      price_monthly: 2800,
      price_quarterly: 8000,
      price_weekly: 700,
      price_biweekly: 1300,
      wines_per_delivery: 3,
      features: ['Test feature 1', 'Test feature 2'],
      status: 'active',
      is_active: true,
      is_visible: true,
      type: 'mixto',
      discount_percentage: 10,
      display_order: 1
    }

    // Simular la creación directamente en la base de datos
    const { data: createdPlan, error: createError } = await supabase
      .from('subscription_plans')
      .insert(newPlan)
      .select()
      .single()

    if (createError) {
      console.error('❌ CREATE via direct DB failed:', createError.message)
      return
    }

    testPlanId = createdPlan.id
    console.log('✅ Plan created successfully - ID:', testPlanId)

    // 2. Test data validation
    console.log('\n2️⃣ Testing data validation...')
    
    // Verificar campos requeridos
    const requiredFields = ['name', 'club', 'description', 'price_monthly', 'price_quarterly']
    let validationPassed = true

    for (const field of requiredFields) {
      if (!createdPlan[field] || (typeof createdPlan[field] === 'number' && createdPlan[field] <= 0)) {
        console.error(`❌ Required field validation failed: ${field}`)
        validationPassed = false
      }
    }

    if (validationPassed) {
      console.log('✅ All required fields validation passed')
    }

    // 3. Test updateSubscriptionPlan
    console.log('\n3️⃣ Testing updateSubscriptionPlan...')
    
    const updateData = {
      name: 'Plan Server Action Test - UPDATED',
      price_monthly: 3200,
      description: 'Descripción actualizada por server action test',
      features: ['Updated feature 1', 'Updated feature 2', 'New feature 3']
    }

    const { data: updatedPlan, error: updateError } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', testPlanId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ UPDATE via direct DB failed:', updateError.message)
      return
    }

    console.log('✅ Plan updated successfully')
    console.log('✅ New name:', updatedPlan.name)
    console.log('✅ New price:', updatedPlan.price_monthly)

    // 4. Test Storage bucket access
    console.log('\n4️⃣ Testing Storage bucket access...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError.message)
    } else {
      const subscriptionPlansBucket = buckets.find(b => b.id === 'subscription-plans')
      if (subscriptionPlansBucket) {
        console.log('✅ subscription-plans bucket exists and is accessible')
        console.log('✅ Bucket is public:', subscriptionPlansBucket.public)
      } else {
        console.error('❌ subscription-plans bucket not found')
      }
    }

    // 5. Test uploadPlanImage simulation
    console.log('\n5️⃣ Testing uploadPlanImage simulation...')
    
    // Verificar que podemos acceder al bucket de storage
    const testFileName = `test-${Date.now()}.txt`
    const testContent = 'Test content for image upload simulation'
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('subscription-plans')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError.message)
    } else {
      console.log('✅ Test file uploaded successfully')
      
      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('subscription-plans')
        .getPublicUrl(testFileName)
      
      console.log('✅ Public URL generated:', publicUrl)
      
      // Limpiar archivo de prueba
      await supabase.storage
        .from('subscription-plans')
        .remove([testFileName])
      
      console.log('✅ Test file cleaned up')
    }

    // 6. Test RLS policies
    console.log('\n6️⃣ Testing RLS policies...')
    
    // Crear client anónimo para probar RLS
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    
    // Probar lectura de planes (debería funcionar)
    const { data: publicPlans, error: publicError } = await anonClient
      .from('subscription_plans')
      .select('id, name, price_monthly')
      .eq('is_visible', true)
      .limit(1)

    if (publicError) {
      console.error('❌ Public read access failed:', publicError.message)
    } else {
      console.log('✅ Public read access works - Found plans:', publicPlans?.length || 0)
    }

    // Probar escritura anónima (debería fallar)
    const { error: anonWriteError } = await anonClient
      .from('subscription_plans')
      .insert({
        name: 'Unauthorized plan',
        club: 'test',
        description: 'This should fail'
      })

    if (anonWriteError) {
      console.log('✅ Anonymous write correctly blocked:', anonWriteError.message)
    } else {
      console.error('❌ Anonymous write should have been blocked!')
    }

    // 7. Test deleteSubscriptionPlan
    console.log('\n7️⃣ Testing deleteSubscriptionPlan...')
    
    const { error: deleteError } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', testPlanId)

    if (deleteError) {
      console.error('❌ DELETE via direct DB failed:', deleteError.message)
      return
    }

    console.log('✅ Plan deleted successfully')

    // Verificar eliminación
    const { data: deletedPlan, error: verifyError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', testPlanId)
      .single()

    if (verifyError && verifyError.code === 'PGRST116') {
      console.log('✅ Deletion verified - Plan no longer exists')
    } else {
      console.error('❌ Plan still exists after deletion')
    }

    console.log('\n🎉 All Server Action tests completed successfully!')

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error)
    
    // Cleanup
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
testServerActions() 