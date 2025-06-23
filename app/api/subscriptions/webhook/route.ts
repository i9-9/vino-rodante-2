import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { calculateNextDeliveryDate } from '@/utils/subscription-helpers';
import type { SubscriptionFrequency } from '@/types/subscription';

const mp = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar que sea una notificación de pago
    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Notificación ignorada' });
    }

    const payment = new Payment(mp);
    const { response: paymentData } = await payment.get({ id: body.data.id });

    // Obtener la referencia externa del pago
    const { external_reference, status } = paymentData;
    if (!external_reference) {
      throw new Error('Referencia externa no encontrada');
    }

    // Extraer información de la referencia
    const [userId, planId, frequency] = external_reference.split('_');

    const supabase = createClient();

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

    // Si el pago fue aprobado, crear la próxima entrega
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