'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import type { UserSubscription, Customer } from './types'
import type { Translations } from '@/lib/i18n/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { pauseSubscription, reactivateSubscription, cancelSubscription, updateSubscriptionFrequency } from './actions/subscriptions'

interface AdminSubscriptionsTabProps {
  t: Translations
}

const formatFrequency = (frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly') => {
  const map = {
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    quarterly: 'Trimestral'
  } as const
  return map[frequency] || frequency
}

const getStatusBadge = (status: string) => {
  const variants = {
    active: <Badge>Activa</Badge>,
    paused: <Badge>Pausada</Badge>,
    cancelled: <Badge variant="destructive">Cancelada</Badge>,
    pending: <Badge variant="secondary">Pendiente</Badge>
  }
  return variants[status as keyof typeof variants] || <Badge>{status}</Badge>
}

export function AdminSubscriptionsTab({ t }: AdminSubscriptionsTabProps) {
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])

  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null)
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly'>('weekly')

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        
        console.log('🔍 Testing basic query...')
        
        // Test 1: Solo suscripciones
        const { data: subs, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .limit(5)
        
        console.log('Test 1 - Suscripciones:', subs)
        console.log('Test 1 - Error:', subError)
        
        if (subError) throw subError
        
        // Test 2: Con planes y customers
        const { data: withPlans, error: plansError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plan:subscription_plans(*),
            customer:customers!user_id(
              id,
              name,
              email
            )
          `)
          .limit(5)
        
        console.log('Test 2 - Con planes y customers:', withPlans)
        console.log('Test 2 - Error:', plansError)
        
        if (plansError) throw plansError
        
        // Usar los datos reales del customer
        setSubscriptions(withPlans?.map(sub => ({
          ...sub,
          customer: sub.customer || {
            id: sub.user_id,
            name: `Usuario ${sub.user_id?.slice(0, 8)}`,
            email: 'temp@example.com',
            addresses: []
          }
        })) || [])
        
        console.log('✅ Datos cargados con customers')
        
      } catch (error) {
        console.error('🚨 Error completo:', error)
        toast.error('Error: ' + (error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptions()
  }, [])

  const handleFrequencyChange = async () => {
    if (!selectedSubscription) return

    const result = await updateSubscriptionFrequency(selectedSubscription.id, selectedFrequency)
    
    if (result.error) {
      toast.error('Error al actualizar frecuencia: ' + result.error)
    } else {
      toast.success('Frecuencia actualizada correctamente')
      setShowFrequencyModal(false)
      // Recargar suscripciones
      window.location.reload()
    }
  }

  // Filtrado básico sin direcciones por ahora
  const filteredSubscriptions = subscriptions

  if (loading) {
    return <div className="text-center py-8">Cargando suscripciones...</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usuario</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Plan</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Frecuencia</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Próxima Entrega</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total Pagado</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((subscription) => (
              <tr key={subscription.id} className="border-b">
                <td className="p-4">
                  <div>
                    <div className="font-medium">{subscription.customer?.name}</div>
                    <div className="text-sm text-gray-500">{subscription.customer?.email}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium">{subscription.subscription_plan?.name}</div>
                    <Badge variant="outline">{subscription.subscription_plan?.type}</Badge>
                  </div>
                </td>
                <td className="p-4">{formatFrequency(subscription.frequency)}</td>
                <td className="p-4">{getStatusBadge(subscription.status)}</td>
                <td className="p-4">
                  {subscription.next_delivery_date 
                    ? new Date(subscription.next_delivery_date).toLocaleDateString('es-AR')
                    : '-'
                  }
                </td>
                <td className="p-4">{formatCurrency(subscription.total_paid || 0)}</td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedSubscription(subscription)
                          setSelectedFrequency(subscription.frequency)
                          setShowFrequencyModal(true)
                        }}
                      >
                        🔄 Cambiar Frecuencia
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {subscription.status === 'active' && (
                        <DropdownMenuItem onClick={() => pauseSubscription(subscription.id)}>
                          ⏸️ Pausar
                        </DropdownMenuItem>
                      )}
                      {subscription.status === 'paused' && (
                        <DropdownMenuItem onClick={() => reactivateSubscription(subscription.id)}>
                          ▶️ Reactivar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => cancelSubscription(subscription.id)}
                        className="text-red-600"
                      >
                        ❌ Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cambio de Frecuencia */}
      <Dialog open={showFrequencyModal} onOpenChange={setShowFrequencyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Frecuencia de Entrega</DialogTitle>
            <DialogDescription>
              Selecciona la nueva frecuencia de entrega para esta suscripción.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select
              value={selectedFrequency}
              onValueChange={(value: 'weekly' | 'biweekly' | 'monthly' | 'quarterly') => setSelectedFrequency(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="biweekly">Quincenal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFrequencyModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFrequencyChange}>
              Actualizar Frecuencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 