import { z } from 'zod'

export const CATEGORIES = [
  'Tinto',
  'Blanco',
  'Rosado',
  'Espumante',
  'Dulce',
  'Boxes',
  'Otro'
] as const

export const REGIONS = [
  'Mendoza',
  'San Juan',
  'La Rioja',
  'Salta',
  'Catamarca',
  'Neuquén',
  'Río Negro',
  'Córdoba',
  'Buenos Aires'
] as const

export const ProductSchema = z.object({
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
  slug: z.string().optional()
})

export type ProductFormData = z.infer<typeof ProductSchema>

export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const ImageSchema = z.object({
  image_file: z
    .custom<FileList>()
    .refine((files) => files?.length === 0 || files?.length === 1, 'La imagen es requerida')
    .refine(
      (files) => files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      'El tamaño máximo es 2MB'
    )
    .refine(
      (files) => files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      'Solo se permiten archivos .jpg, .jpeg, .png y .webp'
    )
    .optional()
}) 