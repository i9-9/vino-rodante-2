import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccountClient from './AccountClient'

export const dynamic = "force-dynamic"

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Obtener el perfil extendido (incluyendo is_admin)
  const { data: profile } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  console.log('isAdmin prop:', !!profile?.is_admin)

  return <AccountClient user={user} isAdmin={!!profile?.is_admin} />
}
