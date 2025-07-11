import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkStorageBuckets() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Verificar bucket product-images
    const { data: productImagesBucket, error: productError } = await supabase.storage
      .getBucket('product-images')

    if (productError) {
      console.log('❌ Bucket product-images no existe:', productError.message)
    } else {
      console.log('✅ Bucket product-images existe')
    }

    // Verificar bucket subscription-plans
    const { data: subscriptionPlansBucket, error: subscriptionError } = await supabase.storage
      .getBucket('subscription-plans')

    if (subscriptionError) {
      console.log('❌ Bucket subscription-plans no existe:', subscriptionError.message)
      console.log('💡 Ejecuta el script create-subscription-plans-bucket.sql en Supabase')
    } else {
      console.log('✅ Bucket subscription-plans existe')
    }

    // Listar todos los buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error al listar buckets:', bucketsError)
    } else {
      console.log('\n📦 Buckets disponibles:')
      buckets.forEach(bucket => {
        console.log(`- ${bucket.name} (${bucket.public ? 'público' : 'privado'})`)
      })
    }

  } catch (error) {
    console.error('Error checking storage buckets:', error)
  }
}

checkStorageBuckets() 