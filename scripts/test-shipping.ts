#!/usr/bin/env tsx

import { calculateShipping, getShippingZone, isCapitalFederal } from '../lib/shipping-utils'

console.log('🧪 Probando funciones de envío...\n')

// Test casos de Capital Federal
console.log('📍 Capital Federal:')
console.log('Código 1000:', calculateShipping('1000'), 'centavos (debería ser 0)')
console.log('Código 1499:', calculateShipping('1499'), 'centavos (debería ser 0)')
console.log('Código 1200:', calculateShipping('1200'), 'centavos (debería ser 0)')
console.log('Es Capital Federal 1200:', isCapitalFederal('1200'), '(debería ser true)')

// Test casos de GBA
console.log('\n🏘️ Gran Buenos Aires:')
console.log('Código 1500:', calculateShipping('1500'), 'centavos (debería ser 10000)')
console.log('Código 1600:', calculateShipping('1600'), 'centavos (debería ser 10000)')
console.log('Código 2000:', calculateShipping('2000'), 'centavos (debería ser 10000)')

// Test casos del interior
console.log('\n🌄 Interior del país:')
console.log('Código 3000:', calculateShipping('3000'), 'centavos (debería ser 15000)')
console.log('Código 5000:', calculateShipping('5000'), 'centavos (debería ser 15000)')
console.log('Código 8000:', calculateShipping('8000'), 'centavos (debería ser 15000)')

// Test casos edge
console.log('\n⚠️ Casos edge:')
console.log('Código vacío:', calculateShipping(''), 'centavos (debería ser 15000)')
console.log('Código inválido:', calculateShipping('abc'), 'centavos (debería ser 15000)')
console.log('Código null:', calculateShipping(null as any), 'centavos (debería ser 15000)')

// Test información de zona
console.log('\n🗺️ Información de zonas:')
console.log('Zona 1200:', getShippingZone('1200'))
console.log('Zona 1600:', getShippingZone('1600'))
console.log('Zona 5000:', getShippingZone('5000'))

console.log('\n✅ Pruebas completadas!')
