'use server'

import { sendEmail } from '@/lib/emails/resend'

export async function sendContactFormEmail(formData: FormData) {
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
      <div style="background-color:#7B1E1E;padding:20px;text-align:center;margin-bottom:20px;">
        <h1 style="color:#ffffff;margin:0;font-family:Georgia,serif;">🍷 Vino Rodante</h1>
        <p style="color:#ffffff;margin:8px 0 0;opacity:0.9;">Nuevo mensaje de contacto</p>
      </div>
      
      <div style="background-color:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
        <h2 style="color:#7B1E1E;margin:0 0 15px;">Información del contacto</h2>
        <p style="margin:5px 0;"><strong>Nombre:</strong> ${name}</p>
        <p style="margin:5px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin:5px 0;"><strong>Asunto:</strong> ${subject}</p>
      </div>
      
      <div style="margin-bottom:20px;">
        <h3 style="color:#7B1E1E;margin:0 0 10px;">Mensaje:</h3>
        <div style="background-color:#f5f5f5;padding:15px;border-radius:5px;border-left:4px solid #7B1E1E;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <div style="text-align:center;margin:20px 0;">
        <a href="mailto:${email}" style="display:inline-block;background-color:#7B1E1E;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">
          Responder a ${name}
        </a>
      </div>
      
      <div style="background-color:#f8f9fa;padding:15px;text-align:center;border-top:1px solid #eee;margin-top:20px;">
        <p style="color:#666;margin:0;font-size:12px;">
          Email automático del formulario de contacto - Vino Rodante<br>
          Recibido el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}
        </p>
      </div>
    </body>
    </html>`

    await sendEmail({
      to: 'info@vinorodante.com',
      subject: `Contacto: ${name} - ${subject}`,
      html,
    })

    return { success: true, message: 'Mensaje enviado exitosamente' }
  } catch (error: unknown) {
    console.error('Error sending contact form email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
