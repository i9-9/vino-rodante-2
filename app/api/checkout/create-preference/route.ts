import { type NextRequest, NextResponse } from "next/server"
import { createPreference } from "@/lib/mercadopago"
import { v4 as uuidv4 } from "uuid"
import { createClient } from '@/lib/supabase/server'
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { items, customer } = await request.json()

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

    // Create a temporary order
    const orderId = uuidv4()
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

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

    // Create Mercado Pago preference with enhanced options
    const preference = await createPreference({
      items,
      customer,
      orderId,
      metadata: {
        user_id: customerId,
        order_type: "checkout",
        created_at: new Date().toISOString()
      },
      expires: true,
      expirationDateTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
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
