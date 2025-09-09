import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { applyDiscountsToProducts } from '@/lib/discount-utils'
import type { Discount } from '@/app/account/types/discount'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Obtener descuentos activos
    const { data: discounts, error: discountsError } = await supabase
      .from('discounts')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .lte('start_date', new Date().toISOString())

    if (discountsError) {
      console.error('Error fetching discounts:', discountsError)
      return NextResponse.json({ error: 'Error fetching discounts' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      discounts: discounts || [] 
    })

  } catch (error) {
    console.error('Error in active discounts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
