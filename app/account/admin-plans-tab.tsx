'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CreateFakeSubscription } from '@/components/admin/create-fake-subscription'
import { createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from './actions/subscriptions'
import type { SubscriptionPlan, Customer } from './types'
import type { Translations } from '@/lib/i18n/types'

interface AdminPlansTabProps {
  plans: SubscriptionPlan[]
  users: Customer[]
  t: Translations
}

const formatPrice = (priceInCents: number): string => {
  if (!priceInCents || isNaN(priceInCents)) return '$0'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(priceInCents)
}

const WINE_TYPES = {
  tinto: 'Tinto',
  blanco: 'Blanco',
  mixto: 'Mixto',
  naranjo: 'Naranjo',
  premium: 'Premium'
} as const

export function AdminPlansTab({ plans: initialPlans, users, t }: AdminPlansTabProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    club: '',
    slug: '',
    description: '',
    tagline: '',
    type: 'mixto' as keyof typeof WINE_TYPES,
    price_weekly: 0,
    price_biweekly: 0,
    price_monthly: 0,
    price_quarterly: 0,
    wines_per_delivery: 1,
    features: [''],
    is_active: true,
    is_visible: true,
    display_order: 0
  })

  const resetForm = () => {
    setFormData({
      name: '',
      club: '',
      slug: '',
      description: '',
      tagline: '',
      type: 'mixto',
      price_weekly: 0,
      price_biweekly: 0,
      price_monthly: 0,
      price_quarterly: 0,
      wines_per_delivery: 1,
      features: [''],
      is_active: true,
      is_visible: true,
      display_order: 0
    })
    setEditingPlan(null)
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => {
        const type = row.original.type as keyof typeof WINE_TYPES
        return <Badge variant="outline">{WINE_TYPES[type] || type}</Badge>
      }
    },
    {
      accessorKey: 'price_weekly',
      header: 'Precio Semanal',
      cell: ({ row }) => formatPrice(row.original.price_weekly)
    },
    {
      accessorKey: 'price_monthly',
      header: 'Precio Mensual',
      cell: ({ row }) => formatPrice(row.original.price_monthly)
    },
    {
      accessorKey: 'wines_per_delivery',
      header: 'Vinos/Entrega',
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
            Eliminar
          </Button>
        </div>
      )
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        features: Array.isArray(formData.features) ? formData.features : [formData.features]
      }

      if (editingPlan) {
        const result = await updateSubscriptionPlan(editingPlan.id, dataToSend)
        if (!result.success) throw new Error(result.error)
        setPlans(plans.map(p => p.id === editingPlan.id ? result.data : p))
        toast.success('Plan actualizado')
      } else {
        const result = await createSubscriptionPlan(dataToSend)
        if (!result.success) throw new Error(result.error)
        setPlans([...plans, result.data])
        toast.success('Plan creado')
      }
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar el plan')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (plan: SubscriptionPlan) => {
    console.log('Editando plan:', plan)
    setEditingPlan(plan)
    setFormData({
      name: plan.name || '',
      club: plan.club || '',
      slug: plan.slug || '',
      description: plan.description || '',
      tagline: plan.tagline || '',
      type: (plan.type as keyof typeof WINE_TYPES) || 'mixto',
      price_weekly: plan.price_weekly || 0,
      price_biweekly: plan.price_biweekly || 0,
      price_monthly: plan.price_monthly || 0,
      price_quarterly: plan.price_quarterly || 0,
      wines_per_delivery: plan.wines_per_delivery || 1,
      features: Array.isArray(plan.features) ? plan.features : [''],
      is_active: plan.is_active ?? true,
      is_visible: plan.is_visible ?? true,
      display_order: plan.display_order || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('¿Eliminar este plan? Esta acción no se puede deshacer.')) return

    try {
      const result = await deleteSubscriptionPlan(planId)
      if (!result.success) throw new Error(result.error)
      setPlans(plans.filter(p => p.id !== planId))
      toast.success('Plan eliminado')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el plan')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Clubes/Planes</h2>
        <div className="flex gap-2">
          <CreateFakeSubscription plans={plans} users={users} />
          <Button onClick={() => {
            resetForm()
            setShowModal(true)
          }}>
            Nuevo Plan
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.accessorKey || column.id} className="p-2 text-left">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan.id}>
                {columns.map(column => (
                  <td key={column.accessorKey || column.id} className="p-2">
                    {column.cell ? column.cell({ row: { original: plan } }) : plan[column.accessorKey]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label>Club</Label>
                <Input 
                  value={formData.club}
                  onChange={(e) => setFormData(prev => ({...prev, club: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input 
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label>Tipo de Vino</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: keyof typeof WINE_TYPES) => setFormData(prev => ({...prev, type: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WINE_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                required
              />
            </div>

            <div>
              <Label>Tagline</Label>
              <Input 
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({...prev, tagline: e.target.value}))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio Semanal (en centavos)</Label>
                <Input 
                  type="number"
                  value={formData.price_weekly}
                  onChange={(e) => setFormData(prev => ({...prev, price_weekly: parseInt(e.target.value) || 0}))}
                  required
                />
              </div>
              <div>
                <Label>Precio Quincenal (en centavos)</Label>
                <Input 
                  type="number"
                  value={formData.price_biweekly}
                  onChange={(e) => setFormData(prev => ({...prev, price_biweekly: parseInt(e.target.value) || 0}))}
                  required
                />
              </div>
              <div>
                <Label>Precio Mensual (en centavos)</Label>
                <Input 
                  type="number"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData(prev => ({...prev, price_monthly: parseInt(e.target.value) || 0}))}
                  required
                />
              </div>
              <div>
                <Label>Precio Trimestral (en centavos)</Label>
                <Input 
                  type="number"
                  value={formData.price_quarterly}
                  onChange={(e) => setFormData(prev => ({...prev, price_quarterly: parseInt(e.target.value) || 0}))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vinos por Entrega</Label>
                <Input 
                  type="number"
                  value={formData.wines_per_delivery}
                  onChange={(e) => setFormData(prev => ({...prev, wines_per_delivery: parseInt(e.target.value) || 1}))}
                  required
                  min="1"
                />
              </div>
              <div>
                <Label>Orden de Visualización</Label>
                <Input 
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({...prev, display_order: parseInt(e.target.value) || 0}))}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))}
                  id="is_active"
                />
                <Label htmlFor="is_active">Activo</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData(prev => ({...prev, is_visible: e.target.checked}))}
                  id="is_visible"
                />
                <Label htmlFor="is_visible">Visible</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : editingPlan ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 