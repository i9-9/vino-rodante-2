# 🔧 Instrucciones para Corregir el CRUD de Productos

## ⚡ Paso 1: Ejecutar Migración SQL (URGENTE)

### Opción A: Desde Supabase Dashboard
1. Ve a tu proyecto en Supabase Dashboard
2. Navega a SQL Editor
3. Copia y pega el contenido de `supabase/migrations/fix_products_table.sql`
4. Ejecuta la migración

### Opción B: Desde CLI
```bash
cd /Users/ivan/Documents/Codigo/vino-2/vino-rodante
npx supabase db push
```

### Verificación
Ejecuta este query para verificar que los campos existen:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products' 
AND column_name IN ('free_shipping', 'is_box');
```

---

## 📝 Paso 2: Corregir el Sistema de Boxes

### 2.1. Modificar `admin-products-tab.tsx`

**Agregar import:**
```typescript
import { createBox, updateBox, deleteBox } from './actions/boxes'
```

**Modificar `handleEditProduct` (línea 1044):**
```typescript
const handleEditProduct = async (formData: FormData) => {
  try {
    // Check if it's a box
    const isBox = formData.get('category') === 'Boxes' || formData.get('is_box') === 'on'
    
    if (selectedImage) {
      formData.append('image_file', selectedImage)
    }
    
    let result;
    
    if (isBox) {
      // Use box-specific functions
      if (selectedProduct?.id) {
        result = await updateBox(selectedProduct.id, formData)
      } else {
        result = await createBox(formData)
      }
    } else {
      // Use regular product functions
      if (selectedProduct?.id) {
        formData.append('id', selectedProduct.id)
        result = await updateProduct(formData)
      } else {
        result = await createProduct(formData)
      }
    }
    
    // ... resto del código
  } catch (error) {
    // ... manejo de errores
  }
}
```

### 2.2. Modificar `BoxForm.tsx`

**Agregar import:**
```typescript
import { createBox, updateBox } from '../actions/boxes'
```

**Modificar `handleSubmit` (línea 234):**
```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsSubmitting(true)
  
  try {
    if (boxProducts.length === 0) {
      throw new Error('Debe agregar al menos un producto al box')
    }

    if (boxProducts.length !== formData.total_wines) {
      throw new Error(`El box debe contener exactamente ${formData.total_wines} vinos`)
    }

    const submitData = new FormData()

    // Campos básicos
    submitData.set('name', formData.name)
    submitData.set('description', formData.description)
    submitData.set('price', formData.price)
    submitData.set('stock', formData.stock)
    submitData.set('total_wines', formData.total_wines.toString())
    submitData.set('discount_percentage', formData.discount_percentage.toString())
    submitData.set('featured', formData.featured ? 'on' : 'off')
    submitData.set('is_visible', formData.is_visible ? 'on' : 'off')
    submitData.set('free_shipping', formData.free_shipping ? 'on' : 'off')
    
    // Productos del box
    submitData.set('box_products', JSON.stringify(boxProducts))
    
    // Imagen
    if (selectedFile) {
      submitData.set('image_file', selectedFile)
    }
    
    // ✅ USAR LAS FUNCIONES CORRECTAS
    let result;
    if (initialData?.id) {
      result = await updateBox(initialData.id, submitData)
    } else {
      result = await createBox(submitData)
    }
    
    if (!result.success) {
      throw new Error(result.error || 'Error al procesar el box')
    }
    
    toast({
      title: "Éxito",
      description: initialData?.id ? 'Box actualizado correctamente' : 'Box creado correctamente',
    })
    
    onClose()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Error al crear el box",
      variant: "destructive"
    })
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## 🔄 Paso 3: Corregir la Generación de Slugs

### En `app/account/actions/products.ts`

**Modificar línea 273:**
```typescript
// ANTES:
slug: name.toLowerCase().replace(/\s+/g, '-')

// DESPUÉS:
slug: generateSlug(name)
```

---

## ✅ Paso 4: Agregar Validación Zod en `updateProduct`

### En `app/account/actions/products.ts` (después de línea 248)

