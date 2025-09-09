import type { SubscriptionFrequency, SubscriptionStatus, SubscriptionAction } from '@/app/account/types'

export interface Translations {
  common: {
    search: string
    cart: string
    account: string
    signIn: string
    signUp: string
    signOut: string
    menu: string
    close: string
    loading: string
    error: string
    success: string
    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    remove: string
    create: string
    [key: string]: string
  }
  navigation: {
    home: string
    products: string
    about: string
    contact: string
    account: string
    weeklyWine: string
    [key: string]: string
  }
  account: {
    title: string
    subtitle: string
    profile: string
    orders: string
    addresses: string
    subscriptions: string
    adminOrders: string
    adminProducts: string
    adminDiscounts: string
    adminSubscriptions: string
    adminPlans: string
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
    activeSubscriptions: string
    availablePlans: string
    subscriptionDetails: string
    frequency: string
    nextDelivery: string
    price: string
    winesPerDelivery: string
    included: string
    pauseSubscription: string
    cancelSubscription: string
    resumeSubscription: string
    subscriptionStatus: {
      active: string
      paused: string
      cancelled: string
      expired: string
      [key: string]: string
    }
    subscriptionFrequency: {
      weekly: string
      biweekly: string
      monthly: string
      [key: string]: string
    }
    subscriptionPaused: string
    subscriptionCancelled: string
    subscriptionCreated: string
    subscribe: string
    weekly: string
    biweekly: string
    monthly: string
    pricing: string
    errors: {
      updateError: string
      createError: string
      saveError: string
      unknownError: string
      signOutError: string
    }
    [key: string]: string | { [key: string]: string }
  }
  admin: {
    subscriptionPlans: string
    createPlan: string
    editPlan: string
    createPlanDesc: string
    editPlanDesc: string
    planName: string
    planSlug: string
    planDescription: string
    planType: string
    priceWeekly: string
    priceBiweekly: string
    priceMonthly: string
    winesPerDelivery: string
    features: string
    newFeature: string
    addFeature: string
    isVisible: string
    isActive: string
    active: string
    inactive: string
    confirmDelete: string
    planCreated: string
    planUpdated: string
    planDeleted: string
    wineTypes: {
      tinto: string
      blanco: string
      mixto: string
      premium: string
      [key: string]: string
    }
    pricing: string
    details: string
    type: string
    weekly: string
    biweekly: string
    monthly: string
    orders: string
    products: string
    subscriptions: string
    [key: string]: string | { [key: string]: string }
  }
  orders: {
    title: string
    noOrders: string
    orderNumber: string
    orderDate: string
    orderStatus: string
    orderTotal: string
    orderItems: string
    orderCustomer: string
    orderAddress: string
    orderPayment: string
    orderShipping: string
    [key: string]: string
  }
  subscriptions: {
    status: Record<SubscriptionStatus, string>
    frequency: Record<SubscriptionFrequency, string>
    actions: {
      pause: string
      reactivate: string
      cancel: string
      changePlan: string
    }
    actionSuccess: Record<SubscriptionAction, string>
    nextDelivery: string
    noDeliveryScheduled: string
    price: string
    month: string
    noSubscriptions: string
    exploreAvailable: string
  }
  errors: {
    updateError: string
    createError: string
    saveError: string
    unknownError: string
    signOutError: string
    [key: string]: string
  }
  [key: string]: unknown
} 