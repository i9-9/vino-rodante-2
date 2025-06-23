'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFakeSubscription } from '@/app/account/actions/subscriptions'
import { toast } from 'sonner'
import type { SubscriptionPlan } from '@/app/account/types'
import type { Customer } from '@/app/account/types'

interface CreateFakeSubscriptionProps {
  plans: SubscriptionPlan[]
  users: Customer[]
}

export function CreateFakeSubscription({ plans, users }: CreateFakeSubscriptionProps) {
  const [selectedPlan, setSelectedPlan] = useState('')
  const [selectedFrequency, setSelectedFrequency] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!selectedPlan || !selectedFrequency) return
    
    setLoading(true)
    const result = await createFakeSubscription({
      planId: selectedPlan,
      frequency: selectedFrequency as 'weekly' | 'biweekly' | 'monthly',
      userId: selectedUser || undefined
    })
    
    if (result.success) {
      // Reset form y cerrar modal
      setSelectedPlan('')
      setSelectedFrequency('')
      setSelectedUser('')
      toast.success('Suscripción fake creada')
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          🧪 Crear Suscripción Fake
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Suscripción para Testing</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - {plan.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="biweekly">Quincenal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Usuario (opcional - por defecto tú)" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} - {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleCreate} 
            disabled={!selectedPlan || !selectedFrequency || loading}
            className="w-full"
          >
            {loading ? 'Creando...' : 'Crear Suscripción Fake'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 