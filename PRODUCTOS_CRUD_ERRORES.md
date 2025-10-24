# 🔍 Reporte de Errores - CRUD de Productos

## ⚠️ Errores Críticos

### 🚨 **CRÍTICO: Dos sistemas paralelos para manejo de Boxes**
**Archivos afectados:** 
- `app/account/actions/boxes.ts` (existe pero NO se usa)
- `app/account/components/BoxForm.tsx` 
- `app/account/admin-products-tab.tsx`

**Problema:** 
- Existe un archivo `app/account/actions/boxes.ts` con funciones específicas para boxes:
  - `createBox()` - Crea el box Y sus relaciones en `box_product_relations`
  - `updateBox()` - Actualiza el box Y gestiona las relaciones
  - `deleteBox()` - Elimina el box Y limpia las relaciones
- Pero `BoxForm.tsx` y `admin-products-tab.tsx` **NO USAN** estas funciones
- En su lugar, intentan usar `createProduct()` y `updateProduct()` genéricas
- Las funciones genéricas **NO GESTIONAN** la tabla `box_product_relations`
- Resultado: Los boxes se crean en `products` pero sin relaciones con sus vinos

**Impacto:** CRÍTICO - Los boxes no funcionan correctamente
**Evidencia:**
```typescript
// BoxForm.tsx línea 222 - llama a onSubmit genérico
await onSubmit(submitData)

// admin-products-tab.tsx línea 1067 - usa createProduct() genérico
result = await createProduct(formData)

// boxes.ts línea 98 - código correcto que NO se está usando
const { error: relationError } = await supabase
  .from('box_product_relations')
  .insert(boxProductRelations)
```

**Solución recomendada:** 
1. Modificar `BoxForm.tsx` para importar y usar `createBox()` y `updateBox()`
2. Modificar `admin-products-tab.tsx` para detectar boxes y usar las funciones correctas
3. O bien, integrar la lógica de boxes.ts dentro de products.ts

---

### 🔥 **CRÍTICO: Campos `free_shipping` e `is_box` no existen en la BD**
**Archivos afectados:**
- `schema_dump.sql` - definición de tabla `products`
- `app/account/actions/products.ts` - intenta insertar estos campos
- `lib/types.ts` - define estos campos como opcionales
- `app/account/types.ts` - NO define estos campos

**Problema:**
```sql
-- schema_dump.sql línea 159-174
CREATE TABLE "products" (
  "id" uuid,
  "name" text NOT NULL,
  ...
  "is_visible" boolean DEFAULT true NOT NULL
  -- ❌ NO EXISTE: free_shipping
  -- ❌ NO EXISTE: is_box
);
```

```typescript
// products.ts línea 260-272 - intenta insertar campos que no existen
const updateData: Record<string, unknown> = {
  ...
  free_shipping,  // ❌ Campo no existe en BD
  is_box,         // ❌ Campo no existe en BD
  ...
}
```

**Impacto:** Crítico
- Los campos se ignoran silenciosamente al insertar/actualizar
- No se puede distinguir boxes de productos normales en la BD
- El campo `free_shipping` no se guarda nunca

**Solución recomendada:**
Ejecutar migración SQL:
```sql
ALTER TABLE products 
ADD COLUMN free_shipping BOOLEAN DEFAULT false,
ADD COLUMN is_box BOOLEAN DEFAULT false;
```

---

### 1. **Generación inconsistente de slug en `updateProduct`**
**Archivo:** `app/account/actions/products.ts` (línea 273)
**Problema:** 
```typescript
slug: name.toLowerCase().replace(/\s+/g, '-')
```
- No usa la función `generateSlug` definida en el mismo archivo
- No normaliza caracteres especiales, tildes ni slashes
- Puede generar slugs diferentes para el mismo nombre dependiendo si se usa create o update

**Impacto:** Alto
**Solución recomendada:**
```typescript
slug: generateSlug(name)
```

---

