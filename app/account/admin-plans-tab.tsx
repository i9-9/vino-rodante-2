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
import Image from 'next/image'
import { CreateFakeSubscription } from '@/components/admin/create-fake-subscription'
import { createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, uploadPlanImage } from './actions/subscriptions'
import type { SubscriptionPlan, Customer } from './types'
import type { Translations } from '@/lib/i18n/types'
import { Switch } from '@/components/ui/switch'

interface AdminPlansTabProps {
  plans: SubscriptionPlan[]
  users: Customer[]
  t: Translations
}

const formatPrice = (priceInPesos: number | null): string => {
  if (!priceInPesos || isNaN(priceInPesos)) return '$0'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(priceInPesos)
}

export function AdminPlansTab({ plans: initialPlans, users, t }: AdminPlansTabProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    club: '',
    slug: '',
    description: '',
    tagline: '',
    image: '',
    features: [],
    price_monthly: 0,
    price_quarterly: 0,
    discount_percentage: 0,
    status: 'activo',
    display_order: 0,
    is_visible: true,
    banner_image: '',
    type: 'mixto',
    price_weekly: 0,
    price_biweekly: 0,
    wines_per_delivery: 2,
    is_active: true
  })

  const resetForm = () => {
    setFormData({
      name: '',
      club: '',
      slug: '',
      description: '',
      tagline: '',
      image: '',
      features: [],
      price_monthly: 0,
      price_quarterly: 0,
      discount_percentage: 0,
      status: 'activo',
      display_order: 0,
      is_visible: true,
      banner_image: '',
      type: 'mixto',
      price_weekly: 0,
      price_biweekly: 0,
      wines_per_delivery: 2,
      is_active: true
    })
    setEditingPlan(null)
  }

  const columns = [
    {
      id: 'image',
      header: 'Imagen',
      cell: ({ row }: { row: { original: SubscriptionPlan } }) => (
        <div className="relative w-16 h-16">
          <Image
            src={row.original.image}
            alt={row.original.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
      )
    },
    {
      id: 'name',
      header: 'Nombre',
      cell: ({ row }: { row: { original: SubscriptionPlan } }) => row.original.name
    },
    {
      id: 'club',
      header: 'Club',
      cell: ({ row }: { row: { original: SubscriptionPlan } }) => row.original.club || '-'
    },
    {
      id: 'price_weekly',
      header: 'Precio Semanal',
      cell: ({ row }: { row: { original: SubscriptionPlan } }) => row.original.wines_per_delivery === 3 ? formatPrice(row.original.price_weekly) : '-',
    },
    {
      id: 'price_biweekly',
      header: 'Precio Quincenal',
      cell: ({ row }: { row: { original: SubscriptionPlan } }) => row.original.wines_per_delivery === 3 ? formatPrice(row.original.price_biweekly) : '-',
    },
    {
      id: 'price_monthly',
      header: 'Precio Mensual',
      cell: ({ row }: { row: { original: SubscriptionPlan } }) => formatPrice(row.original.price_monthly)
    },
    {
      id: 'wines_per_delivery',
      header: 'Botellas/Entrega',
      cell: ({ row }: { row: { original: SubscriptionPlan } }) => row.original.wines_per_delivery
    },
    {
      id: 'is_active',
      header: 'Estado',
      cell: ({ row }: { row: { original: SubscriptionPlan } }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Activo' : 'Inactivo'}
      </Badge>
    )
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }: { row: { original: SubscriptionPlan } }) => (
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
    // Validar datos requeridos
    if (!formData.name || !formData.club || !formData.description) {
      throw new Error('Por favor completa todos los campos requeridos')
    }

    // Validar imagen principal
    if (!formData.image) {
      throw new Error('La imagen principal es requerida')
    }

    // Validar precios
    if (formData.price_monthly <= 0 || formData.price_quarterly <= 0) {
      throw new Error('Los precios mensuales y trimestrales deben ser mayores a 0')
    }

    // Solo enviar los campos que han sido modificados
    const changedData: Partial<SubscriptionPlan> = {}
    
    if (editingPlan) {
      // Comparar con el plan original y solo incluir campos modificados
      Object.entries(formData).forEach(([key, value]) => {
        const originalValue = editingPlan[key as keyof SubscriptionPlan]
        if (value !== originalValue) {
          changedData[key as keyof SubscriptionPlan] = value
        }
      })

      const result = await updateSubscriptionPlan(editingPlan.id, changedData)
      if (!result.success) throw new Error(result.error || 'Error al actualizar el plan')
      setPlans(plans.map(p => p.id === editingPlan.id ? result.data : p))
      toast.success('Plan actualizado')
    } else {
      const result = await createSubscriptionPlan(formData)
      if (!result.success) throw new Error(result.error || 'Error al crear el plan')
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
  setEditingPlan(plan)
  setFormData({
    name: plan.name,
    club: plan.club,
    description: plan.description || '',
    image: plan.image,
    banner_image: plan.banner_image || '',
    price_monthly: plan.price_monthly,
    price_quarterly: plan.price_quarterly,
    price_weekly: plan.price_weekly || 0,
    price_biweekly: plan.price_biweekly || 0,
    is_active: plan.is_active,
    slug: plan.slug || '',
    tagline: plan.tagline || '',
    features: plan.features || [],
    discount_percentage: plan.discount_percentage ?? 0,
    status: plan.status || '',
    display_order: plan.display_order ?? 0,
    is_visible: plan.is_visible,
    type: plan.type,
    wines_per_delivery: plan.wines_per_delivery
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

const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'banner') => {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    setLoading(true)
    const result = await uploadPlanImage(file)
    
    if (!result.success || !result.url) {
      throw new Error(result.error || 'Error al subir la imagen')
    }

    if (type === 'main') {
      setFormData(prev => ({ ...prev, image: result.url }))
    } else {
      setFormData(prev => ({ ...prev, banner_image: result.url }))
    }
  } catch (error) {
    toast.error('Error al subir la imagen')
    console.error(error)
  } finally {
    setLoading(false)
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
              <th key={column.id} className="p-2 text-left">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {plans.map(plan => (
            <tr key={plan.id}>
              {columns.map(column => (
                <td key={column.id} className="p-2">
                  {column.cell({ row: { original: plan } })}
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
              <Select
                value={formData.club}
                onValueChange={value => setFormData(prev => ({ ...prev, club: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un club" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tinto">Tinto</SelectItem>
                  <SelectItem value="blanco">Blanco</SelectItem>
                  <SelectItem value="mixto">Mixto</SelectItem>
                  <SelectItem value="naranjo">Naranjo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Imagen Principal *</Label>
              <div className="flex flex-col gap-2">
                {formData.image && (
                  <div className="relative w-full h-40">
                    <Image
                      src={formData.image}
                      alt="Imagen principal"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageChange(e, 'main')}
                  />
                  {formData.image && (
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Label>Banner (opcional)</Label>
              <div className="flex flex-col gap-2">
                {formData.banner_image && (
                  <div className="relative w-full h-40">
                    <Image
                      src={formData.banner_image}
                      alt="Banner"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageChange(e, 'banner')}
                  />
                  {formData.banner_image && (
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={() => setFormData(prev => ({ ...prev, banner_image: '' }))}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea 
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Botellas por entrega</Label>
              <Select
                value={String(formData.wines_per_delivery)}
                onValueChange={value => setFormData(prev => ({ ...prev, wines_per_delivery: Number(value) }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cantidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.wines_per_delivery === 3 && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Precio Semanal</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.price_weekly}
                  onChange={e => setFormData(prev => ({ ...prev, price_weekly: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label>Precio Quincenal</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.price_biweekly}
                  onChange={e => setFormData(prev => ({ ...prev, price_biweekly: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label>Precio Mensual</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.price_monthly}
                  onChange={e => setFormData(prev => ({ ...prev, price_monthly: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>
          )}
          {formData.wines_per_delivery === 6 && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Precio Mensual</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.price_monthly}
                  onChange={e => setFormData(prev => ({ ...prev, price_monthly: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, is_active: checked}))}
              />
              <Label htmlFor="is_active">Activo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, is_visible: checked}))}
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