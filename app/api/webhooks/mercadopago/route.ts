import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getPaymentStatus } from "@/lib/mercadopago"
import { sendEmail, renderCustomerOrderEmail, renderAdminOrderEmail } from "@/lib/emails/resend"
import { sendAccountCreatedEmail } from "@/lib/emails/send-account-created"
import { validateMercadoPagoSignature } from "@/lib/webhook-validation"

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

    // Validate webhook signature for production security
    const signature = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')
    const dataId = norm.data?.id

    if (!validateMercadoPagoSignature(body, signature, requestId, dataId)) {
      console.error('Webhook signature validation failed - rejecting request')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      )
    }

    console.log('Webhook signature validated successfully')

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

    // Parse external_reference to determine if it's an order or subscription
    const externalRef = paymentData.external_reference
    const isSubscription = externalRef.includes('_') && externalRef.split('_').length === 3
    
    let orderId: string | null = null
    let subscriptionId: string | null = null
    let userId: string | null = null
    
    if (isSubscription) {
      // Format: userId_planId_frequency
      const [parsedUserId, planId, frequency] = externalRef.split('_')
      userId = parsedUserId
      
      // Find subscription by user_id, plan_id, and frequency
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .eq('frequency', frequency)
        .single()
      
      subscriptionId = subscription?.id || null
    } else {
      // It's a regular order
      orderId = externalRef
    }

    let orderStatus = "pending"
    let subscriptionStatus = "pending"

    switch (paymentData.status) {
      case "approved":
        orderStatus = "paid"
        subscriptionStatus = "active"
        break
      case "rejected":
        orderStatus = "cancelled"
        subscriptionStatus = "cancelled"
        break
      case "refunded":
        orderStatus = "refunded"
        subscriptionStatus = "cancelled"
        break
      case "in_process":
        orderStatus = "pending"
        subscriptionStatus = "pending"
        break
      case "pending":
        orderStatus = "pending"
        subscriptionStatus = "pending"
        break
      default:
        orderStatus = "pending"
        subscriptionStatus = "pending"
    }

    console.log("Updating status:", {
      orderId,
      subscriptionId,
      orderStatus,
      subscriptionStatus,
      paymentStatus: paymentData.status,
      paymentId,
      isSubscription
    })

    // Update order or subscription in database
    if (orderId) {
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
    }

    if (subscriptionId) {
      const { error: subscriptionUpdateError } = await supabase
        .from("user_subscriptions")
        .update({ 
          status: subscriptionStatus
        })
        .eq("id", subscriptionId)

      if (subscriptionUpdateError) {
        console.error("Error updating subscription status:", subscriptionUpdateError)
        return NextResponse.json({ 
          message: "Error updating subscription",
          details: subscriptionUpdateError.message
        }, { status: 500 })
      }
    }

    // If payment is approved, send confirmation emails and handle guest account creation
    if (paymentData.status === "approved") {
      console.log("Payment approved:", { orderId, subscriptionId, isSubscription })

      // Get customer information
      const { data: customer } = await supabase
        .from('customers')
        .select('email, name')
        .eq('id', userId || (orderId ? await getOrderUserId(orderId) : null))
        .single()

      const customerName = customer?.name || 'Cliente'
      const customerEmail = customer?.email

      // Check if this is a guest user (no auth account)
      const { data: { user } } = await supabase.auth.getUser()
      const isGuestUser = !user && customerEmail

      // Handle guest account creation
      if (isGuestUser) {
        console.log("Creating account for guest user:", customerEmail)
        
        try {
          // Create auth account with temporary password
          const tempPassword = `VinoRodante${Math.random().toString(36).slice(-8)}!`
          
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: customerEmail,
            password: tempPassword,
            user_metadata: {
              name: customerName,
            },
            email_confirm: true // Skip email confirmation for guest accounts
          })

          if (authError) {
            console.error('Error creating guest auth account:', authError)
          } else {
            console.log('Guest auth account created successfully')
            
            // Send account activation email
            await sendAccountCreatedEmail({
              email: customerEmail,
              name: customerName,
              password: tempPassword,
              isTemporaryEmail: false
            })
            
            console.log('Account activation email sent to guest user')
          }
        } catch (accountError) {
          console.error('Error in guest account creation process:', accountError)
        }
      }

      // Send order/subscription confirmation emails
      try {
        const emailPromises = []

        if (orderId) {
          // Handle order confirmation emails
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
          const shipping = Math.max(0, (orderWithItems?.total || 0) - subtotal)

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
              to: 'info@vinorodante.com',
              subject: `💰 Nueva venta confirmada #${orderId.slice(-8)} - ${customerName}`,
              html: adminEmailHtml,
            })
          )
        }

        if (subscriptionId) {
          // Handle subscription confirmation emails
          const { data: subscriptionWithPlan } = await supabase
            .from('user_subscriptions')
            .select(`
              id,
              frequency,
              next_delivery_date,
              subscription_plans!inner(name, price_monthly, price_quarterly, price_weekly, price_biweekly)
            `)
            .eq('id', subscriptionId)
            .single()

          if (subscriptionWithPlan) {
            const plan = subscriptionWithPlan.subscription_plans
            const frequency = subscriptionWithPlan.frequency
            
            // Calculate price based on frequency
            let price = 0
            switch (frequency) {
              case 'weekly':
                price = plan.price_weekly
                break
              case 'biweekly':
                price = plan.price_biweekly
                break
              case 'monthly':
                price = plan.price_monthly
                break
              case 'quarterly':
                price = plan.price_quarterly
                break
            }

            // Send subscription confirmation email (you can create a specific template for this)
            if (customerEmail) {
              emailPromises.push(
                sendEmail({
                  to: customerEmail,
                  subject: `🍷 ¡Tu suscripción está activa! - Vino Rodante`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h1 style="color: #7B1E1E;">🍷 ¡Tu suscripción está activa!</h1>
                      <p>Hola ${customerName},</p>
                      <p>Tu suscripción a <strong>${plan.name}</strong> ha sido activada exitosamente.</p>
                      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Detalles de tu suscripción:</h3>
                        <p><strong>Plan:</strong> ${plan.name}</p>
                        <p><strong>Frecuencia:</strong> ${frequency}</p>
                        <p><strong>Precio:</strong> $${price.toLocaleString()}</p>
                        <p><strong>Próxima entrega:</strong> ${new Date(subscriptionWithPlan.next_delivery_date).toLocaleDateString('es-AR')}</p>
                      </div>
                      <p>¡Gracias por elegir Vino Rodante!</p>
                    </div>
                  `
                })
              )
            }
          }
        }

        await Promise.allSettled(emailPromises)
        console.log(`Emails sent: order=${!!orderId}, subscription=${!!subscriptionId}, guest=${isGuestUser}`)
      } catch (emailError) {
        console.error('Email send error (non-blocking):', emailError)
        // Continue without throwing to ensure a 200 response to MP
      }
    }

    // Helper function to get user ID from order
    async function getOrderUserId(orderId: string): Promise<string | null> {
      const { data: order } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single()
      return order?.user_id || null
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
