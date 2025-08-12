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

  const supabase = createClient()

  const refresh = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error) setProducts(data || [])
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

        // Cargar todos los productos
        const { data, error, count } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(100) // Límite inicial para performance

        if (!isMounted) return

        if (error) {
          console.error('❌ Error al cargar productos:', error)
          setError(`Error al cargar productos: ${error.message}`)
        } else {
          console.log(`✅ Productos cargados exitosamente: ${data?.length || 0} de ${count} total`)
          console.log('📋 Productos:', data)
          setProducts(data || [])
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

  return <AdminProductsTab products={products} t={t} onRefresh={refresh} />
} 