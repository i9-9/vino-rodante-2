import { Resend } from 'resend'

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

export async function sendEmail({ to, subject, html, text, from }: SendEmailParams) {
  const resend = getResendClient()
  const fromAddress = from || process.env.EMAIL_FROM || 'vino@vinorodante.com'

  // Use the raw API to avoid React requirement
  return resend.emails.send({ from: fromAddress, to, subject, html, text } as any)
}

export function renderOrderSummaryEmail(params: {
  title: string
  orderId: string
  subtotal: number
  shipping: number
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
}) {
  const { title, orderId, subtotal, shipping, total, items } = params
  const currency = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
  const itemsHtml = items
    .map((it) => `<tr><td>${it.name}</td><td style="text-align:center">${it.quantity}</td><td style="text-align:right">${currency(it.price)}</td></tr>`) 
    .join('')

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px">
    <h2 style="margin:0 0 16px">${title}</h2>
    <p style="color:#444;">N° de orden: <strong>${orderId}</strong></p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px" cellspacing="0" cellpadding="8">
      <thead>
        <tr style="background:#f6f6f6">
          <th style="text-align:left">Producto</th>
          <th style="text-align:center">Cant.</th>
          <th style="text-align:right">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr><td colspan="2" style="text-align:right;color:#666">Subtotal</td><td style="text-align:right">${currency(subtotal)}</td></tr>
        <tr><td colspan="2" style="text-align:right;color:#666">Envío</td><td style="text-align:right">${currency(shipping)}</td></tr>
        <tr style="font-weight:700"><td colspan="2" style="text-align:right">Total</td><td style="text-align:right">${currency(total)}</td></tr>
      </tbody>
    </table>
    <p style="color:#666;margin-top:24px">Gracias por tu compra en Vino Rodante.</p>
  </div>`
}


