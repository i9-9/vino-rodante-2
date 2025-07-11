import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TestResult {
  entity: string
  operation: string
  status: 'passed' | 'failed'
  message: string
  duration: number
}

async function testProductsCRUD(supabase: any): Promise<TestResult[]> {
  const results: TestResult[] = []
  let testProductId: string | null = null

  try {
    // Test CREATE Product
    const startCreate = Date.now()
    const testProduct = {
      name: 'Producto Test CRUD',
      slug: 'producto-test-crud',
      description: 'Producto creado para testing automático',
      price: 2500.00,
      image: 'https://via.placeholder.com/400x300',
      category: 'tinto',
      year: '2020',
      region: 'Mendoza',
      varietal: 'Malbec',
      stock: 10,
      featured: false,
      is_visible: true
    }

    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single()

    if (createError) throw createError
    testProductId = createdProduct.id

    results.push({
      entity: 'products',
      operation: 'CREATE',
      status: 'passed',
      message: `Product created with ID: ${testProductId}`,
      duration: Date.now() - startCreate
    })

    // Test READ Product
    const startRead = Date.now()
    const { data: readProduct, error: readError } = await supabase
      .from('products')
      .select('*')
      .eq('id', testProductId)
      .single()

    if (readError || !readProduct) throw new Error('Failed to read product')

    results.push({
      entity: 'products',
      operation: 'READ',
      status: 'passed',
      message: `Product read successfully: ${readProduct.name}`,
      duration: Date.now() - startRead
    })

    // Test UPDATE Product
    const startUpdate = Date.now()
    const updateData = {
      name: 'Producto Test CRUD - ACTUALIZADO',
      price: 3000.00,
      stock: 15
    }

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', testProductId)
      .select()
      .single()

    if (updateError) throw updateError

    results.push({
      entity: 'products',
      operation: 'UPDATE',
      status: 'passed',
      message: `Product updated: ${updatedProduct.name}`,
      duration: Date.now() - startUpdate
    })

    // Test DELETE Product
    const startDelete = Date.now()
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', testProductId)

    if (deleteError) throw deleteError

    results.push({
      entity: 'products',
      operation: 'DELETE',
      status: 'passed',
      message: 'Product deleted successfully',
      duration: Date.now() - startDelete
    })

  } catch (error) {
    results.push({
      entity: 'products',
      operation: 'CRUD',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: 0
    })

    // Cleanup en caso de error
    if (testProductId) {
      await supabase.from('products').delete().eq('id', testProductId)
    }
  }

  return results
}

async function testAddressesCRUD(supabase: any): Promise<TestResult[]> {
  const results: TestResult[] = []
  let testAddressId: string | null = null

  // Crear un usuario de prueba para las direcciones
  const testCustomer = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Test Customer',
    email: 'test@example.com',
    is_admin: false
  }

  try {
    // Crear customer de prueba
    await supabase.from('customers').upsert(testCustomer)

    // Test CREATE Address
    const startCreate = Date.now()
    const testAddress = {
      customer_id: testCustomer.id,
      line1: 'Av. Test 123',
      line2: 'Piso 4, Depto B',
      city: 'Buenos Aires',
      state: 'CABA',
      postal_code: '1234',
      country: 'Argentina',
      is_default: false
    }

    const { data: createdAddress, error: createError } = await supabase
      .from('addresses')
      .insert(testAddress)
      .select()
      .single()

    if (createError) throw createError
    testAddressId = createdAddress.id

    results.push({
      entity: 'addresses',
      operation: 'CREATE',
      status: 'passed',
      message: `Address created with ID: ${testAddressId}`,
      duration: Date.now() - startCreate
    })

    // Test READ Address
    const startRead = Date.now()
    const { data: readAddress, error: readError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', testAddressId)
      .single()

    if (readError || !readAddress) throw new Error('Failed to read address')

    results.push({
      entity: 'addresses',
      operation: 'READ',
      status: 'passed',
      message: `Address read successfully: ${readAddress.line1}`,
      duration: Date.now() - startRead
    })

    // Test UPDATE Address
    const startUpdate = Date.now()
    const updateData = {
      line1: 'Av. Test 456 - ACTUALIZADA',
      city: 'Córdoba',
      is_default: true
    }

    const { data: updatedAddress, error: updateError } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', testAddressId)
      .select()
      .single()

    if (updateError) throw updateError

    results.push({
      entity: 'addresses',
      operation: 'UPDATE',
      status: 'passed',
      message: `Address updated: ${updatedAddress.line1}`,
      duration: Date.now() - startUpdate
    })

    // Test DELETE Address
    const startDelete = Date.now()
    const { error: deleteError } = await supabase
      .from('addresses')
      .delete()
      .eq('id', testAddressId)

    if (deleteError) throw deleteError

    results.push({
      entity: 'addresses',
      operation: 'DELETE',
      status: 'passed',
      message: 'Address deleted successfully',
      duration: Date.now() - startDelete
    })

  } catch (error) {
    results.push({
      entity: 'addresses',
      operation: 'CRUD',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: 0
    })

    // Cleanup
    if (testAddressId) {
      await supabase.from('addresses').delete().eq('id', testAddressId)
    }
  } finally {
    // Cleanup customer de prueba
    await supabase.from('customers').delete().eq('id', testCustomer.id)
  }

  return results
}

