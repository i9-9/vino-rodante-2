import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { CACHE_TAGS } from '@/lib/cache-tags'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tag, path, secret } = body

    // Verificar secret para seguridad
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // Revalidar por tag
    if (tag) {
      revalidateTag(tag)
      console.log(`✅ Revalidated tag: ${tag}`)
    }

    // Revalidar por path
    if (path) {
      revalidatePath(path)
      console.log(`✅ Revalidated path: ${path}`)
    }

    // Revalidar todos los productos si no se especifica nada
    if (!tag && !path) {
      revalidateTag(CACHE_TAGS.PRODUCTS)
      revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
      revalidateTag(CACHE_TAGS.FEATURED_PRODUCTS)
      console.log('✅ Revalidated all product tags')
    }

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      tag: tag || 'all-products',
      path: path || 'all'
    })

  } catch (error) {
    console.error('Error revalidating:', error)
    return NextResponse.json({ 
      message: 'Error revalidating',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET para verificar que la API funciona
export async function GET() {
  return NextResponse.json({ 
    message: 'Revalidation API is working',
    availableTags: Object.values(CACHE_TAGS),
    timestamp: Date.now()
  })
}
