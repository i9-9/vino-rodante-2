"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ClearSessionPage() {
  const [status, setStatus] = useState('Limpiando sesión...')
  const supabase = createClient()

  useEffect(() => {
    const clearEverything = async () => {
      try {
        setStatus('Cerrando sesión de Supabase...')
        
        // 1. Cerrar sesión de Supabase
        await supabase.auth.signOut()
        
        setStatus('Limpiando almacenamiento local...')
        
        // 2. Limpiar localStorage
        localStorage.clear()
        
        // 3. Limpiar sessionStorage
        sessionStorage.clear()
        
        setStatus('Limpiando cookies...')
        
        // 4. Limpiar cookies relacionadas con Supabase
        const cookies = document.cookie.split(";")
        for (let cookie of cookies) {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name.includes('supabase') || name.includes('sb-')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          }
        }
        
        setStatus('¡Limpieza completada! Redirigiendo...')
        
        // 5. Redirigir después de un momento
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
        
      } catch (error) {
        console.error('Error durante la limpieza:', error)
        setStatus('Error durante la limpieza. Refrescando página...')
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      }
    }

    clearEverything()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Limpiando Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Esto solucionará problemas de carga en el navegador
          </p>
        </div>
        
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A83935] mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">{status}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-700">
            <strong>¿Qué estamos haciendo?</strong><br/>
            • Cerrando sesión actual<br/>
            • Limpiando datos locales<br/>
            • Eliminando cookies problemáticas<br/>
            • Preparando para nueva sesión
          </p>
        </div>
      </div>
    </div>
  )
} 