### 2. **Falta validación del schema en `updateProduct`**
**Archivo:** `app/account/actions/products.ts` (línea 209)
**Problema:** 
- `updateProduct` NO valida los datos con Zod antes de actualizar
- `createProduct` SÍ valida con `ProductSchema.parse(rawData)`
- Esto permite que entren datos inválidos al actualizar

**Impacto:** Crítico
**Solución recomendada:** Agregar validación con Zod antes de actualizar

---

### 3. **Cache no se limpia correctamente en `updateProduct`**
**Archivo:** `app/account/actions/products.ts` (línea 312)
**Problema:**
```typescript
revalidateTag(`product-${updateData.slug}`)
```
- Si el slug cambió, el tag antiguo queda cacheado
- No se revalida el slug anterior

**Impacto:** Medio
**Solución recomendada:**
```typescript
// Obtener el slug anterior antes de actualizar
const { data: oldProduct } = await supabase
  .from('products')
  .select('slug')
  .eq('id', id)
  .single()

// Después de actualizar
revalidateTag(`product-${oldProduct.slug}`)
revalidateTag(`product-${updateData.slug}`)
```

---

### 4. **Inconsistencia entre `is_box` y `category === 'Boxes'`**
**Archivo:** `app/account/actions/products.ts` (línea 255)
**Problema:**
```typescript
const isBox = category === 'Boxes'
const finalYear = isBox ? 'N/A' : (year || '')
```
- Se usa `category === 'Boxes'` para determinar si es box
- Pero también hay un campo `is_box` en el form
- Pueden no coincidir y causar inconsistencias

**Impacto:** Alto
**Solución recomendada:** Siempre sincronizar ambos campos

---

### 5. **Falta ID al editar Box**
**Archivo:** `app/account/components/BoxForm.tsx` (línea 234)
**Problema:**
```typescript
const submitData = new FormData()
submitData.set('name', formData.name)
// ... otros campos
// ❌ FALTA: submitData.set('id', initialData?.id)
```
- Al editar un box, no se envía el ID
- Esto hace que siempre se intente crear en lugar de actualizar

**Impacto:** Crítico
**Solución recomendada:**
```typescript
if (initialData?.id) {
  submitData.set('id', initialData.id)
}
```

---

### 6. **BoxForm no establece category = 'Boxes'**
**Archivo:** `app/account/components/BoxForm.tsx` (línea 234)
**Problema:**
- No se envía explícitamente `category: 'Boxes'`
- Depende de que se infiera, pero puede no funcionar

**Impacto:** Alto
**Solución recomendada:**
```typescript
submitData.set('category', 'Boxes')
submitData.set('is_box', 'on')
```

---

## ⚠️ Errores Moderados

### 7. **Doble subida de imágenes en edición**
**Archivo:** `app/account/admin-products-tab.tsx` (línea 305-308 y 1057)
**Problema:**
```typescript
// En EditProductDialog.handleSubmit (línea 305)
if (selectedFile) {
  const imageUrl = await uploadImage(selectedFile)
  submitData.set('image', imageUrl)
}

// En AdminProductsTab.handleEditProduct (línea 1057)
if (selectedImage) {
  formData.append('image_file', selectedImage)
}
```
- La imagen se sube dos veces con diferentes nombres
- Se guarda una URL pero luego se intenta subir de nuevo

**Impacto:** Medio (desperdicia storage y puede sobrescribir)
**Solución recomendada:** Eliminar `uploadImage` del dialog o no usar `selectedImage` en el handler

---

### 8. **Eliminación de imágenes de storage puede fallar**
**Archivo:** `app/account/actions/products.ts` (línea 432)
**Problema:**
```typescript
const imagesToDelete = products
  ?.filter(p => p.image)
  .map(p => p.image!.split('/').pop()!)
```
- Asume que todas las imágenes están en el storage local
- No valida si es Google Drive u otro servicio
- Si la URL no tiene el formato esperado, falla silenciosamente

**Impacto:** Medio
**Solución recomendada:**
```typescript
const imagesToDelete = products
  ?.filter(p => p.image && p.image.includes('product-images'))
  .map(p => {
    const parts = p.image!.split('/')
    return parts[parts.length - 1]
  })
  .filter(Boolean)
```

