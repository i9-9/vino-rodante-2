import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Check if environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUserData() {
  console.log('🔍 Debugging User Data')
  console.log('========================')

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Error getting user:', userError)
      return
    }

    if (!user) {
      console.log('❌ No user logged in')
      return
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name
    })

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single()

    if (customerError) {
      console.error('❌ Error fetching customer:', customerError)
      return
    }

    console.log('✅ Customer data:', customer)

    // Get addresses
    const { data: addresses, error: addressesError } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', user.id)

    if (addressesError) {
      console.error('❌ Error fetching addresses:', addressesError)
      return
    }

    console.log('✅ Addresses found:', addresses?.length || 0)
    
    if (addresses && addresses.length > 0) {
      console.log('📋 Address details:')
      addresses.forEach((addr, index) => {
        console.log(`  ${index + 1}. ${addr.line1}, ${addr.city}, ${addr.state}`)
        console.log(`     Default: ${addr.is_default}`)
        console.log(`     ID: ${addr.id}`)
      })
    } else {
      console.log('❌ No addresses found for user')
    }

    // Test the query that checkout uses
    console.log('\n🔍 Testing checkout query...')
    const { data: checkoutData, error: checkoutError } = await supabase
      .from('customers')
      .select('*, addresses(*)')
      .eq('id', user.id)
      .single()

    if (checkoutError) {
      console.error('❌ Error in checkout query:', checkoutError)
      return
    }

    console.log('✅ Checkout query result:', {
      customer: checkoutData,
      addressesCount: checkoutData.addresses?.length || 0,
      hasDefaultAddress: checkoutData.addresses?.some((addr: any) => addr.is_default)
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugUserData() 