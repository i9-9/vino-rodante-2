"use client"

import { User } from '@supabase/supabase-js'
import type { Translations } from '@/lib/i18n/types'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { signOut } from '@/app/auth/actions'

interface AccountClientProps {
  initialUser: User
  t: Translations
}

export default function AccountClient({ initialUser, t }: AccountClientProps) {
  const lastSignInDate = initialUser.last_sign_in_at || ''

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t.account.title}</h1>
            <form action={async () => {
              const result = await signOut()
              if (result?.error) {
                toast.error(`Error al cerrar sesión: ${result.error}`)
              }
            }}>
              <Button 
                type="submit"
                variant="outline" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.common.signOut}
              </Button>
            </form>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="font-semibold mb-2">{t.account.profileInfo}</h2>
              <div className="space-y-2">
                <p><strong>Email:</strong> {initialUser.email}</p>
                <p><strong>ID:</strong> {initialUser.id}</p>
                {lastSignInDate && (
                  <p>
                    <strong>{t.account.profile}:</strong>{' '}
                    <time dateTime={lastSignInDate}>
                      {lastSignInDate}
                    </time>
                  </p>
                )}
              </div>
            </div>

            {/* Aquí va el resto del contenido de la cuenta */}
                                </div>
                  </div>
                </div>
    </div>
  )
} 