import { z } from 'zod'

// Schema para un producto individual dentro de un box
export const BoxProductSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1).default(1),
  name: z.string(),
  price: z.number().min(0),
  image: z.string().optional(),
  varietal: z.string().optional(),
  year: z.string().optional(),
  region: z.string().optional()
})

// Schema para un box completo
export const BoxSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'El nombre del box es requerido').max(100),
  description: z.string().min(1, 'La descripción del box es requerida').max(500),
  price: z.number().min(0, 'El precio debe ser positivo'),
  stock: z.number().min(0, 'El stock debe ser positivo'),
  category: z.literal('Boxes'),
  image: z.string().optional(),
  featured: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  slug: z.string().optional(),
  // Los productos del box se manejan en una tabla separada
  total_wines: z.number().min(1).default(3),
  discount_percentage: z.number().min(0).max(100).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

// Schema para crear un box
export const CreateBoxSchema = BoxSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
})

// Schema para actualizar un box
export const UpdateBoxSchema = BoxSchema.partial().omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
})

// Tipos TypeScript
export type BoxProduct = z.infer<typeof BoxProductSchema>
export type Box = z.infer<typeof BoxSchema>
export type CreateBox = z.infer<typeof CreateBoxSchema>
export type UpdateBox = z.infer<typeof UpdateBoxSchema>

// Schema para la tabla de relación box-productos
export const BoxProductRelationSchema = z.object({
  id: z.string().uuid().optional(),
  box_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().min(1).default(1),
  created_at: z.string().optional()
})

export type BoxProductRelation = z.infer<typeof BoxProductRelationSchema>
