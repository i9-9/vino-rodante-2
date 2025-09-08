"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'



// Helper function to serialize data
function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'function') return undefined;
    if (value === undefined) return null;
    return value;
  }));
}

// Función para generar slug a partir del nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim()
    .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
}

export async function savePlanAction(prevState: { error: string | null, success?: boolean }, formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string | null
  const name = formData.get('name') as string
  const club = formData.get('club') as string
  const description = formData.get('description') as string
  const tagline = formData.get('tagline') as string
  const price_monthly = formData.get('price_monthly') as string
  const price_bimonthly = formData.get('price_bimonthly') as string
  const price_quarterly = formData.get('price_quarterly') as string
  const is_visible = formData.get('is_visible') === 'on'
  const imageUrl = formData.get('image') as string | null

  // Validaciones
  if (!name || !club || !description) {
    return { error: 'Nombre, club y descripción son campos obligatorios.' }
  }

  if (!imageUrl) {
    return { error: 'Debes subir una imagen para el plan de suscripción.' }
  }

  // Generar slug automáticamente
  const slug = generateSlug(name)

  const baseData = {
    name,
    slug,
    description,
    tagline: tagline || null,
    price_monthly: price_monthly ? Number(price_monthly) : null,
    price_bimonthly: price_bimonthly ? Number(price_bimonthly) : null,
    price_quarterly: price_quarterly ? Number(price_quarterly) : null,
    is_visible,
    image: imageUrl,
    status: 'active',
    updated_at: new Date().toISOString(),
    features: null,
    discount_percentage: null,
    display_order: null
  } as const

  let error
  if (id) {
    // Actualizar plan existente
    const updateData = serializeData(baseData)
    ;({ error } = await supabase.from('subscription_plans').update(updateData).eq('id', id))
  } else {
    // Crear nuevo plan
    const insertData = serializeData({
      ...baseData,
      created_at: new Date().toISOString()
    })
    ;({ error } = await supabase.from('subscription_plans').insert(insertData))
  }

  if (error) {
    console.error('Error saving subscription plan:', error)
    return { error: error.message }
  }

  // Revalidar la página para mostrar los cambios
  revalidatePath('/account')
  
  return { error: null, success: true }
} 