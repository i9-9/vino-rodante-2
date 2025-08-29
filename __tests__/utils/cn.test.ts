import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('combines class names correctly', () => {
    const result = cn('class1', 'class2', 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    )
    
    expect(result).toBe('base-class active-class')
  })

  it('handles object notation for conditional classes', () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn({
      'base-class': true,
      'active-class': isActive,
      'disabled-class': isDisabled,
      'hidden': false
    })
    
    expect(result).toBe('base-class active-class')
  })

  it('handles arrays of classes', () => {
    const classes = ['class1', 'class2', 'class3']
    const result = cn(...classes)
    
    expect(result).toBe('class1 class2 class3')
  })

  it('handles mixed input types', () => {
    const isActive = true
    const classes = ['class1', 'class2']
    
    const result = cn(
      'base-class',
      ...classes,
      isActive && 'active-class',
      { 'conditional-class': true }
    )
    
    expect(result).toBe('base-class class1 class2 active-class conditional-class')
  })

  it('handles empty and falsy values', () => {
    const result = cn(
      'base-class',
      '',
      null,
      undefined,
      false,
      0
    )
    
    expect(result).toBe('base-class')
  })

  it('handles Tailwind class conflicts correctly', () => {
    // This tests that tailwind-merge is working
    const result = cn('px-2 py-1', 'px-4 py-2')
    
    // Should merge conflicting classes, keeping the last one
    expect(result).toBe('px-4 py-2')
  })

  it('handles complex conditional logic', () => {
    const variant = 'primary'
    const size = 'large'
    const isDisabled = false
    
    const result = cn(
      'base-button',
      {
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
        'btn-small': size === 'small',
        'btn-large': size === 'large',
        'btn-disabled': isDisabled
      }
    )
    
    expect(result).toBe('base-button btn-primary btn-large')
  })

  it('handles nested conditional objects', () => {
    const theme = 'dark'
    const size = 'medium'
    
    const result = cn({
      'base-component': true,
      'theme': {
        'light': theme === 'light',
        'dark': theme === 'dark'
      },
      'size': {
        'small': size === 'small',
        'medium': size === 'medium',
        'large': size === 'large'
      }
    })
    
    // Note: nested objects won't work with clsx, this is just for testing
    expect(result).toBe('base-component theme size')
  })

  it('handles function calls that return classes', () => {
    const getSizeClass = (size: string) => `size-${size}`
    const getVariantClass = (variant: string) => `variant-${variant}`
    
    const result = cn(
      'base',
      getSizeClass('large'),
      getVariantClass('primary')
    )
    
    expect(result).toBe('base size-large variant-primary')
  })
})

describe('cn utility function', () => {
  it('combines class names correctly', () => {
    const result = cn('class1', 'class2', 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    )
    
    expect(result).toBe('base-class active-class')
  })

  it('handles object notation for conditional classes', () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn({
      'base-class': true,
      'active-class': isActive,
      'disabled-class': isDisabled,
      'hidden': false
    })
    
    expect(result).toBe('base-class active-class')
  })

  it('handles arrays of classes', () => {
    const classes = ['class1', 'class2', 'class3']
    const result = cn(...classes)
    
    expect(result).toBe('class1 class2 class3')
  })

  it('handles mixed input types', () => {
    const isActive = true
    const classes = ['class1', 'class2']
    
    const result = cn(
      'base-class',
      ...classes,
      isActive && 'active-class',
      { 'conditional-class': true }
    )
    
    expect(result).toBe('base-class class1 class2 active-class conditional-class')
  })

  it('handles empty and falsy values', () => {
    const result = cn(
      'base-class',
      '',
      null,
      undefined,
      false,
      0
    )
    
    expect(result).toBe('base-class')
  })

  it('handles Tailwind class conflicts correctly', () => {
    // This tests that tailwind-merge is working
    const result = cn('px-2 py-1', 'px-4 py-2')
    
    // Should merge conflicting classes, keeping the last one
    expect(result).toBe('px-4 py-2')
  })

  it('handles complex conditional logic', () => {
    const variant = 'primary'
    const size = 'large'
    const isDisabled = false
    
    const result = cn(
      'base-button',
      {
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
        'btn-small': size === 'small',
        'btn-large': size === 'large',
        'btn-disabled': isDisabled
      }
    )
    
    expect(result).toBe('base-button btn-primary btn-large')
  })

  it('handles nested conditional objects', () => {
    const theme = 'dark'
    const size = 'medium'
    
    const result = cn({
      'base-component': true,
      'theme': {
        'light': theme === 'light',
        'dark': theme === 'dark'
      },
      'size': {
        'small': size === 'small',
        'medium': size === 'medium',
        'large': size === 'large'
      }
    })
    
    // Note: nested objects won't work with clsx, this is just for testing
    expect(result).toBe('base-component theme size')
  })

  it('handles function calls that return classes', () => {
    const getSizeClass = (size: string) => `size-${size}`
    const getVariantClass = (variant: string) => `variant-${variant}`
    
    const result = cn(
      'base',
      getSizeClass('large'),
      getVariantClass('primary')
    )
    
    expect(result).toBe('base size-large variant-primary')
  })
})
