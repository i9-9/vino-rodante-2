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
import { generateTemporaryPassword, generateTemporaryEmail } from '@/lib/password-utils';
import { sendAccountCreatedEmail } from '@/lib/emails/send-account-created';

const mp = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

export async function POST(request: Request) {
  try {
    console.log('🚀 Starting REAL subscription creation with PreApproval...');
    
    const supabase = await createClient();
    
    // Intentar obtener usuario de cookies primero
    let { data: { user } } = await supabase.auth.getUser();
    
    // Si no hay usuario en cookies, intentar con header de autorización
    if (!user) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('🔑 Using Authorization header token');
        
        // Crear cliente con token específico
        const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
        user = tokenUser;
      }
    }

    console.log('👤 User authenticated:', !!user);

    const { planId, frequency, userId } = await request.json();
    console.log('📋 Request data:', { planId, frequency, userId });

    if (!planId || !frequency) {
      console.log('❌ Missing required data');
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    let finalUserId = userId;

    // Verificar que tenemos un usuario autenticado
    if (!user) {
      console.log('❌ No authenticated user found');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    finalUserId = user.id;

    if (!finalUserId) {
      console.log('❌ No user ID available');
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    // Obtener el plan
    console.log('🔍 Fetching plan with ID:', planId);
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    console.log('📦 Plan fetch result:', { plan: !!plan, error: planError });

    if (planError || !plan) {
      console.log('❌ Plan not found or error:', planError);
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Calcular precio y configuración de frecuencia
    console.log('💰 Calculating price for plan:', plan.name, 'frequency:', frequency);
    const price = calculateSubscriptionPrice(plan, frequency as SubscriptionFrequency);
    console.log('💵 Calculated price:', price);
    
    const { frequency: mpFrequency, frequency_type: mpFrequencyType } = 
      getMercadoPagoFrequencyConfig(frequency as SubscriptionFrequency);
    console.log('🔄 MercadoPago config:', { mpFrequency, mpFrequencyType });

    // Crear PreApproval en MercadoPago (SUSCRIPCIÓN REAL)
    console.log('🎯 Creating MercadoPago PreApproval (REAL subscription)...');
    console.log('🔧 MercadoPago config:', {
      accessToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      timeout: 5000
    });
    
    let init_point: string | undefined;
    let mpSubscriptionId: string | undefined;
    
    try {
      console.log('🔧 Creating PreApproval instance...');
      const preApproval = new PreApproval(mp);
      console.log('✅ PreApproval instance created successfully');
      
      const preApprovalData = {
        reason: `Suscripción ${plan.name} - ${frequency}`,
        external_reference: `${finalUserId}_${planId}_${frequency}`,
        payer_email: customerInfo?.email || user?.email!,
        auto_recurring: {
          frequency: mpFrequency,
          frequency_type: mpFrequencyType,
          transaction_amount: price,
          currency_id: 'ARS'
        },
        back_url: 'https://vino-rodante.vercel.app/account/subscriptions',
        status: 'pending'
      };

      console.log('🔍 PreApproval data validation:', {
        reason: typeof preApprovalData.reason,
        external_reference: typeof preApprovalData.external_reference,
        payer_email: typeof preApprovalData.payer_email,
        payer_email_value: preApprovalData.payer_email,
        auto_recurring: typeof preApprovalData.auto_recurring,
        back_url: typeof preApprovalData.back_url,
        status: typeof preApprovalData.status
      });

      console.log('📝 PreApproval data:', preApprovalData);
      
      const result = await preApproval.create({ body: preApprovalData });
      init_point = result.init_point;
      mpSubscriptionId = result.id;
      
      console.log('✅ MercadoPago PreApproval created (REAL subscription):', { 
        init_point: !!init_point, 
        id: mpSubscriptionId 
      });
    } catch (mpError) {
      console.error('❌ MercadoPago PreApproval creation failed:', mpError);
      console.error('❌ Error details:', {
        message: mpError instanceof Error ? mpError.message : 'Unknown error',
        status: mpError?.status,
        response: mpError?.response,
        name: mpError?.name,
        stack: mpError?.stack
      });
      
      // Extraer información más específica del error
      let errorMessage = 'Unknown error';
      if (mpError instanceof Error) {
        errorMessage = mpError.message;
      } else if (mpError?.message) {
        errorMessage = mpError.message;
      } else if (mpError?.response?.data?.message) {
        errorMessage = mpError.response.data.message;
      }
      
      throw new Error(`Failed to create subscription: ${errorMessage}`);
    }

    if (!init_point || !mpSubscriptionId) {
      console.log('❌ No init_point or ID received from MercadoPago');
      throw new Error('Error al crear suscripción recurrente en MercadoPago');
    }

    // Crear suscripción en la base de datos
    console.log('💾 Creating subscription in database...');
    console.log('🔍 Final user ID:', finalUserId);
    console.log('🔍 Plan ID:', planId);
    console.log('🔍 Frequency:', frequency);
    console.log('🔍 MercadoPago subscription ID:', mpSubscriptionId);
    
    const subscriptionData = {
      user_id: finalUserId,
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
    
    console.log('📊 Subscription data:', subscriptionData);
    console.log('🔍 Subscription data validation:', {
      user_id: typeof subscriptionData.user_id,
      plan_id: typeof subscriptionData.plan_id,
      frequency: typeof subscriptionData.frequency,
      mercadopago_subscription_id: typeof subscriptionData.mercadopago_subscription_id
    });
    
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    console.log('💾 Subscription creation result:', { subscription: !!subscription, error: subscriptionError });

    if (subscriptionError) {
      console.log('❌ Subscription creation error:', subscriptionError);
      console.log('❌ Subscription error details:', {
        message: subscriptionError.message,
        details: subscriptionError.details,
        hint: subscriptionError.hint,
        code: subscriptionError.code
      });
      return NextResponse.json(
        { 
          error: 'Error al crear la suscripción',
          details: subscriptionError.message,
          code: subscriptionError.code
        },
        { status: 500 }
      );
    }

    console.log('🎉 Success! Returning REAL subscription URL:', init_point);
    return NextResponse.json({
      subscription,
      paymentUrl: init_point,
      isRecurring: true, // Indicar que es una suscripción real
      message: 'Suscripción recurrente creada - se renovará automáticamente'
    });

  } catch (error) {
    console.error('❌ Error al crear suscripción recurrente:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
