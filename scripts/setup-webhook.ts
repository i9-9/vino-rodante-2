import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Cargar variables de entorno
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupWebhook() {
  console.log('🔧 Setting up Supabase webhook for revalidation...\n')

  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/webhooks/supabase`
  
  console.log(`📡 Webhook URL: ${webhookUrl}`)

  try {
    // Verificar si ya existe un webhook
    const { data: existingWebhooks, error: listError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('url', webhookUrl)

    if (listError) {
      console.log('ℹ️  No existing webhooks table or error listing webhooks')
    } else if (existingWebhooks && existingWebhooks.length > 0) {
      console.log('✅ Webhook already exists')
      return
    }

    // Crear webhook (esto requiere permisos de service role)
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        url: webhookUrl,
        events: ['products.insert', 'products.update', 'products.delete'],
        active: true,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('❌ Error creating webhook:', error)
      console.log('\n📝 Manual setup required:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Navigate to Database > Webhooks')
      console.log('3. Create a new webhook with:')
      console.log(`   - URL: ${webhookUrl}`)
      console.log('   - Events: products.insert, products.update, products.delete')
      console.log('   - HTTP Method: POST')
      console.log('   - Headers: Content-Type: application/json')
    } else {
      console.log('✅ Webhook created successfully:', data)
    }

  } catch (error) {
    console.error('❌ Exception setting up webhook:', error)
    console.log('\n📝 Manual setup required:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to Database > Webhooks')
    console.log('3. Create a new webhook with:')
    console.log(`   - URL: ${webhookUrl}`)
    console.log('   - Events: products.insert, products.update, products.delete')
    console.log('   - HTTP Method: POST')
    console.log('   - Headers: Content-Type: application/json')
  }
}

setupWebhook().catch(console.error)
