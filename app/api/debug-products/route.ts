import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/products-client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data: products, error } = await getProducts()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Extraer varietales únicos
  const varietals = new Set<string>()
  const regions = new Set<string>()
  const combinations: { varietal: string; region: string; count: number }[] = []
  const combinationMap = new Map<string, number>()

  products?.forEach(product => {
    if (product.varietal) {
      varietals.add(product.varietal)
    }
    if (product.region) {
      regions.add(product.region)
    }

    if (product.varietal && product.region) {
      const key = `${product.varietal}|${product.region}`
      combinationMap.set(key, (combinationMap.get(key) || 0) + 1)
    }
  })

  combinationMap.forEach((count, key) => {
    const [varietal, region] = key.split('|')
    combinations.push({ varietal, region, count })
  })

  combinations.sort((a, b) => b.count - a.count)

  return NextResponse.json({
    totalProducts: products?.length || 0,
    uniqueVarietals: Array.from(varietals).sort(),
    uniqueRegions: Array.from(regions).sort(),
    topCombinations: combinations.slice(0, 20),
    allCombinations: combinations,
  })
}
