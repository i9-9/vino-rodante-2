import { NextRequest, NextResponse } from 'next/server'
import { sendAccountCreatedEmail } from '@/lib/emails/send-account-created'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, isTemporaryEmail } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    const result = await sendAccountCreatedEmail({
      email,
      name,
      password,
      isTemporaryEmail: isTemporaryEmail || false
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: result.error || 'Error al enviar email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send-account-created API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
