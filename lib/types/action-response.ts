/**
 * Tipo estandarizado para respuestas de Server Actions
 * 
 * Todas las server actions deben usar este tipo para mantener consistencia
 * en el manejo de errores y respuestas exitosas.
 */

export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Helper para crear respuestas exitosas
 */
export function successResponse<T>(data?: T, message?: string): ActionResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

/**
 * Helper para crear respuestas de error
 */
export function errorResponse(error: string | Error, message?: string): ActionResponse {
  return {
    success: false,
    error: error instanceof Error ? error.message : error,
    message
  }
}

/**
 * Helper para manejar errores en try/catch
 */
export function handleActionError(error: unknown, defaultMessage: string): ActionResponse {
  if (error instanceof Error) {
    return errorResponse(error, defaultMessage)
  }

  // Manejar errores de Supabase (PostgrestError)
  if (error && typeof error === 'object' && 'message' in error) {
    return errorResponse(String(error.message), defaultMessage)
  }

  return errorResponse(String(error), defaultMessage)
}