async function testOrdersCRUD(supabase: any): Promise<TestResult[]> {
  const results: TestResult[] = []
  let testOrderId: string | null = null
  let testCustomerId: string | null = null
  let testProductId: string | null = null

  try {
    // Crear customer de prueba
    const testCustomer = {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Test Customer Orders',
      email: 'testorders@example.com',
      is_admin: false
    }

    const { data: createdCustomer, error: customerError } = await supabase
      .from('customers')
      .upsert(testCustomer)
      .select()
      .single()

    if (customerError) throw customerError
    testCustomerId = testCustomer.id

    // Crear producto de prueba
    const testProduct = {
      name: 'Producto para Order Test',
      slug: 'producto-order-test',
      description: 'Producto para testing de orders',
      price: 1500.00,
      image: 'https://via.placeholder.com/400x300',
      category: 'tinto',
      year: '2021',
      region: 'Salta',
      varietal: 'Tannat',
      stock: 5,
      featured: false,
      is_visible: true
    }

    const { data: createdProduct, error: productError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single()

    if (productError) throw productError
    testProductId = createdProduct.id

    // Test CREATE Order
    const startCreate = Date.now()
    const testOrder = {
      user_id: testCustomerId,
      status: 'pending',
      total: 3000.00
    }

    const { data: createdOrder, error: createError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single()

    if (createError) throw createError
    testOrderId = createdOrder.id

    // Crear order item
    const testOrderItem = {
      order_id: testOrderId,
      product_id: testProductId,
      quantity: 2,
      price: 1500.00
    }

    const { error: itemError } = await supabase
      .from('order_items')
      .insert(testOrderItem)

    if (itemError) throw itemError

    results.push({
      entity: 'orders',
      operation: 'CREATE',
      status: 'passed',
      message: `Order created with ID: ${testOrderId}`,
      duration: Date.now() - startCreate
    })

    // Test READ Order
    const startRead = Date.now()
    const { data: readOrder, error: readError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          products (
            name,
            description
          )
        )
      `)
      .eq('id', testOrderId)
      .single()

    if (readError || !readOrder) throw new Error('Failed to read order')

    results.push({
      entity: 'orders',
      operation: 'READ',
      status: 'passed',
      message: `Order read successfully with ${readOrder.order_items.length} items`,
      duration: Date.now() - startRead
    })

    // Test UPDATE Order Status
    const startUpdate = Date.now()
    const updateData = {
      status: 'preparing',
      total: 3500.00
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', testOrderId)
      .select()
      .single()

    if (updateError) throw updateError

    results.push({
      entity: 'orders',
      operation: 'UPDATE',
      status: 'passed',
      message: `Order status updated to: ${updatedOrder.status}`,
      duration: Date.now() - startUpdate
    })

    // Test DELETE Order
    const startDelete = Date.now()
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', testOrderId)

    if (deleteError) throw deleteError

    results.push({
      entity: 'orders',
      operation: 'DELETE',
      status: 'passed',
      message: 'Order deleted successfully',
      duration: Date.now() - startDelete
    })

  } catch (error) {
    results.push({
      entity: 'orders',
      operation: 'CRUD',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: 0
    })

    // Cleanup
    if (testOrderId) {
      await supabase.from('orders').delete().eq('id', testOrderId)
    }
  } finally {
    // Cleanup
    if (testProductId) {
      await supabase.from('products').delete().eq('id', testProductId)
    }
    if (testCustomerId) {
      await supabase.from('customers').delete().eq('id', testCustomerId)
    }
  }

  return results
}

async function testUserSubscriptionsCRUD(supabase: any): Promise<TestResult[]> {
  const results: TestResult[] = []
  let testSubscriptionId: string | null = null
  let testCustomerId: string | null = null
  let testPlanId: string | null = null

  try {
    // Crear customer de prueba
    const testCustomer = {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Test Customer Subscriptions',
      email: 'testsubs@example.com',
      is_admin: false
    }

    await supabase.from('customers').upsert(testCustomer)
    testCustomerId = testCustomer.id

    // Crear plan de prueba
    const testPlan = {
      club: 'test-subscription',
      name: 'Plan Test Subscription',
      slug: 'plan-test-subscription',
      description: 'Plan para testing de suscripciones',
      image: 'https://via.placeholder.com/400x300',
      price_monthly: 2500,
      price_quarterly: 7000,
      price_weekly: 650,
      price_biweekly: 1200,
      wines_per_delivery: 2,
      features: ['Test feature 1', 'Test feature 2'],
      status: 'active',
      is_active: true,
      is_visible: true,
      type: 'tinto'
    }

    const { data: createdPlan, error: planError } = await supabase
      .from('subscription_plans')
      .insert(testPlan)
      .select()
      .single()

    if (planError) throw planError
    testPlanId = createdPlan.id

    // Test CREATE User Subscription
    const startCreate = Date.now()
    const testSubscription = {
      user_id: testCustomerId,
      plan_id: testPlanId,
      status: 'active',
      frequency: 'monthly',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const { data: createdSubscription, error: createError } = await supabase
      .from('user_subscriptions')
      .insert(testSubscription)
      .select()
      .single()

    if (createError) throw createError
    testSubscriptionId = createdSubscription.id

    results.push({
      entity: 'user_subscriptions',
      operation: 'CREATE',
      status: 'passed',
      message: `Subscription created with ID: ${testSubscriptionId}`,
      duration: Date.now() - startCreate
    })

    // Test READ User Subscription
    const startRead = Date.now()
    const { data: readSubscription, error: readError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(*)
      `)
      .eq('id', testSubscriptionId)
      .single()

    if (readError || !readSubscription) throw new Error('Failed to read subscription')

    results.push({
      entity: 'user_subscriptions',
      operation: 'READ',
      status: 'passed',
      message: `Subscription read successfully: ${readSubscription.subscription_plan.name}`,
      duration: Date.now() - startRead
    })

    // Test UPDATE User Subscription
    const startUpdate = Date.now()
    const updateData = {
      status: 'paused',
      frequency: 'quarterly'
    }

    const { data: updatedSubscription, error: updateError } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', testSubscriptionId)
      .select()
      .single()

    if (updateError) throw updateError

    results.push({
      entity: 'user_subscriptions',
      operation: 'UPDATE',
      status: 'passed',
      message: `Subscription status updated to: ${updatedSubscription.status}`,
      duration: Date.now() - startUpdate
    })

    // Test DELETE User Subscription
    const startDelete = Date.now()
    const { error: deleteError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', testSubscriptionId)

    if (deleteError) throw deleteError

    results.push({
      entity: 'user_subscriptions',
      operation: 'DELETE',
      status: 'passed',
      message: 'Subscription deleted successfully',
      duration: Date.now() - startDelete
    })

  } catch (error) {
    results.push({
      entity: 'user_subscriptions',
      operation: 'CRUD',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: 0
    })

    // Cleanup
    if (testSubscriptionId) {
      await supabase.from('user_subscriptions').delete().eq('id', testSubscriptionId)
    }
  } finally {
    // Cleanup
    if (testPlanId) {
      await supabase.from('subscription_plans').delete().eq('id', testPlanId)
    }
    if (testCustomerId) {
      await supabase.from('customers').delete().eq('id', testCustomerId)
    }
  }

  return results
}

async function runAllCRUDTests() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log('🚀 Starting comprehensive CRUD testing for all entities...\n')
  console.log('=' .repeat(70))

  const allResults: TestResult[] = []

  // Test all CRUDs
  console.log('\n📦 Testing Products CRUD...')
  const productsResults = await testProductsCRUD(supabase)
  allResults.push(...productsResults)

  console.log('\n🏠 Testing Addresses CRUD...')
  const addressesResults = await testAddressesCRUD(supabase)
  allResults.push(...addressesResults)

  console.log('\n📋 Testing Orders CRUD...')
  const ordersResults = await testOrdersCRUD(supabase)
  allResults.push(...ordersResults)

  console.log('\n📝 Testing User Subscriptions CRUD...')
  const subscriptionsResults = await testUserSubscriptionsCRUD(supabase)
  allResults.push(...subscriptionsResults)

  // Generate report
  console.log('\n' + '='.repeat(70))
  console.log('📊 COMPREHENSIVE CRUD TEST REPORT')
  console.log('='.repeat(70))

  const groupedResults = allResults.reduce((acc, result) => {
    if (!acc[result.entity]) {
      acc[result.entity] = []
    }
    acc[result.entity].push(result)
    return acc
  }, {} as Record<string, TestResult[]>)

  let totalPassed = 0
  let totalFailed = 0

  Object.entries(groupedResults).forEach(([entity, results]) => {
    console.log(`\n🗂️  ${entity.toUpperCase()}:`)
    results.forEach(result => {
      const icon = result.status === 'passed' ? '✅' : '❌'
      const duration = `${result.duration}ms`.padStart(6)
      console.log(`  ${icon} ${result.operation.padEnd(8)} ${duration} - ${result.message}`)
      
      if (result.status === 'passed') {
        totalPassed++
      } else {
        totalFailed++
      }
    })
  })

  console.log('\n' + '-'.repeat(70))
  console.log(`✅ Passed: ${totalPassed}`)
  console.log(`❌ Failed: ${totalFailed}`)
  console.log(`📊 Total:  ${totalPassed + totalFailed}`)
  
  const successRate = Math.round((totalPassed / (totalPassed + totalFailed)) * 100)
  console.log(`🎯 Success Rate: ${successRate}%`)

  if (totalFailed === 0) {
    console.log('\n🎉 All CRUD operations passed! Your application is working perfectly!')
  } else {
    console.log('\n⚠️  Some CRUD operations failed. Check the details above.')
  }

  process.exit(totalFailed === 0 ? 0 : 1)
}

// Ejecutar todos los tests
runAllCRUDTests() 