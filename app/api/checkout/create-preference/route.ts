import { type NextRequest, NextResponse } from "next/server"
import { createPreference } from "@/lib/mercadopago"
import { v4 as uuidv4 } from "uuid"
import { calculateShipping } from "@/lib/shipping-utils"
import { createClient } from '@/lib/supabase/server'
import { applyDiscountsToProducts } from '@/lib/discount-utils'

export async function POST(request: NextRequest) {
  try {
    const { items, customer, shipping } = await request.json()

    if (!items || !items.length || !customer || !customer.name || !customer.email) {
      return NextResponse.json({ 
        error: "Invalid request data",
        details: "Items and customer information are required"
      }, { status: 400 })
    }

    // Validate items structure
    for (const item of items) {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        return NextResponse.json({ 
          error: "Invalid item data",
          details: "Each item must have id, name, price, and quantity"
        }, { status: 400 })
      }
    }

    // Get authenticated user if available
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    // Create or get customer
    let customerId: string

    if (user) {
      // Use the authenticated user's ID
      customerId = user.id
    } else if (customer.id) {
      // Use the customer ID provided by the frontend (for auto-created accounts)
      customerId = customer.id
    } else {
      // Create or get customer by email for guest checkout
      const { data: existingCustomer, error: customerFetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("email", customer.email)
        .single()

      if (customerFetchError || !existingCustomer) {
        // Create new customer
        const { data: newCustomer, error: customerCreateError } = await supabase
          .from("customers")
          .insert([{ name: customer.name, email: customer.email }])
          .select()
          .single()

        if (customerCreateError || !newCustomer) {
          console.error("Error creating customer:", customerCreateError)
          return NextResponse.json({ 
            error: "Failed to create customer",
            details: customerCreateError?.message
          }, { status: 500 })
        }

        customerId = newCustomer.id
      } else {
        customerId = existingCustomer.id
      }
    }

    // Obtener descuentos activos
    const { data: discounts, error: discountsError } = await supabase
      .from('discounts')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .lte('start_date', new Date().toISOString())

    // Aplicar descuentos a los items
    const itemsWithDiscounts = discounts && discounts.length > 0 
      ? applyDiscountsToProducts(items, discounts)
      : items

    // Create a temporary order
    const orderId = uuidv4()
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const discountedSubtotal = itemsWithDiscounts.reduce((sum: number, item: any) => {
      const itemPrice = item.discount ? item.discount.final_price : item.price
      return sum + itemPrice * item.quantity
    }, 0)
    const allFreeShipping = items.length > 0 && items.every((it: any) => it.free_shipping === true)
    
    // Calcular envío basado en código postal del cliente si está disponible
    let shippingCost = 0
    if (!allFreeShipping) {
      // Buscar código postal en la información del cliente
      const customerPostalCode = customer.postalCode || customer.postal_code
      if (customerPostalCode) {
        shippingCost = calculateShipping(customerPostalCode, 15000)
      } else {
        shippingCost = Number.isFinite(Number(shipping)) ? Number(shipping) : 15000
      }
    }
    
    const total = discountedSubtotal + shippingCost

    const { error: orderError } = await supabase.from("orders").insert([
      {
        id: orderId,
        user_id: customerId,
        status: "pending",
        total,
      },
    ])

    if (orderError) {
      console.error("Error creating temporary order:", orderError)
      return NextResponse.json({ 
        error: "Failed to create order",
        details: orderError.message
      }, { status: 500 })
    }

    // Insert order items immediately so panels can show details
    const orderItemsPayload = itemsWithDiscounts.map((it: any) => ({
      order_id: orderId,
      product_id: it.id,
      quantity: it.quantity,
      price: it.discount ? it.discount.final_price : it.price,
    }))

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload)

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError)
      // Continuar, pero dejar registro en logs
    }

    // Create Mercado Pago preference with enhanced options
    console.log('[MP] Incoming items', itemsWithDiscounts.map((it: any) => ({ 
      id: it.id, 
      name: it.name, 
      price: it.discount ? it.discount.final_price : it.price, 
      quantity: it.quantity,
      discount: it.discount ? `${it.discount.name} (${it.discount.discount_type === 'percentage' ? `${it.discount.discount_value}%` : `$${it.discount.discount_value}`})` : null
    })))
    const preference = await createPreference({
      items: itemsWithDiscounts,
      customer,
      orderId,
      shipping: shippingCost,
      metadata: {
        user_id: customerId,
        order_type: "checkout",
        created_at: new Date().toISOString()
      },
      expires: true,
      expirationDateTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    })

    // Debug trace to help diagnose payment issues
    console.log('[MP] Preference created', {
      preferenceId: preference.id,
      orderId,
      subtotal,
      discountedSubtotal,
      savings: subtotal - discountedSubtotal,
      shipping: shippingCost,
      total,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      preferenceId: preference.id,
      orderId,
      initPoint: preference.init_point
    })
  } catch (error: any) {
    console.error("Error creating preference:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}
