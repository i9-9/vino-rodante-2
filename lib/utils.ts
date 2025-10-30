import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { redirect } from 'next/navigation'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    currencyDisplay: "code",
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export function encodedRedirect(
  type: 'error' | 'success',
  path: string,
  message: string
) {
  const searchParams = new URLSearchParams()
  searchParams.set(type, message)
  return redirect(`${path}?${searchParams.toString()}`)
}
