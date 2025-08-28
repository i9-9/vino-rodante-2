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
  const fromAddress = from || process.env.EMAIL_FROM || 'Vino Rodante <info@vinorodante.com>'

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

export function renderBoxNotificationEmail(params: {
  action: 'created' | 'updated' | 'deleted'
  boxName: string
  boxId: string
  totalWines: number
  price: number
  discountPercentage?: number
  adminName?: string
}) {
  const { action, boxName, boxId, totalWines, price, discountPercentage, adminName } = params
  const currency = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
  
  const actionText = {
    created: 'creado',
    updated: 'actualizado',
    deleted: 'eliminado'
  }[action]

  const discountText = discountPercentage && discountPercentage > 0 
    ? `<p style="color:#666;">Descuento aplicado: <strong>${discountPercentage}%</strong></p>`
    : ''

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#7B1E1E;margin:0;">🍷 Vino Rodante</h1>
      <p style="color:#666;margin:8px 0 0;">Box ${actionText} exitosamente</p>
    </div>
    
    <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:24px">
      <h2 style="margin:0 0 16px;color:#333;">${boxName}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <strong>ID del Box:</strong><br>
          <span style="color:#666;font-family:monospace;">${boxId.slice(-8)}</span>
        </div>
        <div>
          <strong>Vinos incluidos:</strong><br>
          <span style="color:#666;">${totalWines} vinos</span>
        </div>
        <div>
          <strong>Precio:</strong><br>
          <span style="color:#7B1E1E;font-size:18px;font-weight:bold;">${currency(price)}</span>
        </div>
        <div>
          <strong>Acción:</strong><br>
          <span style="color:#666;text-transform:capitalize;">${actionText}</span>
        </div>
      </div>
      ${discountText}
    </div>

    ${adminName ? `
    <div style="background:#e8f5e8;padding:16px;border-radius:8px;margin-bottom:24px">
      <p style="margin:0;color:#2d5a2d;">
        <strong>Administrador:</strong> ${adminName}
      </p>
    </div>
    ` : ''}

    <div style="text-align:center;margin-top:24px;padding-top:24px;border-top:1px solid #eee">
      <p style="color:#666;margin:0;">
        Sistema de gestión de Vino Rodante<br>
        <small>Este es un email automático del sistema</small>
      </p>
    </div>
  </div>`
}


