import { z } from 'zod'

// Import schemas from the project
// Note: You'll need to create these schemas or import them from your actual files
const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category: z.enum(['Tinto', 'Blanco', 'Rosado', 'Espumante', 'Dulce', 'Boxes']),
  region: z.string().min(1, 'Region is required'),
  year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
  varietal: z.string().optional(),
  featured: z.boolean(),
  is_visible: z.boolean(),
  slug: z.string().min(1, 'Slug is required'),
  image: z.string().url('Must be a valid URL').optional(),
})

const AddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  is_default: z.boolean().default(false),
})

const SubscriptionPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  club: z.string().min(1, 'Club is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price_monthly: z.number().positive('Monthly price must be positive'),
  price_quarterly: z.number().positive('Quarterly price must be positive'),
  discount_percentage: z.number().min(0).max(100, 'Discount must be between 0 and 100'),
  status: z.enum(['activo', 'inactivo']),
  is_visible: z.boolean(),
  type: z.enum(['tinto', 'blanco', 'mixto', 'premium']),
  wines_per_delivery: z.number().int().positive('Wines per delivery must be positive'),
})

describe('Product Validation Schema', () => {
  it('validates a valid product', () => {
    const validProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Wine',
      description: 'A delicious test wine',
      price: 100,
      stock: 10,
      category: 'Tinto' as const,
      region: 'Mendoza',
      year: '2020',
      varietal: 'Malbec',
      featured: true,
      is_visible: true,
      slug: 'test-wine',
      image: 'https://example.com/image.jpg',
    }

    const result = ProductSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it('rejects product with invalid UUID', () => {
    const invalidProduct = {
      id: 'invalid-uuid',
      name: 'Test Wine',
      price: 100,
      stock: 10,
      category: 'Tinto' as const,
      region: 'Mendoza',
      year: '2020',
      featured: false,
      is_visible: true,
      slug: 'test-wine',
    }

    const result = ProductSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid uuid')
    }
  })

  it('rejects product with negative price', () => {
    const invalidProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Wine',
      price: -100,
      stock: 10,
      category: 'Tinto' as const,
      region: 'Mendoza',
      year: '2020',
      featured: false,
      is_visible: true,
      slug: 'test-wine',
    }

    const result = ProductSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Price must be positive')
    }
  })

  it('rejects product with invalid category', () => {
    const invalidProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Wine',
      price: 100,
      stock: 10,
      category: 'InvalidCategory' as any,
      region: 'Mendoza',
      year: '2020',
      featured: false,
      is_visible: true,
      slug: 'test-wine',
    }

    const result = ProductSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
  })

  it('rejects product with invalid year format', () => {
    const invalidProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Wine',
      price: 100,
      stock: 10,
      category: 'Tinto' as const,
      region: 'Mendoza',
      year: '20',
      featured: false,
      is_visible: true,
      slug: 'test-wine',
    }

    const result = ProductSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Year must be 4 digits')
    }
  })
})

describe('Address Validation Schema', () => {
  it('validates a valid address', () => {
    const validAddress = {
      line1: '123 Main St',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      postal_code: '1001',
      country: 'Argentina',
      is_default: true,
    }

    const result = AddressSchema.safeParse(validAddress)
    expect(result.success).toBe(true)
  })

  it('rejects address with missing required fields', () => {
    const invalidAddress = {
      line1: '123 Main St',
      // Missing city, state, postal_code, country
    }

    const result = AddressSchema.safeParse(invalidAddress)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toHaveLength(3) // city, state, postal_code, country
    }
  })

  it('sets default value for is_default', () => {
    const addressWithoutDefault = {
      line1: '123 Main St',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      postal_code: '1001',
      country: 'Argentina',
    }

    const result = AddressSchema.parse(addressWithoutDefault)
    expect(result.is_default).toBe(false)
  })
})

describe('Subscription Plan Validation Schema', () => {
  it('validates a valid subscription plan', () => {
    const validPlan = {
      name: 'Premium Club',
      club: 'Premium',
      slug: 'premium-club',
      description: 'Premium wine subscription',
      price_monthly: 150,
      price_quarterly: 400,
      discount_percentage: 10,
      status: 'activo' as const,
      is_visible: true,
      type: 'premium' as const,
      wines_per_delivery: 3,
    }

    const result = SubscriptionPlanSchema.safeParse(validPlan)
    expect(result.success).toBe(true)
  })

  it('rejects plan with invalid discount percentage', () => {
    const invalidPlan = {
      name: 'Premium Club',
      club: 'Premium',
      slug: 'premium-club',
      description: 'Premium wine subscription',
      price_monthly: 150,
      price_quarterly: 400,
      discount_percentage: 150, // Invalid: > 100
      status: 'activo' as const,
      is_visible: true,
      type: 'premium' as const,
      wines_per_delivery: 3,
    }

    const result = SubscriptionPlanSchema.safeParse(invalidPlan)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Discount must be between 0 and 100')
    }
  })

  it('rejects plan with invalid type', () => {
    const invalidPlan = {
      name: 'Premium Club',
      club: 'Premium',
      slug: 'premium-club',
      description: 'Premium wine subscription',
      price_monthly: 150,
      price_quarterly: 400,
      discount_percentage: 10,
      status: 'activo' as const,
      is_visible: true,
      type: 'invalid-type' as any,
      wines_per_delivery: 3,
    }

    const result = SubscriptionPlanSchema.safeParse(invalidPlan)
    expect(result.success).toBe(false)
  })
})

describe('Schema Edge Cases', () => {
  it('handles empty strings appropriately', () => {
    const productWithEmptyStrings = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: '', // Empty string should fail min(1) validation
      price: 100,
      stock: 10,
      category: 'Tinto' as const,
      region: 'Mendoza',
      year: '2020',
      featured: false,
      is_visible: true,
      slug: 'test-wine',
    }

    const result = ProductSchema.safeParse(productWithEmptyStrings)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name is required')
    }
  })

  it('handles null and undefined values', () => {
    const productWithNulls = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Wine',
      price: 100,
      stock: 10,
      category: 'Tinto' as const,
      region: 'Mendoza',
      year: '2020',
      featured: false,
      is_visible: true,
      slug: 'test-wine',
      description: null, // Should be allowed as optional
      varietal: undefined, // Should be allowed as optional
    }

    const result = ProductSchema.safeParse(productWithNulls)
    expect(result.success).toBe(true)
  })
})

