'use client'

import { useEffect } from 'react'

// Google Search Console verification component
export function GoogleSearchConsoleVerification() {
  useEffect(() => {
    // This component can be used to add any Search Console specific tracking
    // For now, it's just a placeholder for future enhancements
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Google Search Console verification ready')
    }
  }, [])

  return null
}

// Helper function to get verification code from environment
export function getGoogleSearchConsoleVerificationCode(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || ''
}

// Meta tag component for Search Console verification
export function GoogleSearchConsoleMeta() {
  const verificationCode = getGoogleSearchConsoleVerificationCode()
  
  if (!verificationCode) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Google Search Console verification code not found')
    }
    return null
  }

  return (
    <meta 
      name="google-site-verification" 
      content={verificationCode} 
    />
  )
}
