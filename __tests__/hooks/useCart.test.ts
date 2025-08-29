import { renderHook, act } from '@testing-library/react'
import { useCart } from '@/lib/hooks/use-cart'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useCart Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart())
    
    expect(result.current.items).toEqual([])
    expect(result.current.itemCount).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('loads cart from localStorage on mount', () => {
    const mockCart = [
      { id: '1', name: 'Test Wine', price: 100, quantity: 2 },
      { id: '2', name: 'Another Wine', price: 150, quantity: 1 },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockCart))
    
    const { result } = renderHook(() => useCart())
    
    expect(result.current.items).toEqual(mockCart)
    expect(result.current.itemCount).toBe(3)
    expect(result.current.total).toBe(350)
  })

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Wine',
        price: 100,
        quantity: 1,
      })
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toEqual({
      id: '1',
      name: 'Test Wine',
      price: 100,
      quantity: 1,
    })
    expect(result.current.itemCount).toBe(1)
    expect(result.current.total).toBe(100)
  })

  it('updates quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Wine',
        price: 100,
        quantity: 1,
      })
    })
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Wine',
        price: 100,
        quantity: 2,
      })
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.itemCount).toBe(3)
    expect(result.current.total).toBe(300)
  })

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Wine',
        price: 100,
        quantity: 1,
      })
    })
    
    act(() => {
      result.current.removeItem('1')
    })
    
    expect(result.current.items).toHaveLength(0)
    expect(result.current.itemCount).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Wine',
        price: 100,
        quantity: 1,
      })
    })
    
    act(() => {
      result.current.updateItemQuantity('1', 3)
    })
    
    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.itemCount).toBe(3)
    expect(result.current.total).toBe(300)
  })

  it('clears cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Wine',
        price: 100,
        quantity: 1,
      })
    })
    
    act(() => {
      result.current.clearCart()
    })
    
    expect(result.current.items).toHaveLength(0)
    expect(result.current.itemCount).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('saves cart to localStorage when items change', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Wine',
        price: 100,
        quantity: 1,
      })
    })
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ id: '1', name: 'Test Wine', price: 100, quantity: 1 }])
    )
  })

  it('calculates total correctly with multiple items', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Wine 1',
        price: 100,
        quantity: 2,
      })
      result.current.addItem({
        id: '2',
        name: 'Wine 2',
        price: 150,
        quantity: 1,
      })
    })
    
    expect(result.current.total).toBe(350)
    expect(result.current.itemCount).toBe(3)
  })

  it('handles decimal prices correctly', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Wine',
        price: 99.99,
        quantity: 2,
      })
    })
    
    expect(result.current.total).toBe(199.98)
  })
})

