'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} from './actions/subscriptions'
import type { SubscriptionPlan, WineType, UserSubscription } from './types'
import type { Translations } from '@/lib/i18n/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Pause, Play, X, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import { SubscriptionActionModal } from '@/components/ui/subscription-action-modal'
import {
  pauseSubscription,
  reactivateSubscription,
  cancelSubscription,
  changeSubscriptionPlan
} from './actions/subscriptions'

const subscriptionPlanSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  tagline: z.string().optional(),
  type: z.enum(['tinto', 'blanco', 'mixto', 'premium'] as const),
  image: z.string().nullable(),
  banner_image: z.string().nullable(),
  features: z.array(z.string()),
  price_weekly: z.number().int().min(0),
  price_biweekly: z.number().int().min(0),
  price_monthly: z.number().int().min(0),
  discount_percentage: z.number().min(0).max(100).optional(),
  wines_per_delivery: z.number().int().min(1),
  display_order: z.number().int().min(0),
  is_visible: z.boolean().default(true),
  is_active: z.boolean().default(true)
})

type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>

interface SubscriptionPlanFormProps {
  plan?: SubscriptionPlan
  onSubmit: (data: SubscriptionPlanFormData) => Promise<void>
  onCancel: () => void
  t: Translations
}

function SubscriptionPlanForm({ plan, onSubmit, onCancel, t }: SubscriptionPlanFormProps) {
  const form = useForm<SubscriptionPlanFormData>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: plan || {
      name: '',
      slug: '',
      description: '',
      tagline: '',
      type: 'tinto',
      image: null,
      banner_image: null,
      features: [],
      price_weekly: 0,
      price_biweekly: 0,
      price_monthly: 0,
      discount_percentage: 0,
      wines_per_delivery: 1,
      display_order: 0,
      is_visible: true,
      is_active: true
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [features, setFeatures] = useState<string[]>(plan?.features || [])
  const [newFeature, setNewFeature] = useState('')

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature('')
      form.setValue('features', [...features, newFeature.trim()])
    }
  }

  const handleRemoveFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index)
    setFeatures(newFeatures)
    form.setValue('features', newFeatures)
  }

  const handleSubmit = async (data: SubscriptionPlanFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      onCancel()
    } catch (error) {
      console.error('Error al guardar plan:', error)
      toast.error(t.errors.saveError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.admin.planName}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.admin.planSlug}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.admin.planDescription}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.admin.planType}</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full p-2 border rounded"
                >
                  <option value="tinto">{t.admin.wineTypes.tinto}</option>
                  <option value="blanco">{t.admin.wineTypes.blanco}</option>
                  <option value="mixto">{t.admin.wineTypes.mixto}</option>
                  <option value="premium">{t.admin.wineTypes.premium}</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price_weekly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.admin.priceWeekly}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price_biweekly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.admin.priceBiweekly}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price_monthly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.admin.priceMonthly}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="wines_per_delivery"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.admin.winesPerDelivery}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>{t.admin.features}</FormLabel>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span>{feature}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFeature(index)}
                >
                  ×
                </Button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Input
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                placeholder={t.admin.newFeature}
              />
              <Button
                type="button"
                onClick={handleAddFeature}
              >
                {t.admin.addFeature}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <FormField
            control={form.control}
            name="is_visible"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">{t.admin.isVisible}</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">{t.admin.isActive}</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t.common.cancel}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {plan ? t.common.save : t.common.create}
          </Button>
        </div>
      </form>
    </Form>
  )
}

interface AdminSubscriptionsTabProps {
  subscriptions: UserSubscription[]
  availablePlans: SubscriptionPlan[]
  t: Translations
}

const ACTION_SUCCESS_MESSAGES = {
  pause: 'Suscripción pausada exitosamente',
  cancel: 'Suscripción cancelada exitosamente',
  reactivate: 'Suscripción reactivada exitosamente',
  'change-plan': 'Plan actualizado exitosamente'
} as const

export function AdminSubscriptionsTab({ subscriptions, availablePlans, t }: AdminSubscriptionsTabProps) {
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null)
  const [modalAction, setModalAction] = useState<'pause' | 'cancel' | 'reactivate' | 'change-plan' | null>(null)

  const handleAction = async (reason?: string, newPlan?: string) => {
    if (!selectedSubscription || !modalAction) return

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
      }

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success(ACTION_SUCCESS_MESSAGES[modalAction])
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : t.errors.unknownError)
    }
  }

  const openModal = (action: typeof modalAction, subscription: UserSubscription) => {
    setSelectedSubscription(subscription)
    setModalAction(action)
  }

  return (
    <>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left font-medium">Usuario</th>
              <th className="p-4 text-left font-medium">Plan</th>
              <th className="p-4 text-left font-medium">Estado</th>
              <th className="p-4 text-left font-medium">Frecuencia</th>
              <th className="p-4 text-left font-medium">Próxima entrega</th>
              <th className="p-4 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="border-b">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{subscription.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{subscription.customer.email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="font-medium">{subscription.subscription_plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(subscription.subscription_plan.price_monthly)} / mes
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {t.subscriptions.status[subscription.status]}
                  </div>
                </td>
                <td className="p-4">
                  {t.subscriptions.frequency[subscription.frequency]}
                </td>
                <td className="p-4">
                  {subscription.next_delivery_date
                    ? format(new Date(subscription.next_delivery_date), "dd 'de' MMMM", { locale: es })
                    : '-'}
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {subscription.status === 'active' && (
                        <>
                          <DropdownMenuItem onClick={() => openModal('pause', subscription)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar suscripción
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openModal('change-plan', subscription)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Cambiar plan
                          </DropdownMenuItem>
                        </>
                      )}
                      {subscription.status === 'paused' && (
                        <DropdownMenuItem onClick={() => openModal('reactivate', subscription)}>
                          <Play className="h-4 w-4 mr-2" />
                          Reactivar suscripción
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => openModal('cancel', subscription)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar suscripción
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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