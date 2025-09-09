import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import type { 
  SubscriptionFrequency
} from '@/types/subscription';
import { 
  calculateSubscriptionPrice,
  getMercadoPagoFrequencyConfig,
  calculateNextDeliveryDate 
} from '@/utils/subscription-helpers';

const mp = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    console.log('Starting subscription creation...');
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('User authenticated:', !!user);

    if (!user) {
      console.log('No user found');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { planId, frequency, userId } = await request.json();
    console.log('Request data:', { planId, frequency, userId });

    if (!planId || !frequency || !userId) {
      console.log('Missing required data');
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga permiso
    if (user.id !== userId) {
      console.log('User ID mismatch');
      return NextResponse.json(
        { error: 'No autorizado para crear suscripción para otro usuario' },
        { status: 403 }
      );
    }

    // Obtener el plan
    console.log('Fetching plan with ID:', planId);
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    console.log('Plan fetch result:', { plan: !!plan, error: planError });

    if (planError || !plan) {
      console.log('Plan not found or error:', planError);
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Calcular precio y configuración de frecuencia
    console.log('Calculating price for plan:', plan.name, 'frequency:', frequency);
    const price = calculateSubscriptionPrice(plan, frequency as SubscriptionFrequency);
    console.log('Calculated price:', price);
    
    const { frequency: mpFrequency, frequency_type: mpFrequencyType } = 
      getMercadoPagoFrequencyConfig(frequency as SubscriptionFrequency);
    console.log('MercadoPago config:', { mpFrequency, mpFrequencyType });

    // Por ahora, crear suscripción sin MercadoPago para testing
    // TODO: Implementar integración completa con MercadoPago
    const mpSubscriptionId = `temp_${Date.now()}_${user.id}`;
    const init_point = `${process.env.NEXT_PUBLIC_SITE_URL}/account/subscriptions?status=success&subscription_id=${mpSubscriptionId}`;

    // Crear suscripción en la base de datos
    console.log('Creating subscription in database...');
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      frequency,
      status: 'pending',
      start_date: new Date().toISOString(),
      current_period_end: calculateNextDeliveryDate(frequency as SubscriptionFrequency).toISOString(),
      next_delivery_date: calculateNextDeliveryDate(frequency as SubscriptionFrequency).toISOString(),
      mercadopago_subscription_id: mpSubscriptionId,
      is_gift: false,
      total_paid: 0
    };
    
    console.log('Subscription data:', subscriptionData);
    
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    console.log('Subscription creation result:', { subscription: !!subscription, error: subscriptionError });

    if (subscriptionError) {
      console.log('Subscription creation error:', subscriptionError);
      return NextResponse.json(
        { error: 'Error al crear la suscripción' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscription,
      paymentUrl: init_point,
      init_point
    });

  } catch (error) {
    console.error('Error al crear suscripción recurrente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
