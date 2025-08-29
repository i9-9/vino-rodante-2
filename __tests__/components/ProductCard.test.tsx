import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '@/components/product-card'

// Mock the useCart hook
jest.mock('@/lib/hooks/use-cart', () => ({
  useCart: () => ({
    addItem: jest.fn(),
    items: [],
  }),
}))

// Mock the useTranslations hook
jest.mock('@/lib/providers/translations-provider', () => ({
  useTranslations: () => ({
    common: {
      addToCart: 'Add to Cart',
      viewDetails: 'View Details',
    },
  }),
}))

const mockProduct = {
  id: '1',
  name: 'Test Wine',
  description: 'A delicious test wine',
  price: 100,
  image: '/test-image.jpg',
  category: 'Tinto',
  region: 'Mendoza',
  year: '2020',
  varietal: 'Malbec',
  featured: true,
  is_visible: true,
  stock: 10,
  slug: 'test-wine',
}

describe('ProductCard Component', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Wine')).toBeInTheDocument()
    expect(screen.getByText('A delicious test wine')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText('Mendoza')).toBeInTheDocument()
    expect(screen.getByText('2020')).toBeInTheDocument()
    expect(screen.getByText('Malbec')).toBeInTheDocument()
  })

  it('displays product image with correct alt text', () => {
    render(<ProductCard product={mockProduct} />)
    
    const image = screen.getByAltText('Test Wine')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/test-image.jpg')
  })

  it('shows featured badge when product is featured', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('does not show featured badge when product is not featured', () => {
    const nonFeaturedProduct = { ...mockProduct, featured: false }
    render(<ProductCard product={nonFeaturedProduct} />)
    
    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })

  it('displays stock information when available', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('10 in stock')).toBeInTheDocument()
  })

  it('shows out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    
    expect(screen.getByText('Out of stock')).toBeInTheDocument()
  })

  it('renders add to cart button', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
  })

  it('renders view details button', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument()
  })

  it('applies correct CSS classes for styling', () => {
    render(<ProductCard product={mockProduct} />)
    
    const card = screen.getByTestId('product-card')
    expect(card).toHaveClass('group relative bg-background border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow')
  })

  it('handles missing optional fields gracefully', () => {
    const minimalProduct = {
      id: '2',
      name: 'Minimal Wine',
      description: null,
      price: 50,
      image: null,
      category: null,
      region: null,
      year: null,
      varietal: null,
      featured: false,
      is_visible: true,
      stock: 5,
      slug: 'minimal-wine',
    }
    
    render(<ProductCard product={minimalProduct} />)
    
    expect(screen.getByText('Minimal Wine')).toBeInTheDocument()
    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByText('5 in stock')).toBeInTheDocument()
  })

  it('applies hover effects correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    const card = screen.getByTestId('product-card')
    expect(card).toHaveClass('hover:shadow-md')
  })

  it('maintains accessibility attributes', () => {
    render(<ProductCard product={mockProduct} />)
    
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    const viewDetailsButton = screen.getByRole('button', { name: /view details/i })
    
    expect(addToCartButton).toHaveAttribute('type', 'button')
    expect(viewDetailsButton).toHaveAttribute('type', 'button')
  })
})