```typescript
export async function updateProduct(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'No autorizado' }
    }

    // Verificar si es admin
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!customer?.is_admin) {
      return { success: false, error: 'No autorizado - Se requiere ser admin' }
    }

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'ID de producto requerido' }
    }

    const category = formData.get('category') as string
    const isBox = category === 'Boxes'
    
    // ✅ AGREGAR: Construir objeto para validar con Zod
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number((formData.get('price') as string)?.replace(',', '.')),
      stock: parseInt(((formData.get('stock') as string) ?? '').replace(/[^0-9]/g, ''), 10),
      category: mapCategoryToDB(category),
      region: normalizeRegion(formData.get('region') as string || ''),
      year: isBox ? 'N/A' : (formData.get('year') as string || ''),
      varietal: isBox ? 'Múltiples' : normalizeVarietal(formData.get('varietal') as string || ''),
      featured: formData.get('featured') === 'on',
      is_visible: formData.get('is_visible') === 'on',
      free_shipping: formData.get('free_shipping') === 'on',
      is_box: formData.get('is_box') === 'on',
      slug: generateSlug(formData.get('name') as string),
    }

    // ✅ AGREGAR: Validar con Zod
    const validatedData = ProductSchema.parse(rawData)

    // Manejar imagen si se subió una nueva
    const imageFile = formData.get('image_file') as File
    if (imageFile?.size > 0) {
      const fileExt = imageFile.type.split('/')[1]
      const fileName = `${validatedData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      validatedData.image = publicUrl
    } else {
      const imageUrl = formData.get('image') as string
      if (imageUrl && imageUrl.trim() !== '') {
        validatedData.image = imageUrl
      }
    }

    // ✅ AGREGAR: Obtener slug anterior para revalidar cache
    const { data: oldProduct } = await supabase
      .from('products')
      .select('slug')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/account')
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
    
    // ✅ AGREGAR: Revalidar ambos slugs
    if (oldProduct?.slug) {
      revalidateTag(`product-${oldProduct.slug}`)
    }
    revalidateTag(`product-${validatedData.slug}`)
    
    return { success: true, message: 'Producto actualizado correctamente' }

  } catch (error) {
    // ✅ MEJORAR: Manejo de errores Zod
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al actualizar producto'
    }
  }
}
```

---

## 🧪 Paso 5: Testing

### 5.1. Verificar productos normales
1. Ve al dashboard de admin
2. Crea un producto nuevo (no box)
3. Verifica que se guarda correctamente con todos los campos
4. Edita el producto
5. Verifica que los cambios se guardan

### 5.2. Verificar boxes
1. Ve al dashboard de admin
2. Crea un box con 3 vinos
3. Verifica que se crea el box Y las relaciones en `box_product_relations`
4. Edita el box (cambiar vinos)
5. Verifica que se actualizan las relaciones correctamente

### 5.3. Query de verificación
```sql
-- Ver boxes y sus productos
SELECT 
  p.id,
  p.name as box_name,
  p.is_box,
  p.free_shipping,
  COUNT(bpr.product_id) as total_productos
FROM products p
LEFT JOIN box_product_relations bpr ON p.id = bpr.box_id
WHERE p.category = 'Boxes'
GROUP BY p.id, p.name, p.is_box, p.free_shipping;
```

---

## 📋 Checklist de Corrección

- [ ] Ejecutar migración SQL para agregar `free_shipping` e `is_box`
- [ ] Verificar que los campos existen en la tabla
- [ ] Modificar `admin-products-tab.tsx` para usar funciones de boxes
- [ ] Modificar `BoxForm.tsx` para usar funciones de boxes
- [ ] Corregir generación de slugs en `updateProduct`
- [ ] Agregar validación Zod en `updateProduct`
- [ ] Mejorar manejo de errores Zod
- [ ] Revalidar cache correctamente
- [ ] Probar crear producto normal
- [ ] Probar editar producto normal
- [ ] Probar crear box
- [ ] Probar editar box
- [ ] Verificar relaciones en `box_product_relations`
- [ ] Verificar que `free_shipping` se guarda correctamente

---

## 🚨 Notas Importantes

1. **Backup primero:** Antes de ejecutar la migración, haz un backup de la base de datos
2. **Testing en desarrollo:** Prueba todos los cambios en tu entorno de desarrollo antes de producción
3. **Productos existentes:** La migración actualizará automáticamente los boxes existentes
4. **Cache:** Después de los cambios, puede que necesites limpiar el cache manualmente

---

## 📞 Soporte

Si encuentras problemas durante la corrección:
1. Revisa el reporte completo en `PRODUCTOS_CRUD_ERRORES.md`
2. Verifica los logs de Supabase
3. Revisa la consola del navegador para errores de cliente

---

**Última actualización:** 2025-01-24