---

### 9. **Validación Zod conflictiva con normalización**
**Archivo:** `app/account/types/product.ts` (línea 86-92)
**Problema:**
```typescript
region: z.enum(REGIONS, {...})
varietal: z.enum(VARIETALS, {...})
```
- El schema requiere valores exactos del enum
- Pero en `updateProduct` se normalizan los valores (línea 148-181)
- La normalización puede devolver un valor que no está en el enum

**Impacto:** Medio
**Solución recomendada:** 
- Hacer la validación antes de normalizar, o
- Asegurar que la normalización siempre devuelve un valor del enum

---

### 10. **Funciones CRUD duplicadas**
**Archivo:** `lib/products.ts` (línea 65-99)
**Problema:**
- Hay funciones `createProduct`, `updateProduct`, `deleteProduct` en `lib/products.ts`
- También existen en `app/account/actions/products.ts`
- Las de `lib/` no verifican permisos de admin
- Las de `lib/` no revalidan cache
- Pueden causar confusión sobre cuál usar

**Impacto:** Medio
**Solución recomendada:** Eliminar las funciones de `lib/products.ts` o renombrarlas

---

### 11. **Inconsistencia en rutas de importación de createClient**
**Archivo:** `app/account/actions/boxes.ts` (línea 3)
**Problema:**
```typescript
import { createClient } from '@/lib/supabase/server'  // ❌ Ruta incorrecta
```
Pero en `app/account/actions/products.ts` (línea 3):
```typescript
import { createClient } from '@/utils/supabase/server'  // ✅ Ruta correcta
```

**Impacto:** Medio (puede funcionar si ambas existen, pero crea confusión)
**Solución recomendada:** Usar siempre `@/utils/supabase/server`

---

## ⚠️ Errores Menores

### 12. **No se valida año y varietal requeridos en servidor**
**Archivo:** `app/account/admin-products-tab.tsx` (línea 496-530)
**Problema:**
- Los campos año y varietal son condicionales según si es box o no
- Pero el form no valida que estén llenos antes de enviar
- Solo tiene `required={formData.category !== 'Boxes'}` en el HTML
- La server action no valida estos campos

**Impacto:** Bajo (validación solo en cliente)
**Solución recomendada:** Agregar validación también en la server action

---

### 13. **Inconsistencia en formato de booleans**
**Archivo:** `app/account/admin-products-tab.tsx` (línea 296)
**Problema:**
```typescript
submitData.set('featured', formData.featured ? 'on' : 'off')
```
- Envía 'on'/'off' como strings
- Luego compara con `formData.get('featured') === 'on'`
- Funcionaría mejor enviar 'true'/'false' o booleanos directamente

**Impacto:** Bajo (funciona, pero no es ideal)
**Solución recomendada:** Usar 'true'/'false' para mayor claridad

---

### 14. **Manejo genérico de errores Zod**
**Archivo:** `app/account/actions/products.ts` (línea 405-409)
**Problema:**
```typescript
catch (error) {
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Error al crear producto'
  }
}
```
- Los errores de Zod tienen una estructura específica con múltiples issues
- Solo se muestra el mensaje genérico

**Impacto:** Bajo
**Solución recomendada:**
```typescript
import { ZodError } from 'zod'

catch (error) {
  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    }
  }
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Error al crear producto'
  }
}
```

---

### 15. **Conversión de precio con coma puede fallar**
**Archivo:** `app/account/actions/products.ts` (línea 237-238)
**Problema:**
```typescript
const rawPrice = (formData.get('price') as string) ?? ''
const price = Number(rawPrice.replace(',', '.'))
```
- Solo reemplaza la primera coma
- Si viene "1,000.50" se convierte incorrectamente
- No valida si el resultado es NaN

