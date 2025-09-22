import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache-tags'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, table, record, old_record } = body

    console.log(`🔔 Supabase webhook received: ${type} on ${table}`)

    // Solo procesar cambios en la tabla de productos
    if (table === 'products') {
      switch (type) {
        case 'INSERT':
          console.log('📦 New product created:', record?.name)
          revalidateTag(CACHE_TAGS.PRODUCTS)
          revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
          if (record?.featured) {
            revalidateTag(CACHE_TAGS.FEATURED_PRODUCTS)
          }
          break

        case 'UPDATE':
          console.log('✏️ Product updated:', record?.name)
          revalidateTag(CACHE_TAGS.PRODUCTS)
          revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
          revalidateTag(`product-${record?.slug}`)
          
          // Si cambió el estado featured
          if (record?.featured !== old_record?.featured) {
            revalidateTag(CACHE_TAGS.FEATURED_PRODUCTS)
          }
          
          // Si cambió la categoría, revalidar por categoría
          if (record?.category !== old_record?.category) {
            revalidateTag(CACHE_TAGS.PRODUCTS_BY_CATEGORY)
            revalidateTag(`category-${old_record?.category}`)
            revalidateTag(`category-${record?.category}`)
          }
          
          // Si cambió la región, revalidar por región
          if (record?.region !== old_record?.region) {
            revalidateTag(CACHE_TAGS.PRODUCTS_BY_REGION)
            revalidateTag(`region-${old_record?.region}`)
            revalidateTag(`region-${record?.region}`)
          }
          
          // Si cambió el varietal, revalidar por varietal
          if (record?.varietal !== old_record?.varietal) {
            revalidateTag(CACHE_TAGS.PRODUCTS_BY_VARIETAL)
            revalidateTag(`varietal-${old_record?.varietal}`)
            revalidateTag(`varietal-${record?.varietal}`)
          }
          break

        case 'DELETE':
          console.log('🗑️ Product deleted:', old_record?.name)
          revalidateTag(CACHE_TAGS.PRODUCTS)
          revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
          revalidateTag(`product-${old_record?.slug}`)
          if (old_record?.featured) {
            revalidateTag(CACHE_TAGS.FEATURED_PRODUCTS)
          }
          break

        default:
          console.log(`⚠️ Unknown event type: ${type}`)
      }
    }

    // También procesar cambios en subscription_plans
    if (table === 'subscription_plans') {
      console.log('📋 Subscription plan changed')
      revalidateTag(CACHE_TAGS.SUBSCRIPTION_PLANS)
    }

    // Procesar cambios en descuentos
    if (table === 'discounts') {
      console.log('💰 Discount changed')
      revalidateTag(CACHE_TAGS.DISCOUNTS)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET para verificar que el webhook está funcionando
export async function GET() {
  return NextResponse.json({ 
    message: 'Supabase webhook endpoint is working',
    timestamp: Date.now()
  })
}
