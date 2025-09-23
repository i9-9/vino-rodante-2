import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
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
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    console.log('🚀 Starting subscription creation...');
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('👤 User authenticated:', !!user);

    const { planId, frequency, userId, customerInfo } = await request.json();
    console.log('📋 Request data:', { planId, frequency, userId, customerInfo: !!customerInfo });

    if (!planId || !frequency) {
      console.log('❌ Missing required data');
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    let finalUserId = userId;

    // Si no hay usuario autenticado, crear cuenta automáticamente
    if (!user && customerInfo) {
      console.log('Creating account for guest user');
      
      const tempPassword = generateTemporaryPassword();
      let isTemporaryEmail = false;
      let originalEmail = customerInfo.email;
      
      // Create user account with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: customerInfo.email,
        password: tempPassword,
        options: {
          data: {
            name: customerInfo.name,
          }
        }
      });

      if (authError) {
        // If user already exists, try to sign in
        if (authError.message.includes('already registered')) {
          console.log("User already exists, trying to sign in");
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: customerInfo.email,
            password: tempPassword,
          });
          
          if (signInError) {
            // If sign in fails, create a new account with different email
            const tempEmail = generateTemporaryEmail(customerInfo.email);
            isTemporaryEmail = true;
            
            const { data: newAuthData, error: newAuthError } = await supabase.auth.signUp({
              email: tempEmail,
              password: tempPassword,
              options: {
                data: {
                  name: customerInfo.name,
                }
              }
            });
            
            if (newAuthError) {
              throw new Error("Error creating guest account");
            }
            
            finalUserId = newAuthData.user?.id;
            customerInfo.email = tempEmail; // Update email for customer record
          } else {
            finalUserId = signInData.user?.id;
          }
        } else {
          throw new Error("Error creating account");
        }
      } else {
        finalUserId = authData.user?.id;
      }

      // Create customer record
      if (finalUserId) {
        console.log('Creating customer record for user:', finalUserId);
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .upsert({
            id: finalUserId,
            name: customerInfo.name,
            email: customerInfo.email,
          })
          .select();

        if (customerError) {
          console.error('❌ Error creating customer:', customerError);
          console.error('❌ Customer error details:', {
            message: customerError.message,
            details: customerError.details,
            hint: customerError.hint,
            code: customerError.code
          });
          throw new Error(`Error al crear el registro del cliente: ${customerError.message}`);
        } else {
          console.log('✅ Customer record created successfully:', customerData);
          
          // Crear dirección para el usuario
          try {
            const { error: addressError } = await supabase.from("addresses").insert({
              customer_id: finalUserId,
              line1: customerInfo.address1,
              line2: customerInfo.address2 || '',
              city: customerInfo.city,
              state: customerInfo.state,
              postal_code: customerInfo.postalCode,
              country: customerInfo.country || 'Argentina',
              is_default: true,
            });

            if (addressError) {
              console.error('❌ Error creating address:', addressError);
              // No fallar la suscripción si la dirección falla
            } else {
              console.log('✅ Address created successfully');
            }
          } catch (addressError) {
            console.error('❌ Error creating address:', addressError);
            // No fallar la suscripción si la dirección falla
          }

          // Enviar email con información de la cuenta creada
          try {
            await sendAccountCreatedEmail({
              name: customerInfo.name,
              email: customerInfo.email,
              password: tempPassword,
              isTemporaryEmail,
              originalEmail: isTemporaryEmail ? originalEmail : undefined
            });
            console.log('✅ Account creation email sent successfully');
          } catch (emailError) {
            console.error('❌ Error sending account creation email:', emailError);
            // No fallar la suscripción si el email falla
          }
        }
      }
    } else if (user) {
      finalUserId = user.id;
    } else {
      console.log('❌ No user found and no customer info provided');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

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

    // Crear preferencia en MercadoPago
    console.log('🎯 Creating MercadoPago preference...');
    const preference = new Preference(mp);
    const preferenceData = {
      items: [{
        id: planId,
        title: `Suscripción ${plan.name} - ${frequency}`,
        quantity: 1,
        unit_price: price, // El precio ya está en pesos
        currency_id: 'ARS'
      }],
      payer: {
        email: customerInfo?.email || user?.email!
      },
      external_reference: `${finalUserId}_${planId}_${frequency}`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/account/subscriptions?status=success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/account/subscriptions?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/account/subscriptions?status=pending`
      },
      payment_methods: {
        installments: 1,
        default_installments: 1
      },
      metadata: {
        user_id: finalUserId,
        plan_id: planId,
        frequency,
        frequency_type: mpFrequencyType,
        frequency_value: mpFrequency
      }
    };

    console.log('📝 Preference data:', preferenceData);
    
    const { init_point, id: mpSubscriptionId } = await preference.create({ body: preferenceData });
    console.log('✅ MercadoPago preference created:', { init_point: !!init_point, id: mpSubscriptionId });

    if (!init_point || !mpSubscriptionId) {
      console.log('❌ No init_point or ID received from MercadoPago');
      throw new Error('Error al crear preferencia en MercadoPago');
    }

    // Crear suscripción en la base de datos
    console.log('💾 Creating subscription in database...');
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
    
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    console.log('💾 Subscription creation result:', { subscription: !!subscription, error: subscriptionError });

    if (subscriptionError) {
      console.log('❌ Subscription creation error:', subscriptionError);
      return NextResponse.json(
        { error: 'Error al crear la suscripción' },
        { status: 500 }
      );
    }

    console.log('🎉 Success! Returning payment URL:', init_point);
    return NextResponse.json({
      subscription,
      paymentUrl: init_point
    });

  } catch (error) {
    console.error('Error al crear suscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 