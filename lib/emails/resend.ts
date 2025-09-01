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

export function renderCustomerOrderEmail(params: {
  customerName: string
  orderId: string
  subtotal: number
  shipping: number
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  customerEmail: string
}) {
  const { customerName, orderId, subtotal, shipping, total, items, customerEmail } = params
  const currency = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
  const itemsHtml = items
    .map((it) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">${it.name}</td>
        <td style="padding:12px;text-align:center;border-bottom:1px solid #eee;">${it.quantity}</td>
        <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;">${currency(it.price)}</td>
      </tr>
    `) 
    .join('')

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Compra - Vino Rodante</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8f9fa;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
      <!-- Header -->
      <div style="background-color:#7B1E1E;padding:30px 40px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-family:Georgia,serif;font-size:28px;">🍷 Vino Rodante</h1>
        <p style="color:#ffffff;margin:8px 0 0;opacity:0.9;">Tu pedido ha sido confirmado</p>
      </div>
      
      <!-- Content -->
      <div style="padding:40px;">
        <h2 style="color:#7B1E1E;margin:0 0 20px;font-family:Arial,sans-serif;">¡Hola ${customerName}!</h2>
        
        <p style="color:#333;line-height:1.6;margin:0 0 20px;">
          Gracias por tu compra. Hemos recibido tu pago y estamos preparando tu pedido.
        </p>
        
        <div style="background-color:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#7B1E1E;margin:0 0 10px;">Detalles del Pedido</h3>
          <p style="margin:0;color:#666;"><strong>N° de orden:</strong> #${orderId.slice(-8)}</p>
          <p style="margin:5px 0 0;color:#666;"><strong>Email:</strong> ${customerEmail}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin:30px 0;background-color:#ffffff;border:1px solid #eee;">
          <thead>
            <tr style="background-color:#7B1E1E;">
              <th style="color:#ffffff;padding:15px;text-align:left;font-weight:600;">Producto</th>
              <th style="color:#ffffff;padding:15px;text-align:center;font-weight:600;">Cantidad</th>
              <th style="color:#ffffff;padding:15px;text-align:right;font-weight:600;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px;text-align:right;color:#666;border-top:1px solid #eee;">Subtotal</td>
              <td style="padding:12px;text-align:right;border-top:1px solid #eee;">${currency(subtotal)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:12px;text-align:right;color:#666;">Envío</td>
              <td style="padding:12px;text-align:right;">${currency(shipping)}</td>
            </tr>
            <tr style="background-color:#f8f9fa;">
              <td colspan="2" style="padding:15px;text-align:right;font-weight:700;font-size:18px;">Total</td>
              <td style="padding:15px;text-align:right;font-weight:700;font-size:18px;color:#7B1E1E;">${currency(total)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color:#e8f5e8;padding:20px;border-radius:8px;margin:30px 0;">
          <h3 style="color:#2d5a2d;margin:0 0 10px;">📦 ¿Qué sigue?</h3>
          <ul style="color:#2d5a2d;margin:0;padding-left:20px;">
            <li>Prepararemos tu pedido con el máximo cuidado</li>
            <li>Te enviaremos un email cuando despachemos tu pedido</li>
            <li>Recibirás tus vinos en 3-5 días hábiles</li>
          </ul>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <p style="color:#666;margin:0 0 15px;">¿Necesitas ayuda?</p>
          <a href="https://wa.me/5491234567890" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:25px;font-weight:600;">
            💬 Contactanos por WhatsApp
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#666;margin:0 0 10px;font-size:14px;">
          <strong>Vino Rodante</strong><br>
          Los mejores vinos argentinos en tu mesa
        </p>
        <p style="color:#999;margin:0;font-size:12px;">
          Email: info@vinorodante.com | Web: vinorodante.com
        </p>
      </div>
    </div>
  </body>
  </html>`
}

export function renderAdminOrderEmail(params: {
  customerName: string
  customerEmail: string
  orderId: string
  subtotal: number
  shipping: number
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  paymentId: string
}) {
  const { customerName, customerEmail, orderId, subtotal, shipping, total, items, paymentId } = params
  const currency = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
  const itemsHtml = items
    .map((it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${it.name}</td>
        <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">${it.quantity}</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">${currency(it.price)}</td>
      </tr>
    `) 
    .join('')

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Orden Recibida - Vino Rodante</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8f9fa;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
      <!-- Header -->
      <div style="background-color:#2d5a2d;padding:20px 30px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-family:Georgia,serif;font-size:24px;">💰 Nueva Orden Pagada</h1>
        <p style="color:#ffffff;margin:8px 0 0;opacity:0.9;">Panel de administración</p>
      </div>
      
      <!-- Content -->
      <div style="padding:30px;">
        <div style="background-color:#e8f5e8;padding:20px;border-radius:8px;margin:0 0 25px;">
          <h2 style="color:#2d5a2d;margin:0 0 15px;">Nueva venta confirmada</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
            <div>
              <strong>Cliente:</strong><br>
              <span style="color:#666;">${customerName}</span>
            </div>
            <div>
              <strong>Email:</strong><br>
              <span style="color:#666;">${customerEmail}</span>
            </div>
            <div>
              <strong>Orden:</strong><br>
              <span style="color:#666;font-family:monospace;">#${orderId.slice(-8)}</span>
            </div>
            <div>
              <strong>Pago ID:</strong><br>
              <span style="color:#666;font-family:monospace;">${paymentId}</span>
            </div>
          </div>
        </div>

        <h3 style="color:#333;margin:0 0 15px;">Productos vendidos:</h3>
        <table style="width:100%;border-collapse:collapse;margin:0 0 25px;border:1px solid #eee;">
          <thead>
            <tr style="background-color:#f8f9fa;">
              <th style="padding:10px;text-align:left;border-bottom:1px solid #eee;">Producto</th>
              <th style="padding:10px;text-align:center;border-bottom:1px solid #eee;">Cant.</th>
              <th style="padding:10px;text-align:right;border-bottom:1px solid #eee;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px;text-align:right;color:#666;">Subtotal</td>
              <td style="padding:8px;text-align:right;">${currency(subtotal)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px;text-align:right;color:#666;">Envío</td>
              <td style="padding:8px;text-align:right;">${currency(shipping)}</td>
            </tr>
            <tr style="background-color:#e8f5e8;">
              <td colspan="2" style="padding:12px;text-align:right;font-weight:700;">Total Vendido</td>
              <td style="padding:12px;text-align:right;font-weight:700;color:#2d5a2d;font-size:18px;">${currency(total)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color:#fff3cd;padding:20px;border-radius:8px;border-left:4px solid #ffc107;">
          <h3 style="color:#856404;margin:0 0 10px;">📋 Próximos pasos:</h3>
          <ul style="color:#856404;margin:0;padding-left:20px;">
            <li>Verificar stock de productos</li>
            <li>Preparar el pedido para envío</li>
            <li>Actualizar estado de la orden en el sistema</li>
            <li>Generar etiqueta de envío</li>
          </ul>
        </div>

        <div style="text-align:center;margin:25px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account" style="display:inline-block;background-color:#7B1E1E;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">
            Ver en Panel de Admin
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#666;margin:0;font-size:12px;">
          Email automático del sistema de ventas - Vino Rodante<br>
          Orden procesada el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}
        </p>
      </div>
    </div>
  </body>
  </html>`
}

export function renderSubscriptionEmail(params: {
  customerName: string
  customerEmail: string
  planName: string
  frequency: string
  amount: number
  nextDeliveryDate: string
  subscriptionId: string
  isFirstPayment?: boolean
}) {
  const { customerName, customerEmail, planName, frequency, amount, nextDeliveryDate, subscriptionId, isFirstPayment = false } = params
  const currency = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
  
  const title = isFirstPayment ? '¡Bienvenido a tu suscripción!' : '¡Tu suscripción se ha renovado!'
  const message = isFirstPayment 
    ? 'Tu suscripción ha sido activada y pronto recibirás tu primera caja de vinos.'
    : 'Tu suscripción se ha renovado exitosamente. Tu próxima caja está en camino.'

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suscripción ${isFirstPayment ? 'Activada' : 'Renovada'} - Vino Rodante</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8f9fa;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
      <!-- Header -->
      <div style="background-color:#7B1E1E;padding:30px 40px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-family:Georgia,serif;font-size:28px;">🍷 Vino Rodante</h1>
        <p style="color:#ffffff;margin:8px 0 0;opacity:0.9;">${title}</p>
      </div>
      
      <!-- Content -->
      <div style="padding:40px;">
        <h2 style="color:#7B1E1E;margin:0 0 20px;font-family:Arial,sans-serif;">¡Hola ${customerName}!</h2>
        
        <p style="color:#333;line-height:1.6;margin:0 0 20px;">
          ${message}
        </p>
        
        <div style="background-color:#f8f9fa;padding:25px;border-radius:8px;margin:25px 0;">
          <h3 style="color:#7B1E1E;margin:0 0 15px;">Detalles de tu Suscripción</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
            <div>
              <strong>Plan:</strong><br>
              <span style="color:#666;">${planName}</span>
            </div>
            <div>
              <strong>Frecuencia:</strong><br>
              <span style="color:#666;">${frequency}</span>
            </div>
            <div>
              <strong>Monto:</strong><br>
              <span style="color:#7B1E1E;font-size:18px;font-weight:bold;">${currency(amount)}</span>
            </div>
            <div>
              <strong>Próxima entrega:</strong><br>
              <span style="color:#666;">${new Date(nextDeliveryDate).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
          <div style="margin-top:15px;">
            <strong>Suscripción ID:</strong><br>
            <span style="color:#666;font-family:monospace;font-size:12px;">#${subscriptionId.slice(-8)}</span>
          </div>
        </div>

        ${isFirstPayment ? `
        <div style="background-color:#e8f5e8;padding:20px;border-radius:8px;margin:30px 0;">
          <h3 style="color:#2d5a2d;margin:0 0 10px;">📦 ¿Qué esperar?</h3>
          <ul style="color:#2d5a2d;margin:0;padding-left:20px;">
            <li>Vinos cuidadosamente seleccionados por nuestros expertos</li>
            <li>Entregas puntuales según tu frecuencia elegida</li>
            <li>Información detallada sobre cada vino incluido</li>
            <li>Soporte personalizado cuando lo necesites</li>
          </ul>
        </div>
        ` : `
        <div style="background-color:#fff3cd;padding:20px;border-radius:8px;margin:30px 0;">
          <h3 style="color:#856404;margin:0 0 10px;">🔄 Renovación Exitosa</h3>
          <p style="color:#856404;margin:0;">
            Tu suscripción ha sido renovada y seguirás recibiendo tus vinos favoritos. 
            La próxima entrega está programada para el ${new Date(nextDeliveryDate).toLocaleDateString('es-AR')}.
          </p>
        </div>
        `}

        <div style="text-align:center;margin:30px 0;">
          <p style="color:#666;margin:0 0 15px;">Gestiona tu suscripción</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/subscriptions" style="display:inline-block;background-color:#7B1E1E;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;margin-right:10px;">
            Ver Mi Suscripción
          </a>
          <a href="https://wa.me/5491234567890" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">
            💬 Soporte
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#666;margin:0 0 10px;font-size:14px;">
          <strong>Vino Rodante</strong><br>
          Los mejores vinos argentinos en tu mesa
        </p>
        <p style="color:#999;margin:0;font-size:12px;">
          Email: info@vinorodante.com | Web: vinorodante.com
        </p>
      </div>
    </div>
  </body>
  </html>`
}

export function renderAdminSubscriptionEmail(params: {
  customerName: string
  customerEmail: string
  planName: string
  frequency: string
  amount: number
  nextDeliveryDate: string
  subscriptionId: string
  paymentId: string
  isFirstPayment?: boolean
}) {
  const { customerName, customerEmail, planName, frequency, amount, nextDeliveryDate, subscriptionId, paymentId, isFirstPayment = false } = params
  const currency = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
  
  const action = isFirstPayment ? 'Nueva suscripción activada' : 'Suscripción renovada'

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${action} - Vino Rodante Admin</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8f9fa;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
      <!-- Header -->
      <div style="background-color:#2d5a2d;padding:20px 30px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-family:Georgia,serif;font-size:24px;">🔄 ${action}</h1>
        <p style="color:#ffffff;margin:8px 0 0;opacity:0.9;">Sistema de suscripciones</p>
      </div>
      
      <!-- Content -->
      <div style="padding:30px;">
        <div style="background-color:#e8f5e8;padding:20px;border-radius:8px;margin:0 0 25px;">
          <h2 style="color:#2d5a2d;margin:0 0 15px;">${action}</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
            <div>
              <strong>Cliente:</strong><br>
              <span style="color:#666;">${customerName}</span>
            </div>
            <div>
              <strong>Email:</strong><br>
              <span style="color:#666;">${customerEmail}</span>
            </div>
            <div>
              <strong>Plan:</strong><br>
              <span style="color:#666;">${planName}</span>
            </div>
            <div>
              <strong>Frecuencia:</strong><br>
              <span style="color:#666;">${frequency}</span>
            </div>
            <div>
              <strong>Monto pagado:</strong><br>
              <span style="color:#2d5a2d;font-weight:bold;">${currency(amount)}</span>
            </div>
            <div>
              <strong>Próxima entrega:</strong><br>
              <span style="color:#666;">${new Date(nextDeliveryDate).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
          <div style="margin-top:15px;display:grid;grid-template-columns:1fr 1fr;gap:15px;">
            <div>
              <strong>Suscripción ID:</strong><br>
              <span style="color:#666;font-family:monospace;">${subscriptionId.slice(-8)}</span>
            </div>
            <div>
              <strong>Pago ID:</strong><br>
              <span style="color:#666;font-family:monospace;">${paymentId}</span>
            </div>
          </div>
        </div>

        <div style="background-color:#fff3cd;padding:20px;border-radius:8px;border-left:4px solid #ffc107;">
          <h3 style="color:#856404;margin:0 0 10px;">📋 Próximos pasos:</h3>
          <ul style="color:#856404;margin:0;padding-left:20px;">
            ${isFirstPayment ? `
            <li>Activar la suscripción del cliente</li>
            <li>Preparar la primera caja de vinos</li>
            <li>Configurar entregas automáticas</li>
            ` : `
            <li>Verificar renovación exitosa</li>
            <li>Preparar próxima caja de vinos</li>
            <li>Confirmar fecha de entrega</li>
            `}
            <li>Actualizar inventario si es necesario</li>
          </ul>
        </div>

        <div style="text-align:center;margin:25px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account" style="display:inline-block;background-color:#7B1E1E;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">
            Ver en Panel de Admin
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#666;margin:0;font-size:12px;">
          Email automático del sistema de suscripciones - Vino Rodante<br>
          Procesado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}
        </p>
      </div>
    </div>
  </body>
  </html>`
}

export function renderNewsletterWelcomeEmail(params: {
  email: string
}) {
  const { email } = params

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a Vino Rodante!</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8f9fa;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
      <!-- Header -->
      <div style="background-color:#7B1E1E;padding:30px 40px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-family:Georgia,serif;font-size:28px;">🍷 Vino Rodante</h1>
        <p style="color:#ffffff;margin:8px 0 0;opacity:0.9;">¡Bienvenido a nuestro newsletter!</p>
      </div>
      
      <!-- Content -->
      <div style="padding:40px;">
        <h2 style="color:#7B1E1E;margin:0 0 20px;font-family:Arial,sans-serif;">¡Gracias por suscribirte!</h2>
        
        <p style="color:#333;line-height:1.6;margin:0 0 20px;">
          Estamos emocionados de tenerte en nuestra comunidad de amantes del vino. Ahora recibirás:
        </p>

        <div style="background-color:#f8f9fa;padding:25px;border-radius:8px;margin:25px 0;">
          <h3 style="color:#7B1E1E;margin:0 0 15px;">Lo que recibirás:</h3>
          <ul style="color:#333;margin:0;padding-left:20px;line-height:1.8;">
            <li>Ofertas exclusivas y descuentos especiales</li>
            <li>Lanzamientos de nuevos vinos y colecciones</li>
            <li>Tips de maridaje y cata de vinos</li>
            <li>Historias sobre nuestros productores</li>
            <li>Invitaciones a eventos y degustaciones</li>
          </ul>
        </div>

        <div style="background-color:#e8f5e8;padding:20px;border-radius:8px;margin:30px 0;">
          <h3 style="color:#2d5a2d;margin:0 0 10px;">🎁 ¡Oferta de bienvenida!</h3>
          <p style="color:#2d5a2d;margin:0;">
            Como nuevo suscriptor, obtén un <strong>15% de descuento</strong> en tu primera compra 
            con el código <strong>BIENVENIDO15</strong>
          </p>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" style="display:inline-block;background-color:#7B1E1E;color:#ffffff;padding:15px 30px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
            Explorar Vinos
          </a>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <p style="color:#666;margin:0 0 15px;">¿Necesitas ayuda?</p>
          <a href="https://wa.me/5491234567890" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:25px;font-weight:600;">
            💬 Contactanos por WhatsApp
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#666;margin:0 0 10px;font-size:14px;">
          <strong>Vino Rodante</strong><br>
          Los mejores vinos argentinos en tu mesa
        </p>
        <p style="color:#999;margin:0;font-size:12px;">
          Email: info@vinorodante.com | Web: vinorodante.com<br>
          Te suscribiste con: ${email}
        </p>
        <p style="color:#999;margin:10px 0 0;font-size:11px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#999;">
            Cancelar suscripción
          </a>
        </p>
      </div>
    </div>
  </body>
  </html>`
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


