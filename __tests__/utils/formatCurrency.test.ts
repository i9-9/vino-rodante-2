import { formatCurrency, formatPrice } from '@/lib/utils'

describe('formatCurrency function', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(100)).toMatch(/\$.*100,00/)
    expect(formatCurrency(1000)).toMatch(/\$.*1\.000,00/)
    expect(formatCurrency(1000000)).toMatch(/\$.*1\.000\.000,00/)
  })

  it('formats decimal numbers correctly', () => {
    expect(formatCurrency(100.50)).toMatch(/\$.*100,50/)
    expect(formatCurrency(100.99)).toMatch(/\$.*100,99/)
    expect(formatCurrency(100.00)).toMatch(/\$.*100,00/)
  })

  it('handles zero correctly', () => {
    expect(formatCurrency(0)).toMatch(/\$.*0,00/)
  })

  it('handles negative numbers correctly', () => {
    expect(formatCurrency(-100)).toMatch(/-.*\$.*100,00/)
    expect(formatCurrency(-100.50)).toMatch(/-.*\$.*100,50/)
  })

  it('handles very small decimal numbers', () => {
    expect(formatCurrency(0.01)).toMatch(/\$.*0,01/)
    expect(formatCurrency(0.99)).toMatch(/\$.*0,99/)
  })

  it('handles very large numbers', () => {
    expect(formatCurrency(999999999.99)).toMatch(/\$.*999\.999\.999,99/)
  })

  it('handles edge cases', () => {
    expect(formatCurrency(0.001)).toMatch(/\$.*0,00/)
    expect(formatCurrency(0.999)).toMatch(/\$.*1,00/)
    expect(formatCurrency(1.999)).toMatch(/\$.*2,00/)
  })

  it('maintains consistent formatting across different inputs', () => {
    const inputs = [100, 100.50, 1000, 1000.99, 0, -100]
    
    inputs.forEach((input) => {
      const result = formatCurrency(input)
      expect(result).toMatch(/\$.*/)
      expect(result).toMatch(/,/)
    })
  })
})

describe('formatPrice function', () => {
  it('formats prices without decimal places', () => {
    expect(formatPrice(100)).toMatch(/\$.*100/)
    expect(formatPrice(1000)).toMatch(/\$.*1\.000/)
    expect(formatPrice(0)).toMatch(/\$.*0/)
  })

  it('handles negative prices', () => {
    expect(formatPrice(-100)).toMatch(/-.*\$.*100/)
  })

  it('rounds decimal prices to whole numbers', () => {
    expect(formatPrice(100.50)).toMatch(/\$.*101/)
    expect(formatPrice(100.99)).toMatch(/\$.*101/)
    expect(formatPrice(100.01)).toMatch(/\$.*100/)
  })
})
