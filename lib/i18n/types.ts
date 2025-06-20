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
    profile: string
    profileInfo: string
    orders: string
    [key: string]: string
  }
  [key: string]: any
} 