import { MercadoPagoConfig, Payment, Preference } from "mercadopago"
import type { CartItem } from "./types"

// Initialize the MercadoPago client
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

export async function createPreference(
  items: CartItem[],
  customer: {
    name: string
    email: string
  },
  orderId: string,
) {
  const preference = new Preference(mercadopago)

  // Format items for Mercado Pago
  const mpItems = items.map((item) => ({
    id: item.id,
    title: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: "ARS",
    picture_url: item.image,
    description: item.description.substring(0, 255),
    category_id: item.category,
  }))

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Create the preference
  const result = await preference.create({
    body: {
      items: mpItems,
      payer: {
        name: customer.name.split(" ")[0] || "",
        surname: customer.name.split(" ").slice(1).join(" ") || "",
        email: customer.email,
      },
      external_reference: orderId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmation?orderId=${orderId}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=payment_failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending?orderId=${orderId}`,
      },
      auto_return: "approved",
      statement_descriptor: "Vino Rodante",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    },
  })

  return result
}

export async function getPaymentStatus(paymentId: string) {
  const payment = new Payment(mercadopago)
  return await payment.get({ id: paymentId })
}
