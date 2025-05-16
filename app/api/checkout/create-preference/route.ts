import { type NextRequest, NextResponse } from "next/server"
import { createPreference } from "@/lib/mercadopago"
import { v4 as uuidv4 } from "uuid"
import { createClient } from '@/lib/supabase/server'
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { items, customer } = await request.json()

    if (!items || !items.length || !customer || !customer.name || !customer.email) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
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
          return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
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
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create Mercado Pago preference
    const preference = await createPreference(items, customer, orderId)

    return NextResponse.json({
      preferenceId: preference.id,
      orderId,
    })
  } catch (error) {
    console.error("Error creating preference:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
