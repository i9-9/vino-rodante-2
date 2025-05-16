import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types'

// Provide fallbacks to prevent runtime errors, but these won't work for actual API calls
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyiyvaqbyaywcysctcuv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5aXl2YXFieWF5d2N5c2N0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2OTExNDUsImV4cCI6MjA2MTI2NzE0NX0.nC1-nUCl7lpPZi4uwwotrRRuTKhc_LirTSMd_xnwjc8'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing in environment variables. Using hardcoded values for development only.')
}

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
