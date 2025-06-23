'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SubscriptionsDashboard } from '@/components/dashboard/subscriptions-dashboard';

export default async function SubscriptionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Suscripciones</h1>
      <SubscriptionsDashboard userId={user.id} />
    </div>
  );
}