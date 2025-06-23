'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { 
  SubscriptionPlan, 
  UserSubscription, 
  SubscriptionDelivery,
  SubscriptionFrequency,
  SubscriptionStatus,
  ApiResponse
} from '@/types/subscription';

interface UseSubscriptionPlansResult {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPlan: (plan: Omit<SubscriptionPlan, 'id'>) => Promise<ApiResponse<SubscriptionPlan>>;
  updatePlan: (id: string, plan: Partial<SubscriptionPlan>) => Promise<ApiResponse<SubscriptionPlan>>;
  deletePlan: (id: string) => Promise<ApiResponse<void>>;
}

export function useSubscriptionPlans(): UseSubscriptionPlansResult {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order', { ascending: true });

      if (supabaseError) throw new Error(supabaseError.message);
      setPlans(data as SubscriptionPlan[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los planes');
    } finally {
      setIsLoading(false);
    }
  };

  const createPlan = async (plan: Omit<SubscriptionPlan, 'id'>): Promise<ApiResponse<SubscriptionPlan>> => {
    try {
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from('subscription_plans')
        .insert([plan])
        .select()
        .single();

      if (supabaseError) throw new Error(supabaseError.message);
      await fetchPlans();
      return { data: data as SubscriptionPlan, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error al crear el plan' 
      };
    }
  };

  const updatePlan = async (id: string, plan: Partial<SubscriptionPlan>): Promise<ApiResponse<SubscriptionPlan>> => {
    try {
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from('subscription_plans')
        .update(plan)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw new Error(supabaseError.message);
      await fetchPlans();
      return { data: data as SubscriptionPlan, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error al actualizar el plan' 
      };
    }
  };

  const deletePlan = async (id: string): Promise<ApiResponse<void>> => {
    try {
      const supabase = createClient();
      const { error: supabaseError } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (supabaseError) throw new Error(supabaseError.message);
      await fetchPlans();
      return { data: null, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error al eliminar el plan' 
      };
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    isLoading,
    error,
    refetch: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan
  };
}

interface UseUserSubscriptionsResult {
  subscriptions: UserSubscription[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createSubscription: (userId: string, planId: string, frequency: SubscriptionFrequency) => Promise<ApiResponse<UserSubscription>>;
  updateSubscription: (id: string, status: SubscriptionStatus) => Promise<ApiResponse<UserSubscription>>;
  cancelSubscription: (id: string) => Promise<ApiResponse<void>>;
}

export function useUserSubscriptions(userId?: string): UseUserSubscriptionsResult {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    if (!userId) {
      setSubscriptions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (supabaseError) throw new Error(supabaseError.message);
      setSubscriptions(data as UserSubscription[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las suscripciones');
    } finally {
      setIsLoading(false);
    }
  };

  const createSubscription = async (
    userId: string, 
    planId: string, 
    frequency: SubscriptionFrequency
  ): Promise<ApiResponse<UserSubscription>> => {
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId, frequency })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      await fetchSubscriptions();
      return { data: data.subscription, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error al crear la suscripción' 
      };
    }
  };

  const updateSubscription = async (
    id: string, 
    status: SubscriptionStatus
  ): Promise<ApiResponse<UserSubscription>> => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      await fetchSubscriptions();
      return { data: data.subscription, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error al actualizar la suscripción' 
      };
    }
  };

  const cancelSubscription = async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      
      await fetchSubscriptions();
      return { data: null, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error al cancelar la suscripción' 
      };
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [userId]);

  return {
    subscriptions,
    isLoading,
    error,
    refetch: fetchSubscriptions,
    createSubscription,
    updateSubscription,
    cancelSubscription
  };
}

interface UseSubscriptionDeliveriesResult {
  deliveries: SubscriptionDelivery[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSubscriptionDeliveries(subscriptionId?: string): UseSubscriptionDeliveriesResult {
  const [deliveries, setDeliveries] = useState<SubscriptionDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    if (!subscriptionId) {
      setDeliveries([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from('subscription_deliveries')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('delivery_date', { ascending: false });

      if (supabaseError) throw new Error(supabaseError.message);
      setDeliveries(data as SubscriptionDelivery[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las entregas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [subscriptionId]);

  return {
    deliveries,
    isLoading,
    error,
    refetch: fetchDeliveries
  };
}

export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data } = await supabase
            .from('customers')
            .select('is_admin')
            .eq('id', user.id)
            .single();
            
          setIsAdmin(data?.is_admin ?? false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, isLoading };
} 