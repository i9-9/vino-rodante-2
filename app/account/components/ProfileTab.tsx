'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '../actions/profile'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface ProfileTabProps {
  user: User
  profile: Profile
  t: any
}

export function ProfileTab({ user, profile, t }: ProfileTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdateProfile = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await updateProfile(formData)
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else if (result.success) {
        toast({
          title: "Éxito",
          description: result.message || t.account?.profileUpdated || 'Perfil actualizado correctamente',
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: t.errors?.unknown || 'Error desconocido',
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: t.errors?.unknown || 'Error desconocido',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.account.profileInfo}</CardTitle>
        <CardDescription>{t.account.updateProfile}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleUpdateProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={user.email || ''} 
                disabled 
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                {t.account?.emailCannotChange || 'El email no se puede cambiar'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t.account?.name || 'Nombre'}</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={profile?.name || ''} 
                placeholder={t.account?.namePlaceholder || 'Ingresa tu nombre'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.account?.phone || 'Teléfono'}</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel"
                defaultValue={profile?.phone || ''} 
                placeholder={t.account?.phonePlaceholder || 'Ingresa tu teléfono'}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? t.common.saving : t.common.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 