import { MercadoPagoConfig, Payment, Preference } from "mercadopago"
import type { CartItem } from "./types"

// Initialize the MercadoPago client
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

export interface CreatePreferenceOptions {
  items: CartItem[]
  customer: {
    name: string
    email: string
  }
  orderId: string
  metadata?: Record<string, any>
  expires?: boolean
  expirationDateFrom?: string
  expirationDateTo?: string
}

export async function createPreference(options: CreatePreferenceOptions) {
  const { items, customer, orderId, metadata, expires, expirationDateFrom, expirationDateTo } = options
  
  const preference = new Preference(mercadopago)

  // Format items for Mercado Pago
  const mpItems = items.map((item) => ({
    id: item.id,
    title: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: "ARS",
    picture_url: item.image,
    description: item.description?.substring(0, 255) || "",
    category_id: item.category || "wines",
  }))

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Prepare preference data
  const preferenceData: any = {
    items: mpItems,
    payer: {
      name: customer.name.split(" ")[0] || "",
      surname: customer.name.split(" ").slice(1).join(" ") || "",
      email: customer.email,
    },
    external_reference: orderId,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmation?orderId=${orderId}`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=payment_failed&orderId=${orderId}`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending?orderId=${orderId}`,
    },
    statement_descriptor: "Vino Rodante",
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    payment_methods: {
      installments: 12, // Allow up to 12 installments
      default_installments: 1,
      excluded_payment_types: [
        { id: "ticket" } // Exclude cash payments for online store
      ]
    },
    metadata: {
      order_id: orderId,
      customer_email: customer.email,
      total_amount: total,
      ...metadata
    }
  }

  // Add expiration if specified
  if (expires) {
    preferenceData.expires = true
    if (expirationDateFrom) {
      preferenceData.expiration_date_from = expirationDateFrom
    }
    if (expirationDateTo) {
      preferenceData.expiration_date_to = expirationDateTo
    }
  }

  try {
    // Create the preference
    const result = await preference.create({
      body: preferenceData,
    })

    return result
  } catch (error: any) {
    console.error("Error creating MercadoPago preference:", error)
    
    // Handle specific MercadoPago errors
    if (error.response?.data) {
      const mpError = error.response.data
      throw new Error(`MercadoPago error: ${mpError.message || mpError.error || 'Unknown error'}`)
    }
    
    throw new Error(`Error creating payment preference: ${error.message}`)
  }
}

export async function getPaymentStatus(paymentId: string) {
  const payment = new Payment(mercadopago)
  
  try {
    const result = await payment.get({ id: paymentId })
    return result
  } catch (error: any) {
    console.error("Error getting payment status:", error)
    
    if (error.response?.data) {
      const mpError = error.response.data
      throw new Error(`MercadoPago error: ${mpError.message || mpError.error || 'Unknown error'}`)
    }
    
    throw new Error(`Error getting payment status: ${error.message}`)
  }
}

export async function refundPayment(paymentId: string, amount?: number) {
  const payment = new Payment(mercadopago)
  
  try {
    const refundData: any = {}
    if (amount) {
      refundData.amount = amount
    }
    
    const result = await payment.refund({ id: paymentId, body: refundData })
    return result
  } catch (error: any) {
    console.error("Error refunding payment:", error)
    
    if (error.response?.data) {
      const mpError = error.response.data
      throw new Error(`MercadoPago error: ${mpError.message || mpError.error || 'Unknown error'}`)
    }
    
    throw new Error(`Error refunding payment: ${error.message}`)
  }
}
