'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { Textarea } from './textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import type { SubscriptionActionModalProps } from '@/app/account/types'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/utils'
import { formatFrequency } from '@/utils/subscription-helpers'



export function SubscriptionActionModal({
  isOpen,
  onClose,
  action,
  subscription,
  availablePlans = [],
  onConfirm
}: SubscriptionActionModalProps) {
  const [reason, setReason] = useState('')
  const [newPlanId, setNewPlanId] = useState('')
  const [newFrequency, setNewFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>(subscription?.frequency || 'monthly')
  const [loading, setLoading] = useState(false)

  const getModalContent = () => {
    switch (action) {
      case 'change-frequency':
        return {
          title: 'Cambiar Frecuencia de Entrega',
          description: `Cambiar la frecuencia de entrega de tu suscripción "${subscription?.subscription_plan?.name}"`,
          showFrequencySelector: true,
          showReasonField: false,
          confirmText: 'Cambiar Frecuencia',
          variant: 'default' as const
        }
      case 'pause':
        return {
          title: 'Pausar Suscripción',
          description: '¿Estás seguro que deseas pausar tu suscripción? Puedes reactivarla en cualquier momento.',
          showFrequencySelector: false,
          showReasonField: true,
          confirmText: 'Pausar',
          variant: 'default' as const
        }
      case 'cancel':
        return {
          title: 'Cancelar Suscripción',
          description: '¿Estás seguro que deseas cancelar tu suscripción? Esta acción no se puede deshacer.',
          showFrequencySelector: false,
          showReasonField: true,
          confirmText: 'Cancelar',
          variant: 'destructive' as const
        }
      case 'reactivate':
        return {
          title: 'Reactivar Suscripción',
          description: '¿Deseas reactivar tu suscripción? Se reanudará con la misma frecuencia anterior.',
          showFrequencySelector: false,
          showReasonField: false,
          confirmText: 'Reactivar',
          variant: 'default' as const
        }
      case 'change-plan':
        return {
          title: 'Cambiar Plan',
          description: 'Selecciona el nuevo plan al que deseas cambiar.',
          showFrequencySelector: false,
          showReasonField: false,
          confirmText: 'Cambiar Plan',
          variant: 'default' as const
        }
      default:
        return {
          title: '',
          description: '',
          showFrequencySelector: false,
          showReasonField: false,
          confirmText: 'Confirmar',
          variant: 'default' as const
        }
    }
  }

  const content = getModalContent()

  const handleConfirm = async () => {
    setLoading(true)
    try {
      if (action === 'change-frequency') {
        await onConfirm(undefined, newFrequency)
      } else {
        await onConfirm(reason)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {content.showFrequencySelector && (
            <div className="space-y-3">
              <Label>Nueva frecuencia de entrega:</Label>
              <Select value={newFrequency} onValueChange={(value: any) => setNewFrequency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">
                    <div className="flex justify-between items-center w-full">
                      <span>Semanal</span>
                      <span className="ml-4 text-sm text-gray-500">
                        {formatPrice(subscription?.subscription_plan?.price_weekly || 0)}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="biweekly">
                    <div className="flex justify-between items-center w-full">
                      <span>Quincenal</span>
                      <span className="ml-4 text-sm text-gray-500">
                        {formatPrice(subscription?.subscription_plan?.price_biweekly || 0)}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex justify-between items-center w-full">
                      <span>Mensual</span>
                      <span className="ml-4 text-sm text-gray-500">
                        {formatPrice(subscription?.subscription_plan?.price_monthly || 0)}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* Mostrar comparación de precios */}
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><strong>Frecuencia actual:</strong> {formatFrequency(subscription?.frequency || '')} - {formatPrice(subscription?.subscription_plan?.[`price_${subscription?.frequency}`] || 0)}</p>
                <p><strong>Nueva frecuencia:</strong> {formatFrequency(newFrequency)} - {formatPrice(subscription?.subscription_plan?.[`price_${newFrequency}`] || 0)}</p>
                {newFrequency !== subscription?.frequency && (
                  <p className="text-blue-600 font-medium mt-2">
                    💡 El cambio se aplicará en tu próxima facturación
                  </p>
                )}
              </div>
            </div>
          )}

          {content.showReasonField && (
            <div className="space-y-2">
              <Label htmlFor="reason">Razón (opcional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Cuéntanos por qué..."
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || (action === 'change-frequency' && newFrequency === subscription?.frequency)}
            variant={content.variant}
          >
            {loading ? 'Procesando...' : content.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 