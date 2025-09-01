import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { getPaymentStatus } from "@/lib/mercadopago"
import { sendEmail, renderCustomerOrderEmail, renderAdminOrderEmail } from "@/lib/emails/resend"

// Validate webhook signature (optional but recommended for production)
function validateWebhookSignature(request: NextRequest, body: string): boolean {
  // In production, you should validate the webhook signature
  // For now, we'll skip this for development
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    // Mercado Pago envía diferentes formatos. Intentar parsear query params si el body viene vacío o como x-www-form-urlencoded
    let data: any
    try {
      data = JSON.parse(body)
    } catch {
      data = null
    }

    // Support multiple MP notification formats
    // 1) JSON: { type: 'payment', data: { id } }
    // 2) JSON: { topic: 'payment'|'merchant_order', resource: 'https://.../payments/{id}' }
    // 3) Query params: ?topic=payment&id=123
    const url = new URL(request.url)
    const qpTopic = url.searchParams.get('topic') || url.searchParams.get('type')
    const qpId = url.searchParams.get('id') || url.searchParams.get('data.id')

    // Normalize to { type, data: { id }, topic, resource }
    const norm = {
      type: data?.type || qpTopic || data?.topic,
      data: { id: data?.data?.id || qpId },
      topic: data?.topic || qpTopic,
      resource: data?.resource,
    }

    console.log("MercadoPago webhook received:", {
      type: data.type,
      dataId: data.data?.id,
      timestamp: new Date().toISOString()
    })

    // Validate the webhook
    const supabase = await createClient()

    // Resolve paymentId
    let paymentId: string | null = null
    if (norm.type === 'payment' && norm.data?.id) {
      paymentId = String(norm.data.id)
    } else if ((norm.topic === 'payment' || norm.type === 'payment') && norm.resource) {
      // Extract from resource URL or numeric id
      const resStr = String(norm.resource)
      const maybeId = resStr.split('/').pop()
      paymentId = maybeId && /\d+/.test(maybeId) ? maybeId : null
    } else if ((norm.topic === 'merchant_order' || norm.type === 'merchant_order') && norm.resource) {
      // Fetch merchant order and pick first payment id
      try {
        const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
        const moUrl = typeof norm.resource === 'string' ? norm.resource : ''
        const moResp = await fetch(moUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const mo = await moResp.json()
        if (Array.isArray(mo.payments) && mo.payments.length > 0) {
          paymentId = String(mo.payments[0].id)
        }
      } catch (e) {
        console.error('Error resolving merchant_order resource:', e)
      }
    } else if (qpTopic === 'payment' && qpId) {
      paymentId = String(qpId)
    }

    if (!paymentId) {
      console.error("Invalid webhook format:", data || { qpTopic, qpId })
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
        status: orderStatus
      })
      .eq("id", orderId)

    if (orderUpdateError) {
      console.error("Error updating order status:", orderUpdateError)
      return NextResponse.json({ 
        message: "Error updating order",
        details: orderUpdateError.message
      }, { status: 500 })
    }

    // If payment is approved, send confirmation emails
    if (paymentData.status === "approved") {
      console.log("Payment approved for order:", orderId)

      // Fetch order with items for email
      const { data: orderWithItems } = await supabase
        .from('orders')
        .select(`id, total, user_id, order_items (quantity, price, products (name))`)
        .eq('id', orderId)
        .single()

      const items = (orderWithItems?.order_items || []).map((it: any) => ({
        name: it.products?.name || 'Producto',
        quantity: it.quantity,
        price: it.price * it.quantity,
      }))
      const subtotal = items.reduce((s: number, it: any) => s + it.price, 0)
      // shipping = total - subtotal (aproximado)
      const shipping = Math.max(0, (orderWithItems?.total || 0) - subtotal)

      const { data: customer } = await supabase
        .from('customers')
        .select('email, name')
        .eq('id', orderWithItems?.user_id)
        .single()

      const customerName = customer?.name || 'Cliente'
      const customerEmail = customer?.email
      const toAdmin = 'info@vinorodante.com'

      // Generate customer email HTML
      const customerEmailHtml = customerEmail ? renderCustomerOrderEmail({
        customerName,
        orderId,
        subtotal,
        shipping,
        total: orderWithItems?.total || 0,
        items,
        customerEmail,
      }) : null

      // Generate admin email HTML  
      const adminEmailHtml = renderAdminOrderEmail({
        customerName,
        customerEmail: customerEmail || 'No proporcionado',
        orderId,
        subtotal,
        shipping,
        total: orderWithItems?.total || 0,
        items,
        paymentId,
      })

      // Do not let email failures cause the webhook to fail and trigger long MP retries
      try {
        const emailPromises = []

        // Send customer confirmation email
        if (customerEmail && customerEmailHtml) {
          emailPromises.push(
            sendEmail({
              to: customerEmail,
              subject: `🍷 ¡Tu pedido está confirmado! - Vino Rodante #${orderId.slice(-8)}`,
              html: customerEmailHtml,
            })
          )
        }

        // Send admin notification email
        emailPromises.push(
          sendEmail({
            to: toAdmin,
            subject: `💰 Nueva venta confirmada #${orderId.slice(-8)} - ${customerName}`,
            html: adminEmailHtml,
          })
        )

        await Promise.allSettled(emailPromises)
        console.log(`Emails sent for order ${orderId}: customer=${!!customerEmail}, admin=true`)
      } catch (emailError) {
        console.error('Email send error (non-blocking):', emailError)
        // Continue without throwing to ensure a 200 response to MP
      }
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
