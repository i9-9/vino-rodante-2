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
  shipping?: number
  metadata?: Record<string, any>
  expires?: boolean
  expirationDateFrom?: string
  expirationDateTo?: string
}

export async function createPreference(options: CreatePreferenceOptions) {
  const { items, customer, orderId, shipping, metadata, expires, expirationDateFrom, expirationDateTo } = options
  
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
  
  const shippingCost = Number.isFinite(Number(shipping)) ? Number(shipping) : 0

  // Calculate subtotal
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + shippingCost

  // Prepare preference data
  // Resolve base app URL robustly (handles env mismatch: NEXT_PUBLIC_APP_URL vs NEXT_PUBLIC_SITE_URL)
  const appUrlEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

  if (!appUrlEnv) {
    console.warn("MercadoPago: app URL is not defined. Set NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL.")
  }

  const baseUrl = appUrlEnv?.replace(/\/$/, "") || ""

  const preferenceData: any = {
    items: mpItems,
    payer: {
      name: customer.name.split(" ")[0] || "",
      surname: customer.name.split(" ").slice(1).join(" ") || "",
      email: customer.email,
    },
    external_reference: orderId,
    auto_return: "approved",
    // Mostrar el envío como costo separado en el resumen de MP
    shipments: shippingCost > 0 ? { mode: 'not_specified', cost: shippingCost } : undefined,
    back_urls: {
      success: `${baseUrl}/checkout/confirmation?orderId=${orderId}`,
      failure: `${baseUrl}/checkout?error=payment_failed&orderId=${orderId}`,
      pending: `${baseUrl}/checkout/pending?orderId=${orderId}`,
    },
    statement_descriptor: "Vino Rodante",
    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    payment_methods: {
      installments: 12, // Allow up to 12 installments
      default_installments: 1,
      // Sugerir "Dinero en cuenta" como opción predeterminada
      default_payment_method_id: 'account_money',
      excluded_payment_types: [
        { id: "ticket" } // Exclude cash payments for online store
      ]
    },
    metadata: {
      order_id: orderId,
      customer_email: customer.email,
      total_amount: total,
      shipping_amount: shippingCost,
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
