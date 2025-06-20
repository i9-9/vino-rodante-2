import type { Product, Address, ValidationErrors } from '../types'

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validateProduct = (data: Partial<Product>): ValidationErrors => {
  const errors: ValidationErrors = {}
  
  if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
    errors.price = 'El precio debe ser un número positivo'
  }
  
  if (data.stock !== undefined && (isNaN(data.stock) || data.stock < 0)) {
    errors.stock = 'El stock debe ser un número positivo'
  }
  
  if (data.image && !isValidUrl(data.image)) {
    errors.image = 'URL de imagen inválida'
  }
  
  if (data.name !== undefined && data.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres'
  }
  
  return errors
}

export const validateAddress = (data: Partial<Address>): ValidationErrors => {
  const errors: ValidationErrors = {}
  
  if (!data.line1 || data.line1.trim().length < 5) {
    errors.line1 = 'La dirección debe tener al menos 5 caracteres'
  }
  
  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'La ciudad es requerida'
  }
  
  if (!data.state || data.state.trim().length < 2) {
    errors.state = 'La provincia/estado es requerida'
  }
  
  if (!data.postal_code || data.postal_code.trim().length < 4) {
    errors.postal_code = 'El código postal es requerido'
  }
  
  if (!data.country || data.country.trim().length < 2) {
    errors.country = 'El país es requerido'
  }
  
  return errors
}

export const validateOrderStatus = (status: string): boolean => {
  return ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'].includes(status)
}

export const validatePrice = (price: number | string): boolean => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return !isNaN(numPrice) && numPrice >= 0
}

export const validateStock = (stock: number | string): boolean => {
  const numStock = typeof stock === 'string' ? parseInt(stock, 10) : stock
  return !isNaN(numStock) && numStock >= 0
}

export const extractFormFields = <T extends Record<string, any>>(
  formData: FormData,
  fields: Array<keyof T>,
  validators?: {
    [K in keyof T]?: (value: any) => boolean
  }
): Partial<T> => {
  const updates: Partial<T> = {}
  
  for (const field of fields) {
    const value = formData.get(field as string)?.toString().trim()
    
    if (value) {
      if (validators && validators[field]) {
        if (validators[field]!(value)) {
          updates[field] = value as T[keyof T]
        }
      } else {
        updates[field] = value as T[keyof T]
      }
    }
  }
  
  return updates
}

export const hasChanges = (updates: Record<string, any>): boolean => {
  return Object.keys(updates).length > 0
} 