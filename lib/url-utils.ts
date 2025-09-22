/**
 * Utilidades para manejo de URLs en la aplicación
 */

/**
 * Obtiene la URL base de la aplicación
 * En desarrollo, intenta detectar el puerto correcto
 * En producción, usa la URL configurada
 */
export function getAppBaseUrl(): string {
  // Si está definida la variable de entorno, usarla
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // En Vercel, usar la URL de Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // En desarrollo, detectar el puerto correcto
  if (process.env.NODE_ENV === 'development') {
    // Intentar detectar el puerto desde las variables de entorno
    const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001'
    return `http://localhost:${port}`
  }

  // En producción, usar la URL por defecto
  return 'https://www.vinorodante.com'
}

/**
 * Obtiene la URL base para APIs internas
 * En desarrollo, intenta ambos puertos comunes
 */
export function getApiBaseUrl(): string {
  const baseUrl = getAppBaseUrl()
  
  // En desarrollo, si no hay variable de entorno específica,
  // intentar detectar el puerto correcto
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SITE_URL) {
    // Lista de puertos comunes para desarrollo
    const commonPorts = ['3001', '3000', '3002']
    
    // Si estamos en el servidor, usar el puerto actual
    if (typeof window === 'undefined') {
      const port = process.env.PORT || '3001'
      return `http://localhost:${port}`
    }
  }
  
  return baseUrl
}

/**
 * Construye una URL completa para una ruta de API
 */
export function getApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Construye una URL completa para una ruta de la aplicación
 */
export function getAppUrl(path: string): string {
  const baseUrl = getAppBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}
