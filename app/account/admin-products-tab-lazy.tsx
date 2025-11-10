'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import AdminProductsTab from './admin-products-tab'
import { AdminProductsSkeleton } from './components/AdminSkeleton'
import type { Product } from './types'

interface AdminProductsTabLazyProps {
  t: Record<string, Record<string, string>>
}

export default function AdminProductsTabLazy({ t }: AdminProductsTabLazyProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })

  const supabase = createClient()

  const loadProducts = async (page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true)
      const { getProductsPaginated } = await import('./actions/products')
      const result = await getProductsPaginated(page, pageSize)
      
      if (result.success && result.data) {
        setProducts(result.data.products)
        setPagination({
          page: result.data.page,
          pageSize: result.data.pageSize,
          total: result.data.total,
          totalPages: result.data.totalPages
        })
      } else {
        setError(result.error || 'Error al cargar productos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    await loadProducts(pagination.page, pagination.pageSize)
  }

  useEffect(() => {
    let isMounted = true

    const loadAdminProducts = async () => {
      try {
        console.log('🔄 Iniciando carga de productos admin...')
        const supabase = createClient()
        
        // Verificar que el usuario sea admin
        console.log('👤 Verificando usuario...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('❌ Error de autenticación:', userError)
          setError(`Error de autenticación: ${userError.message}`)
          return
        }
        
        if (!user) {
          console.error('❌ No hay usuario autenticado')
          setError('No autorizado - No hay usuario')
          return
        }

        console.log('✅ Usuario autenticado:', user.email)
        console.log('🔍 Verificando permisos de admin...')

        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('is_admin, email, name')
          .eq('id', user.id)
          .single()

        if (customerError) {
          console.error('❌ Error al verificar customer:', customerError)
          setError(`Error al verificar permisos: ${customerError.message}`)
          return
        }

        console.log('👤 Datos del customer:', customer)

        if (!customer?.is_admin) {
          console.error('❌ Usuario no es admin:', customer)
          setError('No autorizado - Se requieren permisos de administrador')
          return
        }

        console.log('✅ Usuario verificado como admin, cargando productos...')

        // Cargar productos con paginación
        if (isMounted) {
          await loadProducts(1, 20)
        }
      } catch (err) {
        console.error('💥 Error inesperado al cargar productos:', err)
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

  return (
    <AdminProductsTab 
      products={products} 
      t={t as unknown as import('@/lib/i18n/types').Translations} 
      onRefresh={refresh}
      pagination={pagination}
      onPageChange={loadProducts}
    />
  )
} 