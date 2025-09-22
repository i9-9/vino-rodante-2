// Script para probar la generación de slugs con diferentes casos de slashes

// Función para generar slug a partir del nombre (igual que en products.ts)
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\//g, '-') // Reemplazar slashes con guiones PRIMERO
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim()
    .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
}

// Casos de prueba
const testCases = [
  'Vino 40/40 Malbec',
  'Caja 12/12 Vinos Premium',
  'Pack 6/6 Espumantes',
  'Selección 3/3 Tintos',
  'Vino 50/50 Cabernet/Sauvignon',
  'Caja 24/24 Vinos/Especiales',
  'Pack 8/8 Blancos/Chardonnay',
  'Vino 100/100 Malbec/Reserva',
  'Caja 6/6 Vinos/Argentinos',
  'Pack 12/12 Espumantes/Champagne',
  'Vino 40/40 Malbec (2023)',
  'Caja 12/12 Vinos Premium (2022-2023)',
  'Pack 6/6 Espumantes/Champagne (2021)',
  'Vino 50/50 Cabernet/Sauvignon (2020)',
  'Selección 3/3 Tintos/Especiales (2019)',
  'Vino 40/40 Malbec - Reserva',
  'Caja 12/12 Vinos Premium - Edición Limitada',
  'Pack 6/6 Espumantes/Champagne - Año 2021',
  'Vino 50/50 Cabernet/Sauvignon - Cosecha 2020',
  'Selección 3/3 Tintos/Especiales - Colección 2019'
]

console.log('🧪 Testing slug generation with slashes...\n')

testCases.forEach((testCase, index) => {
  const slug = generateSlug(testCase)
  console.log(`${index + 1}. "${testCase}"`)
  console.log(`   → "${slug}"`)
  console.log('')
})

// Probar casos edge
console.log('🔍 Testing edge cases...\n')

const edgeCases = [
  'Vino 40/40/40 Malbec', // Múltiples slashes
  'Caja 12/12/12/12 Vinos', // Muchos slashes
  'Pack 6/6/6/6/6 Espumantes', // Muchos slashes
  'Vino 40/40 Malbec/Chardonnay', // Slash al final
  'Caja 12/12 Vinos/Premium/Especiales', // Múltiples slashes
  'Pack 6/6 Espumantes/Champagne/Prosecco', // Múltiples slashes
  'Vino 40/40 Malbec (2023/2024)', // Slash en paréntesis
  'Caja 12/12 Vinos Premium (2022/2023)', // Slash en paréntesis
  'Pack 6/6 Espumantes/Champagne (2021/2022)', // Múltiples slashes en paréntesis
  'Vino 40/40 Malbec - Reserva (2023/2024)' // Slash en paréntesis con guión
]

edgeCases.forEach((testCase, index) => {
  const slug = generateSlug(testCase)
  console.log(`${index + 1}. "${testCase}"`)
  console.log(`   → "${slug}"`)
  console.log('')
})

console.log('✅ Slug generation test completed!')
