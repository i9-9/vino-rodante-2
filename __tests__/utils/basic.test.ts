describe('Basic Test Suite', () => {
  it('should pass basic arithmetic', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
    expect(3 * 4).toBe(12)
    expect(15 / 3).toBe(5)
  })

  it('should handle string operations', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World')
    expect('Test'.length).toBe(4)
    expect('Wine'.toUpperCase()).toBe('WINE')
  })

  it('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers.length).toBe(5)
    expect(numbers[0]).toBe(1)
    expect(numbers.slice(0, 3)).toEqual([1, 2, 3])
  })

  it('should handle object operations', () => {
    const product = {
      id: '1',
      name: 'Test Wine',
      price: 100
    }
    
    expect(product.name).toBe('Test Wine')
    expect(product.price).toBe(100)
    expect(Object.keys(product)).toHaveLength(3)
  })

  it('should handle conditional logic', () => {
    const isActive = true
    const isVisible = false
    
    expect(isActive && isVisible).toBe(false)
    expect(isActive || isVisible).toBe(true)
    expect(!isVisible).toBe(true)
  })
})

