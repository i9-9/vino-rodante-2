import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { 
  SubscriptionFrequency, 
  MercadoPagoPreApprovalPayload 
} from '@/types/subscription';
import { 
  calculateSubscriptionPrice,
  getMercadoPagoFrequencyConfig,
  calculateNextDeliveryDate 
} from '@/utils/subscription-helpers';

const mp = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { planId, frequency, userId } = await request.json();

    if (!planId || !frequency || !userId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga permiso
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para crear suscripción para otro usuario' },
        { status: 403 }
      );
    }

    // Obtener el plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Calcular precio y configuración de frecuencia
    const price = calculateSubscriptionPrice(plan, frequency as SubscriptionFrequency);
    const { frequency: mpFrequency, frequency_type: mpFrequencyType } = 
      getMercadoPagoFrequencyConfig(frequency as SubscriptionFrequency);

    // Crear preferencia en MercadoPago
    const preference = new Preference(mp);
    const preferenceData = {
      items: [{
        id: planId,
        title: `Suscripción ${plan.name} - ${frequency}`,
        quantity: 1,
        unit_price: price / 100, // Convertir de centavos a pesos
        currency_id: 'ARS'
      }],
      payer: {
        email: user.email!
      },
      external_reference: `${user.id}_${planId}_${frequency}`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/account/subscriptions`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/account/subscriptions`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/account/subscriptions`
      },
      auto_return: 'approved',
      payment_methods: {
        installments: 1,
        default_installments: 1
      },
      metadata: {
        user_id: userId,
        plan_id: planId,
        frequency,
        frequency_type: mpFrequencyType,
        frequency_value: mpFrequency
      }
    };

    const { init_point, id: mpSubscriptionId } = await preference.create(preferenceData);

    if (!init_point || !mpSubscriptionId) {
      throw new Error('Error al crear preferencia en MercadoPago');
    }

    // Crear suscripción en la base de datos
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert([{
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
      }])
      .select()
      .single();

    if (subscriptionError) {
      return NextResponse.json(
        { error: 'Error al crear la suscripción' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscription,
      init_point
    });

  } catch (error) {
    console.error('Error al crear suscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 