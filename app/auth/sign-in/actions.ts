"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const returnTo = formData.get('return_to') as string || '/account'
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/auth/sign-in?error=${encodeURIComponent(error.message)}`)
  }

  if (!data.session) {
    return redirect('/auth/sign-in?error=No session created')
  }

  // Verificar que la sesión se haya establecido correctamente
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    return redirect('/auth/sign-in?error=Failed to verify session')
  }

  return redirect(returnTo)
} 