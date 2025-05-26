import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { getPaymentStatus } from "@/lib/mercadopago"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the webhook
    if (body.type !== "payment" || !body.data || !body.data.id) {
      return NextResponse.json({ message: "Invalid webhook" }, { status: 400 })
    }

    // Get payment details
    const paymentId = body.data.id
    const supabase = await createClient()
    const paymentData = await getPaymentStatus(paymentId)

    if (!paymentData || !paymentData.external_reference) {
      return NextResponse.json({ message: "Invalid payment data" }, { status: 400 })
    }

    // Update order status based on payment status
    const orderId = paymentData.external_reference
    let orderStatus = "pending"

    switch (paymentData.status) {
      case "approved":
        orderStatus = "processing"
        break
      case "rejected":
        orderStatus = "cancelled"
        break
      case "in_process":
      case "pending":
        orderStatus = "pending"
        break
      default:
        orderStatus = "pending"
    }

    // Update order in database
    const { error } = await supabase.from("orders").update({ status: orderStatus }).eq("id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      return NextResponse.json({ message: "Error updating order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
