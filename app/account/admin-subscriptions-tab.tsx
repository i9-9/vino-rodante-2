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
import type { SubscriptionPlan, WineType } from './types'
import type { Translations } from '@/lib/i18n/types'

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
  plans: SubscriptionPlan[]
  t: Translations
}

export default function AdminSubscriptionsTab({ plans, t }: AdminSubscriptionsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)

  const handleCreatePlan = async (data: SubscriptionPlanFormData) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'features') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    })

    const result = await createSubscriptionPlan(formData)
    if (result.error) {
      throw new Error(result.error)
    }
    toast.success(t.admin.planCreated)
  }

  const handleUpdatePlan = async (data: SubscriptionPlanFormData) => {
    if (!editingPlan) return

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'features') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    })

    const result = await updateSubscriptionPlan(editingPlan.id, formData)
    if (result.error) {
      throw new Error(result.error)
    }
    toast.success(t.admin.planUpdated)
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm(t.admin.confirmDelete)) return

    const result = await deleteSubscriptionPlan(planId)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(t.admin.planDeleted)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price / 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t.admin.subscriptionPlans}</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          {t.admin.createPlan}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => (
          <Card key={plan.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                {plan.is_active ? t.admin.active : t.admin.inactive}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{t.admin.pricing}</p>
                <div className="mt-1 space-y-1">
                  <p className="text-sm">{t.admin.weekly}: {formatPrice(plan.price_weekly)}</p>
                  <p className="text-sm">{t.admin.biweekly}: {formatPrice(plan.price_biweekly)}</p>
                  <p className="text-sm">{t.admin.monthly}: {formatPrice(plan.price_monthly)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">{t.admin.details}</p>
                <div className="mt-1 space-y-1">
                  <p className="text-sm">{t.admin.type}: {t.admin.wineTypes[plan.type as WineType]}</p>
                  <p className="text-sm">{t.admin.winesPerDelivery}: {plan.wines_per_delivery}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPlan(plan)}
                >
                  {t.common.edit}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  {t.common.delete}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={isCreateModalOpen || !!editingPlan}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false)
            setEditingPlan(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? t.admin.editPlan : t.admin.createPlan}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? t.admin.editPlanDesc : t.admin.createPlanDesc}
            </DialogDescription>
          </DialogHeader>

          <SubscriptionPlanForm
            plan={editingPlan || undefined}
            onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
            onCancel={() => {
              setIsCreateModalOpen(false)
              setEditingPlan(null)
            }}
            t={t}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 