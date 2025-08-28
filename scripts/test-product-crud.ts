import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testProductCRUD() {
  console.log('🧪 Probando CRUD de productos...\n')

  try {
    // 1. Crear un producto de prueba
    console.log('1️⃣ Creando producto de prueba...')
    const testProduct = {
      name: 'Vino Test CRUD',
      description: 'Vino creado para testing del CRUD',
      price: 2500.00,
      category: 'Tinto',
      region: 'Mendoza',
      year: '2020',
      varietal: 'Malbec',
      stock: 10,
      featured: false,
      is_visible: true,
      slug: 'vino-test-crud',
      image: '/placeholder.svg'
    }

    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single()

    if (createError) {
      throw new Error(`Error al crear producto: ${createError.message}`)
    }

    console.log('✅ Producto creado exitosamente:', createdProduct.name)
    const productId = createdProduct.id

    // 2. Leer el producto creado
    console.log('\n2️⃣ Leyendo producto creado...')
    const { data: readProduct, error: readError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (readError || !readProduct) {
      throw new Error('Error al leer producto')
    }

    console.log('✅ Producto leído exitosamente:', readProduct.name)

    // 3. Actualizar el producto
    console.log('\n3️⃣ Actualizando producto...')
    const updateData = {
      name: 'Vino Test CRUD - ACTUALIZADO',
      price: 3000.00,
      stock: 15
    }

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Error al actualizar producto: ${updateError.message}`)
    }

    console.log('✅ Producto actualizado exitosamente:', updatedProduct.name)

    // 4. Eliminar el producto de prueba
    console.log('\n4️⃣ Eliminando producto de prueba...')
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      throw new Error(`Error al eliminar producto: ${deleteError.message}`)
    }

    console.log('✅ Producto eliminado exitosamente')

    // 5. Verificar que fue eliminado
    console.log('\n5️⃣ Verificando eliminación...')
    const { data: deletedProduct, error: verifyError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (deletedProduct) {
      throw new Error('El producto no fue eliminado correctamente')
    }

    console.log('✅ Verificación exitosa: producto no encontrado')

    console.log('\n🎉 ¡CRUD de productos funcionando perfectamente!')

  } catch (error) {
    console.error('\n❌ Error en el test:', error)
    process.exit(1)
  }
}

// Ejecutar el test
testProductCRUD()
