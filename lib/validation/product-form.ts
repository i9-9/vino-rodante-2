/**
 * Validación compartida cliente/servidor para formularios de productos
 * 
 * Estos schemas pueden usarse tanto en el cliente (con react-hook-form)
 * como en el servidor (con FormData parsing)
 */

import { z } from 'zod'
import { CATEGORIES, REGIONS, VARIETALS, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/app/account/types/product'

/**
 * Schema para validar datos de formulario de productos
 * Compatible con FormData y objetos JavaScript
 */
export const ProductFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(2000, 'La descripción no puede exceder 2000 caracteres'),
  price: z.coerce.number().min(0, 'El precio debe ser positivo').or(z.string().transform(val => {
    const num = Number(val.replace(',', '.'))
    return isNaN(num) ? 0 : num
  })),
  stock: z.coerce.number().int().min(0, 'El stock debe ser un número entero positivo').or(z.string().transform(val => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10)
    return isNaN(num) ? 0 : num
  })),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: `Categoría inválida. Valores permitidos: ${CATEGORIES.join(', ')}` })
  }),
  region: z.enum(REGIONS, {
    errorMap: () => ({ message: `Región inválida. Valores permitidos: ${REGIONS.join(', ')}` })
  }),
  year: z.string().optional().default(''),
  varietal: z.enum(VARIETALS, {
    errorMap: () => ({ message: `Varietal inválido. Valores permitidos: ${VARIETALS.join(', ')}` })
  }).optional(),
  image: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  free_shipping: z.boolean().default(false),
  is_box: z.boolean().default(false),
  slug: z.string().optional()
}).refine(
  (data) => {
    const isBox = data.category === 'Boxes' || data.is_box
    if (isBox) return true
    return data.year && data.year.trim() !== '' && data.varietal
  },
  {
    message: 'Para productos individuales (no boxes), el año y varietal son requeridos',
    path: ['year']
  }
)

/**
 * Schema para validar archivos de imagen
 */
export const ImageFileSchema = z.object({
  image_file: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= MAX_FILE_SIZE,
    { message: `El tamaño máximo es ${MAX_FILE_SIZE / 1024 / 1024}MB` }
  ).refine(
    (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
    { message: 'Solo se permiten archivos .jpg, .jpeg, .png y .webp' }
  )
})

/**
 * Helper para parsear FormData a objeto validable
 */
export function parseProductFormData(formData: FormData) {
  return {
    id: formData.get('id') as string | undefined,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    stock: formData.get('stock') as string,
    category: formData.get('category') as string,
    region: formData.get('region') as string,
    year: formData.get('year') as string || '',
    varietal: formData.get('varietal') as string || '',
    image: formData.get('image') as string || '',
    featured: formData.get('featured') === 'on',
    is_visible: formData.get('is_visible') === 'on',
    free_shipping: formData.get('free_shipping') === 'on',
    is_box: formData.get('is_box') === 'on',
    slug: formData.get('slug') as string | undefined
  }
}

/**
 * Validar FormData de producto
 */
export function validateProductFormData(formData: FormData) {
  const parsed = parseProductFormData(formData)
  return ProductFormSchema.parse(parsed)
}

/**
 * Validar FormData de producto de forma segura (retorna errores en lugar de lanzar)
 */
export function safeValidateProductFormData(formData: FormData) {
  const parsed = parseProductFormData(formData)
  const result = ProductFormSchema.safeParse(parsed)
  
  if (result.success) {
    return { success: true as const, data: result.data }
  } else {
    return { 
      success: false as const, 
      error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    }
  }
}

export type ProductFormData = z.infer<typeof ProductFormSchema>


