'use client'

import { useAnalytics } from '@/components/analytics'
import { ecommerceTracking, customEvents } from '@/lib/analytics'
import type { Product } from '@/lib/types'

// Hook for product tracking
export function useProductTracking() {
  const { trackEvent } = useAnalytics()

  const trackProductView = (product: Product) => {
    ecommerceTracking.trackProductView({
      id: product.id,
      name: product.name,
      category: product.category,
      brand: 'Vino Rodante',
      price: product.price,
      currency: 'ARS',
      region: product.region,
      varietal: product.varietal,
      year: product.year
    })
  }

  const trackAddToCart = (product: Product, quantity: number = 1) => {
    ecommerceTracking.trackAddToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      currency: 'ARS',
      quantity
    })
  }

  const trackProductSearch = (searchTerm: string, resultCount: number) => {
    ecommerceTracking.trackSearch(searchTerm, resultCount)
  }

  const trackVarietalInterest = (varietal: string, action: string) => {
    customEvents.trackVarietalInterest(varietal, action)
  }

  const trackRegionalInterest = (region: string, action: string) => {
    customEvents.trackRegionalInterest(region, action)
  }

  return {
    trackProductView,
    trackAddToCart,
    trackProductSearch,
    trackVarietalInterest,
    trackRegionalInterest
  }
}

// Hook for FAQ tracking
export function useFAQTracking() {
  const { trackEvent } = useAnalytics()

  const trackFAQInteraction = (question: string, category: string) => {
    customEvents.trackFAQInteraction(question, category)
  }

  const trackFAQExpand = (question: string, category: string) => {
    trackEvent('faq_expand', {
      event_category: 'FAQ',
      event_label: question,
      custom_map: {
        faq_category: category
      }
    })
  }

  return {
    trackFAQInteraction,
    trackFAQExpand
  }
}

// Hook for wine club tracking
export function useWineClubTracking() {
  const { trackEvent } = useAnalytics()

  const trackClubSubscription = (clubType: string, plan: string) => {
    ecommerceTracking.trackWineClubSubscription(clubType, plan)
  }

  const trackClubInterest = (clubType: string, action: string) => {
    trackEvent('wine_club_interest', {
      event_category: 'Wine Club',
      event_label: clubType,
      custom_map: {
        action_type: action
      }
    })
  }

  return {
    trackClubSubscription,
    trackClubInterest
  }
}

// Hook for newsletter tracking
export function useNewsletterTracking() {
  const { trackEvent } = useAnalytics()

  const trackNewsletterSignup = (email: string) => {
    ecommerceTracking.trackNewsletterSignup(email)
  }

  const trackNewsletterInterest = (action: string) => {
    trackEvent('newsletter_interest', {
      event_category: 'Newsletter',
      event_label: action
    })
  }

  return {
    trackNewsletterSignup,
    trackNewsletterInterest
  }
}

// Hook for checkout tracking
export function useCheckoutTracking() {
  const { trackEvent } = useAnalytics()

  const trackCheckoutStart = (items: Array<{id: string, name: string, price: number, quantity: number}>) => {
    trackEvent('begin_checkout', {
      currency: 'ARS',
      value: items.reduce((total, item) => total + (item.price * item.quantity), 0),
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        currency: 'ARS'
      }))
    })
  }

  const trackCheckoutStep = (step: string, stepNumber: number) => {
    trackEvent('checkout_progress', {
      event_category: 'Checkout',
      event_label: step,
      custom_map: {
        step_number: stepNumber
      }
    })
  }

  const trackPurchase = (transactionId: string, items: Array<{id: string, name: string, price: number, quantity: number}>) => {
    ecommerceTracking.trackPurchase({
      transaction_id: transactionId,
      value: items.reduce((total, item) => total + (item.price * item.quantity), 0),
      currency: 'ARS',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        category: 'Wine',
        price: item.price,
        quantity: item.quantity
      }))
    })
  }

  return {
    trackCheckoutStart,
    trackCheckoutStep,
    trackPurchase
  }
}
