"use server"

import { createClient } from '@/lib/supabase/server'

export async function savePlanAction(prevState: { error: string | null, success?: boolean }, formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string | null
  const imageUrl = formData.get('image') as string | null
  if (!imageUrl) {
    return { error: 'Debes subir una imagen para el plan de suscripción.' }
  }
  const bannerImageUrl = formData.get('banner_image') as string | null
  const data: any = {
    name: formData.get('name'),
    club: formData.get('club'),
    description: formData.get('description'),
    tagline: formData.get('tagline'),
    price_monthly: Number(formData.get('price_monthly')),
    price_bimonthly: Number(formData.get('price_bimonthly')),
    price_quarterly: Number(formData.get('price_quarterly')),
    is_visible: formData.get('is_visible') === 'on',
    image: imageUrl,
    banner_image: bannerImageUrl,
  }
  let error
  if (id) {
    ({ error } = await supabase.from('subscription_plans').update(data).eq('id', id))
  } else {
    ({ error } = await supabase.from('subscription_plans').insert(data))
  }
  if (error) return { error: error.message }
  return { error: null, success: true }
} 