**Impacto:** Bajo
**Solución recomendada:**
```typescript
const rawPrice = (formData.get('price') as string) ?? ''
const price = parseFloat(rawPrice.replace(/,/g, '.'))
if (isNaN(price) || price < 0) {
  return { success: false, error: 'Precio inválido' }
}
```

---

### 16. **Stock puede ser NaN**
**Archivo:** `app/account/actions/products.ts` (línea 240)
**Problema:**
```typescript
const stock = parseInt(((formData.get('stock') as string) ?? '').replace(/[^0-9]/g, ''), 10)
```
- Si el string está vacío después de replace, parseInt devuelve NaN
- No se valida

**Impacto:** Bajo
**Solución recomendada:**
```typescript
const stockStr = ((formData.get('stock') as string) ?? '').replace(/[^0-9]/g, '')
const stock = stockStr ? parseInt(stockStr, 10) : 0
if (isNaN(stock) || stock < 0) {
  return { success: false, error: 'Stock inválido' }
}
```

---

### 17. **Tipos inconsistentes para el campo `year`**
**Archivos afectados:**
- `lib/types.ts` (línea 9): `year: string`
- `app/account/types.ts` (línea 26): `year?: number`
- `schema_dump.sql`: `year TEXT` (string en BD)

**Problema:**
- El campo `year` se define como `string` en algunos lugares y `number` en otros
- Esto puede causar errores de tipo en tiempo de ejecución
- La base de datos lo almacena como TEXT

**Impacto:** Bajo (TypeScript no detecta la inconsistencia)
**Solución recomendada:** Estandarizar en `string` en todos los archivos

---

## 📊 Resumen

| Categoría | Cantidad |
|-----------|----------|
| **🚨 Errores Bloqueantes** | **2** |
| Errores Críticos | 6 |
| Errores Moderados | 5 |
| Errores Menores | 6 |
| **TOTAL** | **19** |

### 🔥 Errores Bloqueantes
1. **Sistema de Boxes:** NO funciona porque está usando las funciones incorrectas. Los boxes se crean sin sus relaciones de productos.
2. **Campos faltantes en BD:** `free_shipping` e `is_box` no existen en la tabla `products`, los datos se pierden al guardar.

## 🎯 Prioridades de Corrección

### 🚨 **URGENTE - Debe corregirse YA:**
   - **Error Bloqueante #1:** Sistema dual de Boxes - Implementar correctamente las funciones de boxes.ts
   - **Error Bloqueante #2:** Agregar campos `free_shipping` e `is_box` a la tabla `products` en la base de datos

### 1. **Alta Prioridad:**
   - Error #2: Validación con Zod en updateProduct
   - Error #5: Falta ID al editar Box
   - Error #6: BoxForm no establece category

### 2. **Media Prioridad:**
   - Error #1: Generación de slug inconsistente
   - Error #4: Inconsistencia is_box vs category
   - Error #7: Doble subida de imágenes
   - Error #9: Validación Zod conflictiva
   - Error #11: Inconsistencia en rutas de importación

### 3. **Baja Prioridad:**
   - Error #3: Cache de slugs antiguos
   - Error #8: Eliminación de imágenes
   - Errores menores #12-17

---

## 🛠️ Plan de Acción Recomendado

### Fase 1 - Urgente (Críticos Bloqueantes)
1. Crear migración SQL para agregar `free_shipping` e `is_box` a `products`
2. Refactorizar `admin-products-tab.tsx` y `BoxForm.tsx` para usar las funciones correctas de `boxes.ts`

### Fase 2 - Alta Prioridad
1. Agregar validación Zod a `updateProduct()`
2. Corregir `BoxForm` para enviar ID y category correctamente
3. Estandarizar generación de slugs

### Fase 3 - Media Prioridad
1. Resolver duplicación de funciones CRUD
2. Limpiar manejo de imágenes
3. Estandarizar rutas de importación
4. Mejorar validaciones de Zod

### Fase 4 - Baja Prioridad
1. Mejorar manejo de errores
2. Estandarizar tipos
3. Agregar validaciones adicionales

---

**Generado:** $(date)
**Versión del código revisado:** main branch
