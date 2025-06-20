'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { deleteSubscription } from './actions/subscriptions'

interface Subscription {
  id: string
  name: string
  description: string
  price: number
  interval: 'monthly' | 'quarterly' | 'yearly'
  active: boolean
  created_at: string
}

interface AdminSubscriptionsTabProps {
  subscriptions: Subscription[]
  onEdit: (subscription: Subscription) => void
  t: any
}

export default function AdminSubscriptionsTab({ subscriptions, onEdit, t }: AdminSubscriptionsTabProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (subscriptionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan de suscripción?')) {
      return
    }

    setIsLoading(true)
    try {
      await deleteSubscription(subscriptionId)
    } catch (error) {
      console.error('Error deleting subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No hay planes de suscripción para mostrar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{subscription.name}</h3>
                  <Badge variant={subscription.active ? 'default' : 'secondary'}>
                    {subscription.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{subscription.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="font-medium">{formatCurrency(subscription.price)}</span>
                  <Badge variant="outline">
                    {subscription.interval === 'monthly' ? 'Mensual' :
                     subscription.interval === 'quarterly' ? 'Trimestral' :
                     'Anual'}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(subscription)}
                  title="Editar suscripción"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(subscription.id)}
                  title="Eliminar suscripción"
                  disabled={isLoading}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 