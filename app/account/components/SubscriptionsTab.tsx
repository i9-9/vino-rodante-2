'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { updateSubscriptionStatus } from '../actions/subscriptions'
import type { UserSubscription, SubscriptionPlan } from '../types'
import type { Translations } from '@/lib/i18n/types'

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

export function SubscriptionsTab({ subscriptions, availablePlans, t }: SubscriptionsTabProps) {
  const handleStatusChange = async (id: string, status: 'paused' | 'cancelled') => {
    const result = await updateSubscriptionStatus(id, status)
    if (result.error) {
      throw new Error(result.error)
    }
  }

  const handleSubscribe = async (planId: string, frequency: 'weekly' | 'biweekly' | 'monthly') => {
    const result = await createSubscription(planId, frequency)
    if (result.error) {
      throw new Error(result.error)
    }
  }

  return (
    <div className="space-y-8">
      {subscriptions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">{t.account.activeSubscriptions}</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {subscriptions.map(subscription => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onStatusChange={handleStatusChange}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-4">{t.account.availablePlans}</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availablePlans
            .filter(plan => plan.is_active && plan.is_visible)
            .map(plan => (
              <AvailablePlanCard
                key={plan.id}
                plan={plan}
                onSubscribe={handleSubscribe}
                t={t}
              />
            ))}
        </div>
      </div>
    </div>
  )
} 