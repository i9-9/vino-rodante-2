import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { SubscriptionStatus } from '@/types/subscription';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*),
        deliveries:subscription_deliveries(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario tenga permiso
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (subscription.user_id !== user.id && !customer?.is_admin) {
      return NextResponse.json(
        { error: 'No autorizado para ver esta suscripción' },
        { status: 403 }
      );
    }

    return NextResponse.json({ subscription });

  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body as { status: SubscriptionStatus };

    if (!status) {
      return NextResponse.json(
        { error: 'Estado requerido' },
        { status: 400 }
      );
    }

    // Verificar que la suscripción exista y pertenezca al usuario
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (subscription.user_id !== user.id && !customer?.is_admin) {
      return NextResponse.json(
        { error: 'No autorizado para modificar esta suscripción' },
        { status: 403 }
      );
    }

    // Actualizar estado
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar suscripción' },
        { status: 500 }
      );
    }

    return NextResponse.json({ subscription: updatedSubscription });

  } catch (error) {
    console.error('Error al actualizar suscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que la suscripción exista y pertenezca al usuario
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (subscription.user_id !== user.id && !customer?.is_admin) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar esta suscripción' },
        { status: 403 }
      );
    }

    // Eliminar suscripción
    const { error: deleteError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Error al eliminar suscripción' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Suscripción eliminada correctamente' 
    });

  } catch (error) {
    console.error('Error al eliminar suscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 