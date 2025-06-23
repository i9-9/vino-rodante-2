'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pause, Play, X, RefreshCw, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency, formatPrice } from '@/lib/utils'
import { SubscriptionActionModal } from '@/components/ui/subscription-action-modal'
import type { UserSubscription, SubscriptionPlan } from '../types'
import type { Translations } from '@/lib/i18n/types'
import {
  pauseSubscription,
  reactivateSubscription,
  cancelSubscription,
  changeSubscriptionPlan,
  changeSubscriptionFrequency
} from '../actions/subscriptions'
import { formatFrequency } from '@/utils/subscription-helpers'

interface SubscriptionCardProps {
  subscription: UserSubscription
  onStatusChange: (id: string, status: 'paused' | 'cancelled') => Promise<void>
  t: Translations
}

function SubscriptionCard({ subscription, onStatusChange, t }: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price / 100)
  }

  const handleStatusChange = async (status: 'paused' | 'cancelled') => {
    setIsLoading(true)
    try {
      await onStatusChange(subscription.id, status)
      toast.success(status === 'paused' 
        ? t.account.subscriptionPaused 
        : t.account.subscriptionCancelled
      )
    } catch (error) {
      toast.error(t.errors.updateError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{subscription.subscription_plan.name}</CardTitle>
            <CardDescription>{subscription.subscription_plan.description}</CardDescription>
          </div>
          <Badge className={statusColors[subscription.status]}>
            {t.account.subscriptionStatus[subscription.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{t.account.subscriptionDetails}</h4>
            <div className="mt-2 space-y-2">
              <p>{t.account.frequency}: {t.account.subscriptionFrequency[subscription.frequency]}</p>
              <p>{t.account.nextDelivery}: {new Date(subscription.next_delivery_date).toLocaleDateString()}</p>
              <p>{t.account.price}: {formatPrice(subscription.subscription_plan[`price_${subscription.frequency}`])}</p>
              <p>{t.account.winesPerDelivery}: {subscription.subscription_plan.wines_per_delivery}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium">{t.account.included}</h4>
            <ul className="mt-2 space-y-1">
              {subscription.subscription_plan.features.map((feature, index) => (
                <li key={index} className="text-sm">• {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {subscription.status === 'active' && (
          <>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('paused')}
              disabled={isLoading}
            >
              {t.account.pauseSubscription}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusChange('cancelled')}
              disabled={isLoading}
            >
              {t.account.cancelSubscription}
            </Button>
          </>
        )}
        {subscription.status === 'paused' && (
          <Button
            variant="default"
            onClick={() => handleStatusChange('active')}
            disabled={isLoading}
          >
            {t.account.resumeSubscription}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

interface AvailablePlanCardProps {
  plan: SubscriptionPlan
  onSubscribe: (planId: string, frequency: 'weekly' | 'biweekly' | 'monthly') => Promise<void>
  t: Translations
}

function AvailablePlanCard({ plan, onSubscribe, t }: AvailablePlanCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly')

  const handleSubscribe = async () => {
    setIsLoading(true)
    try {
      await onSubscribe(plan.id, selectedFrequency)
      toast.success(t.account.subscriptionCreated)
    } catch (error) {
      toast.error(t.errors.createError)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price / 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{t.account.pricing}</h4>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`weekly-${plan.id}`}
                  name={`frequency-${plan.id}`}
                  value="weekly"
                  checked={selectedFrequency === 'weekly'}
                  onChange={(e) => setSelectedFrequency(e.target.value as 'weekly')}
                />
                <label htmlFor={`weekly-${plan.id}`}>
                  {t.account.weekly}: {formatPrice(plan.price_weekly)}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`biweekly-${plan.id}`}
                  name={`frequency-${plan.id}`}
                  value="biweekly"
                  checked={selectedFrequency === 'biweekly'}
                  onChange={(e) => setSelectedFrequency(e.target.value as 'biweekly')}
                />
                <label htmlFor={`biweekly-${plan.id}`}>
                  {t.account.biweekly}: {formatPrice(plan.price_biweekly)}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`monthly-${plan.id}`}
                  name={`frequency-${plan.id}`}
                  value="monthly"
                  checked={selectedFrequency === 'monthly'}
                  onChange={(e) => setSelectedFrequency(e.target.value as 'monthly')}
                />
                <label htmlFor={`monthly-${plan.id}`}>
                  {t.account.monthly}: {formatPrice(plan.price_monthly)}
                </label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium">{t.account.included}</h4>
            <ul className="mt-2 space-y-1">
              {(plan.features || []).map((feature, index) => (
                <li key={index} className="text-sm">• {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {t.account.subscribe}
        </Button>
      </CardFooter>
    </Card>
  )
}

interface SubscriptionsTabProps {
  subscriptions: UserSubscription[]
  availablePlans: SubscriptionPlan[]
  t: Translations
}

type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired'

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800'
}

const ACTION_SUCCESS_MESSAGES = {
  pause: 'Suscripción pausada exitosamente',
  cancel: 'Suscripción cancelada exitosamente',
  reactivate: 'Suscripción reactivada exitosamente',
  'change-plan': 'Plan actualizado exitosamente',
  'change-frequency': 'Frecuencia cambiada exitosamente'
} as const

export function SubscriptionsTab({ subscriptions, availablePlans, t }: SubscriptionsTabProps) {
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null)
  const [modalAction, setModalAction] = useState<'pause' | 'cancel' | 'reactivate' | 'change-plan' | 'change-frequency' | null>(null)

  const handleAction = async (reason?: string, newPlan?: string, newFrequency?: string) => {
    if (!selectedSubscription) return

    try {
      let result
      switch (modalAction) {
        case 'pause':
          result = await pauseSubscription(selectedSubscription.id)
          break
        case 'reactivate':
          result = await reactivateSubscription(selectedSubscription.id)
          break
        case 'cancel':
          result = await cancelSubscription(selectedSubscription.id)
          break
        case 'change-plan':
          if (newPlan) {
            result = await changeSubscriptionPlan(selectedSubscription.id, newPlan)
          }
          break
        case 'change-frequency':
          if (!newFrequency) {
            toast.error('Debes seleccionar una frecuencia')
            return
          }
          result = await changeSubscriptionFrequency(
            selectedSubscription.id, 
            newFrequency as 'weekly' | 'biweekly' | 'monthly'
          )
          break
        default:
          toast.error('Acción no válida')
          return
      }

      if (result.success) {
        toast.success(ACTION_SUCCESS_MESSAGES[modalAction])
        setSelectedSubscription(null)
        setModalAction(null)
      } else {
        toast.error(result.error || 'Error al procesar la acción')
      }
    } catch (error) {
      console.error('Error in handleAction:', error)
      toast.error('Error inesperado')
    }
  }

  const openModal = (action: typeof modalAction, subscription: UserSubscription) => {
    setSelectedSubscription(subscription)
    setModalAction(action)
  }

  if (!subscriptions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.subscriptions.noSubscriptions}</CardTitle>
          <CardDescription>
            {t.subscriptions.exploreAvailable}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{subscription.subscription_plan.name}</CardTitle>
                  <CardDescription>
                    {t.subscriptions.frequency[subscription.frequency]}
                  </CardDescription>
                </div>
                <Badge className={STATUS_COLORS[subscription.status as SubscriptionStatus]}>
                  {t.subscriptions.status[subscription.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.subscriptions.nextDelivery}:
                  </p>
                  <p className="font-medium">
                    {subscription.next_delivery_date
                      ? format(new Date(subscription.next_delivery_date), "dd 'de' MMMM 'de' yyyy", { locale: es })
                      : t.subscriptions.noDeliveryScheduled}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.subscriptions.price}:
                  </p>
                  <p className="font-medium">
                    {formatPrice(subscription.subscription_plan[`price_${subscription.frequency}`] || 0)}
                    <span className="text-sm text-muted-foreground ml-1">
                      / {t.subscriptions.frequency[subscription.frequency]}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  {subscription.status === 'active' && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => openModal('pause', subscription)}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        {t.subscriptions.actions.pause}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => openModal('change-frequency', subscription)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {t.subscriptions.actions.changeFrequency}
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => openModal('cancel', subscription)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t.subscriptions.actions.cancel}
                      </Button>
                    </>
                  )}

                  {subscription.status === 'paused' && (
                    <Button 
                      onClick={() => openModal('reactivate', subscription)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {t.subscriptions.actions.reactivate}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSubscription && modalAction && (
        <SubscriptionActionModal
          isOpen={true}
          onClose={() => {
            setSelectedSubscription(null)
            setModalAction(null)
          }}
          action={modalAction}
          subscription={selectedSubscription}
          availablePlans={availablePlans}
          onConfirm={handleAction}
        />
      )}
    </>
  )
} 