import { getAvailablePlans } from '@/app/account/actions/subscriptions'
import HeroClient from './hero-client'

export default async function Hero() {
  // Obtener los 4 planes activos y visibles
  const plansResult = await getAvailablePlans()
  const plans = plansResult.data || []
  const weeklyPlans = plans.slice(0, 4)

  // Si no hay planes disponibles, mostrar un fallback
  if (weeklyPlans.length === 0) {
    console.warn('No se encontraron planes de suscripción disponibles')
  }

  return <HeroClient weeklyPlans={weeklyPlans} />
}