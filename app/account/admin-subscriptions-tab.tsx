'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { deleteSubscription } from './actions/subscriptions'
import Image from 'next/image'
import type { Subscription } from './types'

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

  const formatClubName = (name: string) => {
    // Si el nombre empieza con "Club" o "CLUB", lo quitamos y capitalizamos la primera letra
    const cleanName = name.replace(/^club\s+/i, '')
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start gap-4">
              {/* Imagen del club */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={subscription.image || `/images/club/${subscription.club}.jpg`}
                  alt={subscription.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Información del club */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{subscription.name}</h3>
                  <Badge variant={subscription.is_visible ? 'default' : 'secondary'}>
                    {subscription.is_visible ? 'Visible' : 'Oculto'}
                  </Badge>
                </div>

                {subscription.tagline && (
                  <p className="text-sm text-muted-foreground italic">{subscription.tagline}</p>
                )}
                
                <p className="text-sm text-muted-foreground">{subscription.description}</p>

                {/* Precios */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Mensual</div>
                    <span className="font-medium">{formatCurrency(subscription.price_monthly)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Bimestral</div>
                    <span className="font-medium">{formatCurrency(subscription.price_bimonthly)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Trimestral</div>
                    <span className="font-medium">{formatCurrency(subscription.price_quarterly)}</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
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