import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { getPaymentStatus } from "@/lib/mercadopago"

// Validate webhook signature (optional but recommended for production)
function validateWebhookSignature(request: NextRequest, body: string): boolean {
  // In production, you should validate the webhook signature
  // For now, we'll skip this for development
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)

    console.log("MercadoPago webhook received:", {
      type: data.type,
      dataId: data.data?.id,
      timestamp: new Date().toISOString()
    })

    // Validate the webhook
    if (data.type !== "payment" || !data.data || !data.data.id) {
      console.error("Invalid webhook format:", data)
      return NextResponse.json({ message: "Invalid webhook format" }, { status: 400 })
    }

    // Validate webhook signature in production
    if (process.env.NODE_ENV === "production") {
      if (!validateWebhookSignature(request, body)) {
        console.error("Invalid webhook signature")
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
      }
    }

    // Get payment details
    const paymentId = data.data.id
    const supabase = await createClient()
    
    let paymentData
    try {
      paymentData = await getPaymentStatus(paymentId)
    } catch (error) {
      console.error("Error getting payment status:", error)
      return NextResponse.json({ message: "Error getting payment data" }, { status: 500 })
    }

    if (!paymentData || !paymentData.external_reference) {
      console.error("Invalid payment data:", paymentData)
      return NextResponse.json({ message: "Invalid payment data" }, { status: 400 })
    }

    // Update order status based on payment status
    const orderId = paymentData.external_reference
    let orderStatus = "pending"
    let orderNotes = ""

    switch (paymentData.status) {
      case "approved":
        orderStatus = "paid"
        orderNotes = `Payment approved. Payment ID: ${paymentId}`
        break
      case "rejected":
        orderStatus = "cancelled"
        orderNotes = `Payment rejected. Payment ID: ${paymentId}`
        break
      case "refunded":
        orderStatus = "refunded"
        orderNotes = `Payment refunded. Payment ID: ${paymentId}`
        break
      case "in_process":
        orderStatus = "pending"
        orderNotes = `Payment in process. Payment ID: ${paymentId}`
        break
      case "pending":
        orderStatus = "pending"
        orderNotes = `Payment pending. Payment ID: ${paymentId}`
        break
      default:
        orderStatus = "pending"
        orderNotes = `Payment status: ${paymentData.status}. Payment ID: ${paymentId}`
    }

    console.log("Updating order status:", {
      orderId,
      orderStatus,
      paymentStatus: paymentData.status,
      paymentId
    })

    // Update order in database
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({ 
        status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)

    if (orderUpdateError) {
      console.error("Error updating order status:", orderUpdateError)
      return NextResponse.json({ 
        message: "Error updating order",
        details: orderUpdateError.message
      }, { status: 500 })
    }

    // If payment is approved, you might want to:
    // 1. Send confirmation email
    // 2. Update inventory
    // 3. Create shipping label
    // 4. Send notifications

    if (paymentData.status === "approved") {
      console.log("Payment approved for order:", orderId)
      
      // You can add additional logic here:
      // - Send confirmation email
      // - Update inventory
      // - Create shipping label
      // - Send notifications to admin
    }

    return NextResponse.json({ 
      success: true,
      orderId,
      orderStatus,
      paymentStatus: paymentData.status
    })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ 
      message: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}
