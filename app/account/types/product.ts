import { z } from 'zod'

export const CATEGORIES = [
  'Tinto',
  'Blanco',
  'Rosado',
  'Espumante',
  'Naranjo',
  'Dulce',
  'Boxes',
  'Otras Bebidas'
] as const

// Lista completa de regiones para formularios CRUD
export const REGIONS = [
  'Mendoza',
  'San Juan', 
  'La Rioja',
  'Salta',
  'Catamarca',
  'Jujuy',
  'Tucumán',
  'Neuquén',
  'Río Negro',
  'Córdoba',
  'Buenos Aires',
  'Entre Ríos',
  'Chapadmalal',
  'Valle de Uco',
  'Valle del Pedernal',
  'Valle Calchaquí',
  'Valle de Famatina',
  'Valle del Río Colorado',
  'Múltiples' // Para boxes
] as const

// Schema base para productos
const BaseProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().min(1, 'La descripción es requerida').max(500),
  price: z.number().min(0, 'El precio debe ser positivo'),
  stock: z.number().min(0, 'El stock debe ser positivo'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Categoría inválida' })
  }),
  region: z.enum(REGIONS, {
    errorMap: () => ({ message: 'Región inválida' })
  }),
  year: z.string().optional().default(''),
  varietal: z.string().optional().default(''),
  image: z.string().optional(),
  featured: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  free_shipping: z.boolean().default(false),
  slug: z.string().optional()
})

// Schema con validación condicional
export const ProductSchema = BaseProductSchema.refine(
  (data) => {
    const isBox = data.category === 'Boxes'
    
    // Para boxes, year y varietal son opcionales
    if (isBox) {
      return true
    }
    
    // Para productos individuales, year y varietal son requeridos
    return data.year && data.year.trim() !== '' && data.varietal && data.varietal.trim() !== ''
  },
  {
    message: 'Para productos individuales (no boxes), el año y varietal son requeridos',
    path: ['year'] // Esto hará que el error aparezca en el campo year
  }
)

// Schema específico para boxes (más permisivo)
export const BoxProductSchema = BaseProductSchema.extend({
  year: z.string().optional().default('N/A'),
  varietal: z.string().optional().default('Múltiples'),
})

// Schema específico para botellas individuales (más estricto)
export const BottleProductSchema = BaseProductSchema.extend({
  year: z.string().min(1, 'El año es requerido para productos individuales'),
  varietal: z.string().min(1, 'El varietal es requerido para productos individuales'),
})

export type ProductFormData = z.infer<typeof ProductSchema>

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const ImageSchema = z.object({
  image_file: z
    .custom<FileList>()
    .refine((files) => files?.length === 0 || files?.length === 1, 'La imagen es requerida')
    .refine(
      (files) => files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      'El tamaño máximo es 10MB'
    )
    .refine(
      (files) => files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      'Solo se permiten archivos .jpg, .jpeg, .png y .webp'
    )
    .optional()
}) 