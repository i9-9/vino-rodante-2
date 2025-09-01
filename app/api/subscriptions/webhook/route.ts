import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { calculateNextDeliveryDate } from '@/utils/subscription-helpers';
import { sendEmail, renderSubscriptionEmail, renderAdminSubscriptionEmail } from '@/lib/emails/resend';
import type { SubscriptionFrequency } from '@/types/subscription';

const mp = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar que sea una notificación de pago
    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Notificación ignorada' });
    }

    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: body.data.id });

    // Obtener la referencia externa del pago
    const { external_reference, status } = paymentData;
    if (!external_reference) {
      throw new Error('Referencia externa no encontrada');
    }

    // Extraer información de la referencia
    const [userId, planId, frequency] = external_reference.split('_');

    const supabase = await createClient();

    // Buscar la suscripción
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .eq('frequency', frequency)
      .single();

    if (subscriptionError || !subscription) {
      throw new Error('Suscripción no encontrada');
    }

    // Actualizar estado según el pago
    let subscriptionStatus;
    switch (status) {
      case 'approved':
        subscriptionStatus = 'active';
        break;
      case 'pending':
        subscriptionStatus = 'pending';
        break;
      case 'rejected':
        subscriptionStatus = 'failed';
        break;
      default:
        subscriptionStatus = 'pending';
    }

    // Calcular próxima fecha de entrega
    const nextDeliveryDate = calculateNextDeliveryDate(
      frequency as SubscriptionFrequency,
      new Date()
    );

    // Actualizar suscripción
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: subscriptionStatus,
        current_period_end: nextDeliveryDate.toISOString(),
        next_delivery_date: nextDeliveryDate.toISOString(),
        total_paid: subscription.total_paid + (paymentData.transaction_amount || 0)
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw new Error('Error al actualizar suscripción');
    }

    // Si el pago fue aprobado, crear la próxima entrega y enviar emails
    if (status === 'approved') {
      const { error: deliveryError } = await supabase
        .from('subscription_deliveries')
        .insert([{
          subscription_id: subscription.id,
          delivery_date: nextDeliveryDate.toISOString(),
          status: 'pending',
          total_amount: paymentData.transaction_amount || 0,
          products: [] // Se llenarán cuando se asignen los vinos
        }]);

      if (deliveryError) {
        throw new Error('Error al crear entrega');
      }

      // Obtener información del cliente y plan para los emails
      try {
        const { data: customer } = await supabase
          .from('customers')
          .select('name, email')
          .eq('id', userId)
          .single();

        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('name')
          .eq('id', planId)
          .single();

        if (customer?.email && plan?.name) {
          const isFirstPayment = subscription.total_paid === 0; // Era 0 antes de actualizar
          const customerName = customer.name || 'Cliente';
          const planName = plan.name;
          const amount = paymentData.transaction_amount || 0;

          // Generar emails
          const customerEmailHtml = renderSubscriptionEmail({
            customerName,
            customerEmail: customer.email,
            planName,
            frequency,
            amount,
            nextDeliveryDate: nextDeliveryDate.toISOString(),
            subscriptionId: subscription.id,
            isFirstPayment,
          });

          const adminEmailHtml = renderAdminSubscriptionEmail({
            customerName,
            customerEmail: customer.email,
            planName,
            frequency,
            amount,
            nextDeliveryDate: nextDeliveryDate.toISOString(),
            subscriptionId: subscription.id,
            paymentId: paymentData.id?.toString() || '',
            isFirstPayment,
          });

          // Enviar emails (sin bloquear el webhook si fallan)
          const emailPromises = [
            sendEmail({
              to: customer.email,
              subject: `🍷 ${isFirstPayment ? '¡Bienvenido a tu suscripción!' : '¡Tu suscripción se ha renovado!'} - Vino Rodante`,
              html: customerEmailHtml,
            }),
            sendEmail({
              to: 'info@vinorodante.com',
              subject: `🔄 ${isFirstPayment ? 'Nueva suscripción activada' : 'Suscripción renovada'} - ${customerName}`,
              html: adminEmailHtml,
            })
          ];

          await Promise.allSettled(emailPromises);
          console.log(`Subscription emails sent for ${subscription.id}: customer=${!!customer.email}, admin=true`);
        }
      } catch (emailError) {
        console.error('Error sending subscription emails (non-blocking):', emailError);
        // No throw - continuar sin fallar el webhook
      }
    }

    return NextResponse.json({ 
      message: 'Webhook procesado correctamente',
      status: subscriptionStatus
    });

  } catch (error) {
    console.error('Error en webhook de MercadoPago:', error);
    return NextResponse.json(
      { error: 'Error al procesar webhook' },
      { status: 500 }
    );
  }
} 