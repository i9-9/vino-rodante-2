/**
 * Genera una contraseña temporal más amigable para usuarios
 */
export function generateTemporaryPassword(): string {
  // Genera una contraseña temporal más legible
  const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos
  const randomSuffix = Math.random().toString(36).substring(2, 6); // 4 caracteres aleatorios
  return `VinoRodante${timestamp}${randomSuffix}`;
}

/**
 * Genera un email temporal único para casos de conflicto
 */
export function generateTemporaryEmail(originalEmail: string): string {
  const timestamp = Date.now().toString().slice(-8);
  const domain = originalEmail.split('@')[1] || 'vinorodante.com';
  return `guest_${timestamp}@${domain}`;
}
