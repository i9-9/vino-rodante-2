'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '../actions/profile'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface ProfileTabProps {
  user: User
  profile: Profile
  t: any
}

export function ProfileTab({ user, profile, t }: ProfileTabProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateProfile = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await updateProfile(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(t.account.profileUpdated)
      }
    } catch (error) {
      toast.error(t.errors.unknown)
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
                value={user.email} 
                disabled 
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                {t.account.emailCannotChange}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t.account.name}</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={profile?.name || ''} 
                placeholder={t.account.namePlaceholder}
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