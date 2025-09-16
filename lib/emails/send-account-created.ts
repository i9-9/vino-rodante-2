import { sendEmail, renderAccountCreatedEmail } from './resend';

export interface AccountCreatedEmailData {
  name: string;
  email: string;
  password: string;
  isTemporaryEmail: boolean;
  originalEmail?: string;
}

export async function sendAccountCreatedEmail(data: AccountCreatedEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const subject = data.isTemporaryEmail 
      ? `Tu cuenta en Vino Rodante - Email temporal asignado`
      : `¡Bienvenido a Vino Rodante! Tu cuenta ha sido creada`;
    
    const html = renderAccountCreatedEmail(data);
    
    console.log('📧 Sending account created email:', {
      to: data.email,
      subject,
      isTemporaryEmail: data.isTemporaryEmail
    });
    
    // Usar el sistema de email existente (Resend)
    await sendEmail({
      to: data.email,
      subject,
      html
    });
    
    console.log('✅ Account creation email sent successfully via Resend');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error sending account created email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
