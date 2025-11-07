// Utilidades de validación reutilizables

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const phoneRegex = /^(\+?54)?\s?9?\s?(\d{2,4})\s?-?\s?(\d{3,4})\s?-?\s?(\d{4})$/
export const postalCodeRegex = /^[A-Z]?\d{4}[A-Z]{0,3}$/

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, message: "El email es requerido" }
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Por favor ingresa un email válido" }
  }
  return { isValid: true }
}

export function validatePhone(phone: string, required = false): ValidationResult {
  if (!phone) {
    if (required) {
      return { isValid: false, message: "El teléfono es requerido" }
    }
    return { isValid: true } // Opcional
  }
  
  // Limpiar el teléfono para validar
  const cleaned = phone.replace(/\s|-/g, '')
  
  // Validar formato argentino básico
  if (!/^(\+?54)?9?\d{8,10}$/.test(cleaned)) {
    return { 
      isValid: false, 
      message: "Formato inválido. Ejemplo: +54 9 11 1234-5678" 
    }
  }
  
  return { isValid: true }
}

export function validatePostalCode(postalCode: string, required = false): ValidationResult {
  if (!postalCode) {
    if (required) {
      return { isValid: false, message: "El código postal es requerido" }
    }
    return { isValid: true }
  }
  
  // Validar código postal argentino (4 dígitos)
  if (!/^\d{4}$/.test(postalCode)) {
    return { 
      isValid: false, 
      message: "El código postal debe tener 4 dígitos" 
    }
  }
  
  return { isValid: true }
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} es requerido` }
  }
  return { isValid: true }
}

export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (value.length < minLength) {
    return { 
      isValid: false, 
      message: `${fieldName} debe tener al menos ${minLength} caracteres` 
    }
  }
  return { isValid: true }
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
  if (value.length > maxLength) {
    return { 
      isValid: false, 
      message: `${fieldName} no puede tener más de ${maxLength} caracteres` 
    }
  }
  return { isValid: true }
}

export function validateNumber(value: string, fieldName: string, min?: number, max?: number): ValidationResult {
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} debe ser un número válido` }
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, message: `${fieldName} debe ser mayor o igual a ${min}` }
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, message: `${fieldName} debe ser menor o igual a ${max}` }
  }
  
  return { isValid: true }
}

