// Script para probar la lógica del carrito con boxes

interface Product {
  id: string
  name: string
  category: string
  is_box?: boolean
  price: number
}

interface CartItem extends Product {
  quantity: number
}

// Función para verificar si hay boxes en el carrito
function hasBoxes(cartItems: CartItem[]): boolean {
  return cartItems.some(item => item.is_box || item.category === 'Boxes')
}

// Función para verificar si el botón de checkout debe estar habilitado
function isCheckoutEnabled(cartItems: CartItem[]): boolean {
  const hasBoxesInCart = hasBoxes(cartItems)
  const totalBottles = cartItems.reduce((total, item) => total + item.quantity, 0)
  
  // Si hay boxes, siempre habilitado
  if (hasBoxesInCart) {
    return true
  }
  
  // Si solo productos individuales, mínimo 3 botellas
  return totalBottles >= 3
}

// Casos de prueba
console.log('🧪 Probando lógica del carrito...\n')

// Caso 1: Solo productos individuales, menos de 3 botellas
const cart1: CartItem[] = [
  { id: '1', name: 'Malbec', category: 'tinto', price: 1000, quantity: 1 },
  { id: '2', name: 'Chardonnay', category: 'blanco', price: 800, quantity: 1 }
]

console.log('📦 Caso 1: Solo productos individuales, 2 botellas')
console.log('  - Productos:', cart1.map(item => `${item.name} (x${item.quantity})`).join(', '))
console.log('  - Tiene boxes:', hasBoxes(cart1))
console.log('  - Checkout habilitado:', isCheckoutEnabled(cart1))
console.log('  - Total botellas:', cart1.reduce((total, item) => total + item.quantity, 0))
console.log('')

// Caso 2: Solo productos individuales, exactamente 3 botellas
const cart2: CartItem[] = [
  { id: '1', name: 'Malbec', category: 'tinto', price: 1000, quantity: 2 },
  { id: '2', name: 'Chardonnay', category: 'blanco', price: 800, quantity: 1 }
]

console.log('📦 Caso 2: Solo productos individuales, 3 botellas')
console.log('  - Productos:', cart2.map(item => `${item.name} (x${item.quantity})`).join(', '))
console.log('  - Tiene boxes:', hasBoxes(cart2))
console.log('  - Checkout habilitado:', isCheckoutEnabled(cart2))
console.log('  - Total botellas:', cart2.reduce((total, item) => total + item.quantity, 0))
console.log('')

// Caso 3: Solo productos individuales, más de 3 botellas
const cart3: CartItem[] = [
  { id: '1', name: 'Malbec', category: 'tinto', price: 1000, quantity: 2 },
  { id: '2', name: 'Chardonnay', category: 'blanco', price: 800, quantity: 2 }
]

console.log('📦 Caso 3: Solo productos individuales, 4 botellas')
console.log('  - Productos:', cart3.map(item => `${item.name} (x${item.quantity})`).join(', '))
console.log('  - Tiene boxes:', hasBoxes(cart3))
console.log('  - Checkout habilitado:', isCheckoutEnabled(cart3))
console.log('  - Total botellas:', cart3.reduce((total, item) => total + item.quantity, 0))
console.log('')

// Caso 4: Con box, menos de 3 botellas individuales
const cart4: CartItem[] = [
  { id: '1', name: 'Box Tinto I', category: 'Boxes', price: 5000, quantity: 1 },
  { id: '2', name: 'Malbec', category: 'tinto', price: 1000, quantity: 1 }
]

console.log('📦 Caso 4: Con box + 1 botella individual')
console.log('  - Productos:', cart4.map(item => `${item.name} (x${item.quantity})`).join(', '))
console.log('  - Tiene boxes:', hasBoxes(cart4))
console.log('  - Checkout habilitado:', isCheckoutEnabled(cart4))
console.log('  - Total botellas:', cart4.reduce((total, item) => total + item.quantity, 0))
console.log('')

// Caso 5: Solo boxes
const cart5: CartItem[] = [
  { id: '1', name: 'Box Tinto I', category: 'Boxes', price: 5000, quantity: 1 },
  { id: '2', name: 'Box Blanco I', category: 'Boxes', price: 4500, quantity: 1 }
]

console.log('📦 Caso 5: Solo boxes')
console.log('  - Productos:', cart5.map(item => `${item.name} (x${item.quantity})`).join(', '))
console.log('  - Tiene boxes:', hasBoxes(cart5))
console.log('  - Checkout habilitado:', isCheckoutEnabled(cart5))
console.log('  - Total botellas:', cart5.reduce((total, item) => total + item.quantity, 0))
console.log('')

console.log('✅ Pruebas completadas!')
