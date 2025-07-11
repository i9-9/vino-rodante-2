'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import AdminProductsTab from './admin-products-tab'
import { AdminProductsSkeleton } from './components/AdminSkeleton'
import type { Product } from './types'

interface AdminProductsTabLazyProps {
  t: any
}

export default function AdminProductsTabLazy({ t }: AdminProductsTabLazyProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAdminProducts = async () => {
      try {
        const supabase = createClient()
        
        // Verificar que el usuario sea admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('No autorizado')
          return
        }

        const { data: customer } = await supabase
          .from('customers')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (!customer?.is_admin) {
          setError('No autorizado')
          return
        }

        // Cargar todos los productos
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100) // Límite inicial para performance

        if (!isMounted) return

        if (error) {
          setError(error.message)
        } else {
          setProducts(data || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAdminProducts()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <AdminProductsSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error al cargar productos: {error}
      </div>
    )
  }

  return <AdminProductsTab products={products} t={t} />
} 