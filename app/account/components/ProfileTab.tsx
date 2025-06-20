import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface ProfileTabProps {
  user: User
  profile: Profile
  t: any
}

export function ProfileTab({ user, profile, t }: ProfileTabProps) {
  // Función para formatear la fecha de manera consistente
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.account.profile}</h2>
      </div>

      <div className="grid gap-4">
        <div className="p-4 border rounded-lg">
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-500">{t.account.name}</p>
              <p>{profile.name || t.account.noName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t.account.email}</p>
              <p>{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t.account.memberSince}</p>
              <p>{formatDate(profile.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 