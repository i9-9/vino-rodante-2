import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { format } from 'date-fns'
import type { Translations } from '@/lib/i18n/types'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_bimonthly: number
  price_quarterly: number
  club: string
  features: Record<string, any>
  image: string | null
  is_active: boolean
}

interface UserSubscription {
  id: string
  customer_id: string
  plan_id: string
  start_date: string
  end_date: string | null
  current_period_end: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  is_gift: boolean
  created_at: string
  updated_at: string
  subscription_plan: SubscriptionPlan | null
}

interface SubscriptionsTabProps {
  subscriptions: UserSubscription[]
  t: Translations & {
    account: {
      subscriptions: string
      noSubscriptions: string
    }
    subscriptions: {
      active: string
      paused: string
      cancelled: string
      expired: string
    }
  }
}

export function SubscriptionsTab({ subscriptions, t }: SubscriptionsTabProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.account.subscriptions}</h2>
      </div>

      <div className="grid gap-4">
        {subscriptions.length === 0 ? (
          <p className="text-muted-foreground">{t.account.noSubscriptions}</p>
        ) : (
          subscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{subscription.subscription_plan?.name}</CardTitle>
                    <CardDescription>
                      {formatDate(subscription.created_at)}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    subscription.status === 'active' ? 'default' :
                    subscription.status === 'paused' ? 'secondary' :
                    subscription.status === 'cancelled' ? 'destructive' :
                    'outline'
                  }>
                    {t.subscriptions[subscription.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Detalles del Plan */}
                  {subscription.subscription_plan && (
                    <div className="space-y-4">
                      {subscription.subscription_plan.image && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                          <Image
                            src={subscription.subscription_plan.image}
                            alt={subscription.subscription_plan.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {subscription.subscription_plan.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {subscription.subscription_plan.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">Club</p>
                          <p className="text-muted-foreground">
                            {subscription.subscription_plan.club}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Precios</p>
                          <ul className="text-sm text-muted-foreground">
                            <li>Mensual: {formatCurrency(subscription.subscription_plan.price_monthly)}</li>
                            <li>Bimestral: {formatCurrency(subscription.subscription_plan.price_bimonthly)}</li>
                            <li>Trimestral: {formatCurrency(subscription.subscription_plan.price_quarterly)}</li>
                          </ul>
                        </div>
                      </div>
                      {subscription.subscription_plan.features && (
                        <div>
                          <p className="font-medium mb-2">Características</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {Object.entries(subscription.subscription_plan.features).map(([key, value]) => (
                              <li key={key}>{value as string}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detalles de la Suscripción */}
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Fecha de inicio</p>
                        <p className="text-muted-foreground">
                          {formatDate(subscription.start_date)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Próxima renovación</p>
                        <p className="text-muted-foreground">
                          {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    </div>
                    {subscription.is_gift && (
                      <div className="mt-2">
                        <Badge variant="secondary">Regalo</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 