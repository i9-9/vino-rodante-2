'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getTranslations } from '@/lib/get-translations'
import AccountClientNew from './AccountClientNew'

export default async function AccountPage() {
  const supabase = await createClient()
  const t = await getTranslations()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth/sign-in')
  }

  // Get user profile and check if admin - SOLO datos básicos inicialmente
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single()

  const isAdmin = customer?.is_admin || false

  // SOLO cargar datos básicos que se usan inmediatamente
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <AccountClientNew
      user={user}
      profile={customer || { id: user.id, email: user.email }}
      addresses={addresses || []}
      userRole={isAdmin ? 'admin' : 'user'}
      t={t}
    />
  )
}
