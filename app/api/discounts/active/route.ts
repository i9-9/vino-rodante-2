import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { applyDiscountsToProducts } from '@/lib/discount-utils'
import type { Discount } from '@/app/account/types/discount'

export async function GET() {
  try {
    const supabase = await createClient()
    const currentDate = new Date()
    const currentDayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Obtener descuentos activos
    const { data: discounts, error: discountsError } = await supabase
      .from('discounts')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', currentDate.toISOString())
      .lte('start_date', currentDate.toISOString())

    if (discountsError) {
      console.error('Error fetching discounts:', discountsError)
      return NextResponse.json({ error: 'Error fetching discounts' }, { status: 500 })
    }

    // Filtrar descuentos que aplican al día actual usando la columna days_of_week
    const validDiscounts = (discounts || []).filter(discount => {
      // Si no tiene restricciones de días, aplicar siempre
      if (!discount.days_of_week || discount.days_of_week.length === 0) {
        return true
      }
      
      // Verificar si el día actual está en los días permitidos
      return discount.days_of_week.includes(currentDayOfWeek)
    })

    return NextResponse.json({ 
      success: true, 
      discounts: validDiscounts 
    })

  } catch (error) {
    console.error('Error in active discounts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
