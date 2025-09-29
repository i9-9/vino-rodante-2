import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { calculateNextDeliveryDate } from '@/utils/subscription-helpers';
import { validateMercadoPagoSignature } from '@/lib/webhook-validation';
import type { SubscriptionFrequency } from '@/types/subscription';

const mp = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    const requestId = request.headers.get('x-request-id');
    
    // Parse the body to get data ID for validation
    let dataId: string | null = null;
    try {
      const parsedBody = JSON.parse(body);
      dataId = parsedBody.data?.id;
    } catch {
      // If parsing fails, we'll still validate with null dataId
    }

    // Validate webhook signature for production security
    if (!validateMercadoPagoSignature(body, signature, requestId, dataId)) {
      console.error('Recurring webhook signature validation failed - rejecting request');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    console.log('Recurring webhook signature validated successfully');

    const data = JSON.parse(body);
    
    // Verificar que sea una notificación de suscripción recurrente
    if (data.type !== 'preapproval') {
      return NextResponse.json({ message: 'Notificación ignorada' });
    }

    const preApproval = new PreApproval(mp);
    const preApprovalData = await preApproval.get({ id: data.data.id });

    // Obtener la referencia externa de la suscripción
    const { external_reference, status } = preApprovalData;
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

    // Actualizar estado según el status de MercadoPago
    let subscriptionStatus;
    switch (status) {
      case 'authorized':
        subscriptionStatus = 'active';
        break;
      case 'paused':
        subscriptionStatus = 'paused';
        break;
      case 'cancelled':
        subscriptionStatus = 'cancelled';
        break;
      default:
        subscriptionStatus = 'pending';
    }

    // Calcular próxima fecha de entrega
    const nextDeliveryDate = calculateNextDeliveryDate(frequency as SubscriptionFrequency);

    // Actualizar suscripción en la base de datos
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: subscriptionStatus,
        current_period_end: nextDeliveryDate.toISOString(),
        next_delivery_date: nextDeliveryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw new Error('Error al actualizar suscripción');
    }

    // Si la suscripción está activa, crear una entrega
    if (subscriptionStatus === 'active') {
      // Aquí podrías crear un registro de entrega o enviar notificaciones
      console.log(`Suscripción ${subscription.id} activada para entrega`);
    }

    return NextResponse.json({ 
      message: 'Suscripción actualizada correctamente',
      subscriptionId: subscription.id,
      status: subscriptionStatus
    });

  } catch (error) {
    console.error('Error en webhook de suscripción recurrente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


