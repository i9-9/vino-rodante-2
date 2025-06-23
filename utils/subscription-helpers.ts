import { format, addWeeks, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import type { 
  SubscriptionFrequency, 
  SubscriptionPlan,
  SubscriptionPricing 
} from '@/types/subscription';
import { SubscriptionFrequency as AccountSubscriptionFrequency } from '@/app/account/types'

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(cents / 100);
}

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr, { locale: es });
}

export function calculateNextDeliveryDate(
  frequency: SubscriptionFrequency,
  fromDate: Date = new Date()
): Date {
  const nextDate = new Date(fromDate)
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14)
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
  }
  
  return nextDate
}

export const formatFrequency = (frequency: string): string => {
  const frequencies = {
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual'
  }
  return frequencies[frequency as keyof typeof frequencies] || frequency
}

export function getFrequencyLabel(frequency: SubscriptionFrequency): string {
  const labels: Record<SubscriptionFrequency, string> = {
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual'
  };
  return labels[frequency];
}

export function calculateSubscriptionPrice(
  plan: SubscriptionPlan,
  frequency: SubscriptionFrequency
): number {
  switch (frequency) {
    case 'weekly':
      return plan.price_weekly;
    case 'biweekly':
      return plan.price_biweekly;
    case 'monthly':
      return plan.price_monthly;
    default:
      return 0;
  }
}

export function calculateDiscountPercentage(
  plan: SubscriptionPlan,
  frequency: SubscriptionFrequency
): number {
  const weeklyPrice = plan.price_weekly;
  const selectedPrice = calculateSubscriptionPrice(plan, frequency);
  
  if (!weeklyPrice || !selectedPrice) return 0;
  
  // Calcular el precio equivalente semanal para la frecuencia seleccionada
  const weeksInPeriod = frequency === 'monthly' ? 4 : frequency === 'biweekly' ? 2 : 1;
  const equivalentWeeklyPrice = selectedPrice / weeksInPeriod;
  
  // Calcular el porcentaje de descuento
  const discount = ((weeklyPrice - equivalentWeeklyPrice) / weeklyPrice) * 100;
  
  return Math.round(discount);
}

export function getPricingDetails(plan: SubscriptionPlan): SubscriptionPricing {
  return {
    weekly: plan.price_weekly,
    biweekly: plan.price_biweekly,
    monthly: plan.price_monthly,
    quarterly: plan.price_quarterly,
    discounts: {
      biweekly: calculateDiscountPercentage(plan, 'biweekly'),
      monthly: calculateDiscountPercentage(plan, 'monthly'),
      quarterly: plan.discount_percentage
    }
  };
}

export function getMercadoPagoFrequencyConfig(frequency: SubscriptionFrequency) {
  switch (frequency) {
    case 'weekly':
      return { frequency: 1, frequency_type: 'weeks' as const };
    case 'biweekly':
      return { frequency: 2, frequency_type: 'weeks' as const };
    case 'monthly':
      return { frequency: 1, frequency_type: 'months' as const };
    default:
      throw new Error(`Frecuencia no soportada: ${frequency}`);
  }
}

export function getDeliveryStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'En proceso',
    shipped: 'Enviado',
    delivered: 'Entregado',
    failed: 'Fallido'
  };
  return statusLabels[status] || status;
}

export function getSubscriptionStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    active: 'Activa',
    paused: 'Pausada',
    cancelled: 'Cancelada',
    pending: 'Pendiente',
    failed: 'Fallida'
  };
  return statusLabels[status] || status;
}

export function getSubscriptionStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'text-green-600',
    paused: 'text-yellow-600',
    cancelled: 'text-red-600',
    pending: 'text-blue-600',
    failed: 'text-red-600'
  };
  return statusColors[status] || 'text-gray-600';
} 