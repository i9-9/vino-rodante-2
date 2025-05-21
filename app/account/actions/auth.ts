"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfileAction(formData: FormData) {
  const userId = formData.get('userId') as string
  const name = formData.get('name') as string
  const supabase = await createClient()
  const { error } = await supabase
    .from("customers")
    .update({ name })
    .eq("id", userId)
  // Puedes manejar el error o redirigir según tu UX
  return redirect('/account')
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", userId)
      .single()
    return { data, error }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : { message: 'Unknown error' } }
  }
}

export async function getOrders(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items(*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return { data, error }
}

export async function getAddresses(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("customer_id", userId)
    .order("is_default", { ascending: false })
  return { data, error }
}

export async function addAddress(userId: string, address: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("addresses")
    .insert({
      ...address,
      customer_id: userId,
    })
    .select()
  return { data, error }
}

export async function deleteAddress(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
  return { error }
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const supabase = await createClient()
  // First, set all addresses to non-default
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("customer_id", userId)
  // Then set the selected address as default
  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
  return { error }
} 