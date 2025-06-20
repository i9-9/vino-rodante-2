"use server"

import { encodedRedirect } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

// Helper para redirección con mensaje
export async function redirectWithMessage(path: string, type: "error" | "success", message: string) {
  const url = new URL(path, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  url.searchParams.set(type, message)
  return redirect(url.toString())
}

// LOGIN
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const returnTo = formData.get("return_to") as string || "/account"
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return encodedRedirect("error", "/auth/sign-in", error.message)
  }

  return redirect(returnTo)
}

// SIGNUP
export async function signUpAction(formData: FormData) {
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()
  const name = formData.get("name")?.toString()
  const supabase = await createClient()
  const origin = (await headers()).get("origin")

  if (!email || !password || !name) {
    return encodedRedirect(
      "error",
      "/auth/sign-up",
      "Email, password and name are required"
    )
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error(error.code + " " + error.message)
    return encodedRedirect("error", "/auth/sign-up", error.message)
  }

  // Crear el registro en customers
  const { error: customerError } = await supabase
    .from("customers")
    .insert({
      email,
      name,
    })

  if (customerError) {
    console.error(customerError.message)
    return encodedRedirect("error", "/auth/sign-up", "Error creating customer record")
  }

  return encodedRedirect(
    "success",
    "/auth/sign-up-success",
    "Thanks for signing up! Please check your email for a verification link."
  )
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
export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    return { error: error.message }
  }
  
  redirect('/auth/sign-in')
} 