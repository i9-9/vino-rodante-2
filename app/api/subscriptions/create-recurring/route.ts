import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
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
    
    const { planId, frequency, userId } = await request.json();
    console.log('📋 Request data:', { planId, frequency, userId });

    if (!planId || !frequency || !userId) {
      console.log('❌ Missing required data');
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Para usuarios invitados, usamos el userId directamente
    // Para usuarios autenticados, verificamos que coincida
    let { data: { user } } = await supabase.auth.getUser();
    
    if (user && user.id !== userId) {
      console.log('❌ User ID mismatch');
      return NextResponse.json(
        { error: 'ID de usuario no coincide' },
        { status: 401 }
      );
    }

    console.log('👤 User type:', user ? 'authenticated' : 'guest');
    const finalUserId = userId;

    // Crear cliente de administrador para usuarios invitados (bypass RLS)
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Obtener información del cliente para el email
    // Usar cliente de administrador para usuarios invitados (bypass RLS)
    const supabaseClient = user ? supabase : adminSupabase;
    const { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .select('email, name')
      .eq('id', finalUserId)
      .single();

    if (customerError || !customer) {
      console.log('❌ Customer not found:', customerError);
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el plan
    console.log('🔍 Fetching plan with ID:', planId);
    const { data: plan, error: planError } = await supabaseClient
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
    
    // Validar monto mínimo para MercadoPago (mínimo $15 ARS)
    const MINIMUM_AMOUNT = 15;
    if (price < MINIMUM_AMOUNT) {
      console.log('❌ Amount too low for MercadoPago:', price);
      return NextResponse.json(
        { error: `El monto mínimo para suscripciones es $${MINIMUM_AMOUNT} ARS` },
        { status: 400 }
      );
    }
    
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
        payer_email: customer.email,
        auto_recurring: {
          frequency: mpFrequency,
          frequency_type: mpFrequencyType,
          transaction_amount: price,
          currency_id: 'ARS'
        },
        back_url: 'https://vinorodante.com/checkout/success',
        status: 'pending',
        // Configuración específica para Argentina
        country_id: 'AR',
        site_id: 'MLA', // MercadoLibre Argentina
        // Configuración para suscripciones recurrentes
        payment_methods: {
          installments: 1,
          default_installments: 1,
          // Para suscripciones, solo permitir métodos que funcionen con PreApproval
          excluded_payment_types: [
            { id: "ticket" } // Excluir efectivo
          ]
        }
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
    
    // Usar cliente de administrador para usuarios invitados (bypass RLS)
    console.log('🔧 Using client:', user ? 'authenticated' : 'admin (bypass RLS)');
    
    const { data: subscription, error: subscriptionError } = await supabaseClient
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
