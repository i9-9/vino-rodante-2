"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Helper para redirección con mensaje
export async function redirectWithMessage(path: string, type: "error" | "success", message: string) {
  const url = new URL(path, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  url.searchParams.set(type, message)
  return redirect(url.toString())
}

// LOGIN
export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return redirectWithMessage("/auth/sign-in", "error", error.message)
  }
  return redirect("/account")
}

// SIGNUP
export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`
    }
  })

  if (error) {
    return redirectWithMessage("/auth/sign-up", "error", error.message)
  }

  // Crea el registro en customers si el usuario fue creado
  if (data.user) {
    await supabase.from("customers").insert({
      id: data.user.id,
      name,
      email,
    })
  }

  return redirectWithMessage("/auth/sign-up-success", "success", "¡Revisa tu email para verificar tu cuenta!")
}

// RESET PASSWORD
export async function resetPasswordAction(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/update-password`
  })

  if (error) {
    return redirectWithMessage("/auth/reset-password", "error", error.message)
  }
  return redirectWithMessage("/auth/reset-password", "success", "Te enviamos un email para restaurar tu contraseña.")
}

// UPDATE PASSWORD
export async function updatePasswordAction(formData: FormData) {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string
  if (password.length < 6) {
    return redirectWithMessage("/auth/update-password", "error", "La contraseña debe tener al menos 6 caracteres.")
  }
  if (password !== confirm) {
    return redirectWithMessage("/auth/update-password", "error", "Las contraseñas no coinciden.")
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return redirectWithMessage("/auth/update-password", "error", error.message)
  }
  return redirectWithMessage("/auth/sign-in", "success", "Contraseña actualizada correctamente. Ahora puedes iniciar sesión.")
}

// LOGOUT: usa el endpoint /api/auth/signout ya creado 