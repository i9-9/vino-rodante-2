/**
 * Ejemplos de uso del sistema de emails de Vino Rodante
 * 
 * IMPORTANTE: Estos son ejemplos de código. 
 * Los emails de compras y suscripciones se envían automáticamente.
 */

import { sendEmail, renderCustomerOrderEmail, renderAdminOrderEmail, renderSubscriptionEmail, renderAdminSubscriptionEmail, renderNewsletterWelcomeEmail } from './resend'

// Ejemplo 1: Enviar email de confirmación de orden manualmente
export async function sendOrderConfirmationEmails(orderData: {
  orderId: string
  customerName: string
  customerEmail: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  shipping: number
  total: number
  paymentId: string
}) {
  const { orderId, customerName, customerEmail, items, subtotal, shipping, total, paymentId } = orderData

  try {
    // Email al cliente
    const customerEmailHtml = renderCustomerOrderEmail({
      customerName,
      orderId,
      subtotal,
      shipping,
      total,
      items,
      customerEmail,
    })

    // Email al admin
    const adminEmailHtml = renderAdminOrderEmail({
      customerName,
      customerEmail,
      orderId,
      subtotal,
      shipping,
      total,
      items,
      paymentId,
    })

    // Enviar ambos emails en paralelo
    await Promise.allSettled([
      sendEmail({
        to: customerEmail,
        subject: `🍷 ¡Tu pedido está confirmado! - Vino Rodante #${orderId.slice(-8)}`,
        html: customerEmailHtml,
      }),
      sendEmail({
        to: 'info@vinorodante.com',
        subject: `💰 Nueva venta confirmada #${orderId.slice(-8)} - ${customerName}`,
        html: adminEmailHtml,
      })
    ])

    console.log('Order confirmation emails sent successfully')
  } catch (error) {
    console.error('Error sending order emails:', error)
    throw error
  }
}

// Ejemplo 2: Enviar email de bienvenida a suscripción
export async function sendSubscriptionWelcomeEmails(subscriptionData: {
  customerName: string
  customerEmail: string
  planName: string
  frequency: string
  amount: number
  nextDeliveryDate: string
  subscriptionId: string
  paymentId: string
  isFirstPayment: boolean
}) {
  const { customerName, customerEmail, planName, frequency, amount, nextDeliveryDate, subscriptionId, paymentId, isFirstPayment } = subscriptionData

  try {
    // Email al cliente
    const customerEmailHtml = renderSubscriptionEmail({
      customerName,
      customerEmail,
      planName,
      frequency,
      amount,
      nextDeliveryDate,
      subscriptionId,
      isFirstPayment,
    })

    // Email al admin
    const adminEmailHtml = renderAdminSubscriptionEmail({
      customerName,
      customerEmail,
      planName,
      frequency,
      amount,
      nextDeliveryDate,
      subscriptionId,
      paymentId,
      isFirstPayment,
    })

    const welcomeText = isFirstPayment ? '¡Bienvenido a tu suscripción!' : '¡Tu suscripción se ha renovado!'
    const adminText = isFirstPayment ? 'Nueva suscripción activada' : 'Suscripción renovada'

    // Enviar ambos emails en paralelo
    await Promise.allSettled([
      sendEmail({
        to: customerEmail,
        subject: `🍷 ${welcomeText} - Vino Rodante`,
        html: customerEmailHtml,
      }),
      sendEmail({
        to: 'info@vinorodante.com',
        subject: `🔄 ${adminText} - ${customerName}`,
        html: adminEmailHtml,
      })
    ])

    console.log('Subscription emails sent successfully')
  } catch (error) {
    console.error('Error sending subscription emails:', error)
    throw error
  }
}

// Ejemplo 3: Enviar email de bienvenida al newsletter
export async function sendNewsletterWelcomeEmail(email: string) {
  try {
    const html = renderNewsletterWelcomeEmail({ email })

    await sendEmail({
      to: email,
      subject: '🍷 ¡Bienvenido a Vino Rodante!',
      html,
    })

    console.log('Newsletter welcome email sent successfully')
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error)
    throw error
  }
}

