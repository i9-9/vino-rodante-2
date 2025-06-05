import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignInForm from './SignInForm'

export const dynamic = "force-dynamic"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; return_to?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  if (user) {
    redirect(params.return_to || '/account')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <SignInForm error={params.error} returnTo={params.return_to} />
      </div>
    </div>
  )
}
