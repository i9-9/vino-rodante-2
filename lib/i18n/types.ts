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
    adminSubscriptions: string
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
    errors: {
      noChanges: string
      unauthorized: string
      validationErrors: string
      cannotDeleteOnlyAddress: string
      cannotDeleteDefaultAddress: string
      [key: string]: string
    }
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
    active: string
    paused: string
    cancelled: string
    expired: string
    [key: string]: string
  }
  [key: string]: any
} 