// Ejemplo 4: Enviar email personalizado simple
export async function sendCustomEmail(params: {
  to: string
  subject: string
  message: string
  customerName?: string
}) {
  const { to, subject, message, customerName = 'Cliente' } = params

  try {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f8f9fa;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
        <!-- Header -->
        <div style="background-color:#7B1E1E;padding:30px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-family:Georgia,serif;font-size:28px;">🍷 Vino Rodante</h1>
        </div>
        
        <!-- Content -->
        <div style="padding:40px;">
          <h2 style="color:#7B1E1E;margin:0 0 20px;font-family:Arial,sans-serif;">Hola ${customerName}</h2>
          <div style="color:#333;line-height:1.6;">${message}</div>
        </div>
        
        <!-- Footer -->
        <div style="background-color:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#666;margin:0;font-size:14px;">
            <strong>Vino Rodante</strong><br>
            Los mejores vinos argentinos en tu mesa
          </p>
          <p style="color:#999;margin:10px 0 0;font-size:12px;">
            Email: info@vinorodante.com | Web: vinorodante.com
          </p>
        </div>
      </div>
    </body>
    </html>`

    await sendEmail({
      to,
      subject,
      html,
    })

    console.log('Custom email sent successfully')
  } catch (error) {
    console.error('Error sending custom email:', error)
    throw error
  }
}

// Ejemplo 5: Server Action para enviar email desde un formulario
export async function sendContactFormEmail(formData: FormData) {
  'use server'
  
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!name || !email || !subject || !message) {
      throw new Error('Todos los campos son requeridos')
    }

    // Email al admin con el mensaje del contacto
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nuevo mensaje de contacto</title>
    </head>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Asunto:</strong> ${subject}</p>
      <p><strong>Mensaje:</strong></p>
      <div style="background-color:#f5f5f5;padding:15px;border-radius:5px;">
        ${message}
      </div>
    </body>
    </html>`

    await sendEmail({
      to: 'info@vinorodante.com',
      subject: `Contacto: ${subject} - ${name}`,
      html,
    })

    return { success: true, message: 'Mensaje enviado exitosamente' }
  } catch (error: any) {
    console.error('Error sending contact form email:', error)
    return { success: false, error: error.message }
  }
}

// Ejemplo 6: Notificar low stock a admin
export async function sendLowStockAlert(productData: {
  productName: string
  currentStock: number
  productId: string
}) {
  const { productName, currentStock, productId } = productData

  try {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>⚠️ Alerta de Stock Bajo</title>
    </head>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background-color:#fff3cd;padding:20px;border-radius:8px;border-left:4px solid #ffc107;">
        <h2 style="color:#856404;margin:0 0 15px;">⚠️ Stock Bajo Detectado</h2>
        <p><strong>Producto:</strong> ${productName}</p>
        <p><strong>Stock actual:</strong> ${currentStock} unidades</p>
        <p><strong>ID del producto:</strong> ${productId}</p>
        <p style="margin-top:20px;">
          Es recomendable reponer el stock de este producto pronto.
        </p>
        <div style="margin-top:20px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account" 
             style="background-color:#7B1E1E;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            Ver en Panel de Admin
          </a>
        </div>
      </div>
    </body>
    </html>`

    await sendEmail({
      to: 'info@vinorodante.com',
      subject: `⚠️ Stock bajo: ${productName}`,
      html,
    })

    console.log('Low stock alert sent successfully')
  } catch (error) {
    console.error('Error sending low stock alert:', error)
    throw error
  }
}

/* 
NOTAS DE USO:

1. Para usar estos ejemplos en Server Actions o API Routes:
   - Importa la función que necesites
   - Llama la función con los datos requeridos
   - Maneja errores apropiadamente

2. Para usar en Client Components:
   - Crea un Server Action que llame estas funciones
   - Usa el hook useTransition para manejar el loading state

3. Los emails se configuran desde las variables de entorno:
   - RESEND_API_KEY: Tu API key de Resend
   - EMAIL_FROM: Email remitente (default: info@vinorodante.com)
   - NEXT_PUBLIC_SITE_URL: URL de tu sitio

4. Todos los templates son responsive y se ven bien en móviles.

5. Para debugging, revisa los logs en la consola del servidor.
*/
