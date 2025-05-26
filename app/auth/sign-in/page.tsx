import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignInForm from './SignInForm'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string; return_to?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect(searchParams.return_to || '/account')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <SignInForm error={searchParams.error} returnTo={searchParams.return_to} />
      </div>
    </div>
  )
}
