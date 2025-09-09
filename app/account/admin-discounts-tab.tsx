'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Translations } from '@/lib/i18n/types'
import { DiscountsTable } from './components/DiscountsTable'
import { DiscountForm } from './components/DiscountForm'
import { 
  createDiscount, 
  updateDiscount, 
  deleteDiscount, 
  toggleDiscountActive,
  getAllDiscounts 
} from './actions/discounts'
import { useToast } from '@/hooks/use-toast'
import type { Discount } from './types/discount'

interface AdminDiscountsTabProps {
  t: Translations
}

export function AdminDiscountsTab({ t }: AdminDiscountsTabProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Cargar descuentos
  useEffect(() => {
    loadDiscounts()
  }, [])

  const loadDiscounts = async () => {
    try {
      setIsLoading(true)
      const result = await getAllDiscounts()
      if (result.success) {
        setDiscounts(result.data || [])
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al cargar descuentos",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al cargar descuentos:', error)
      toast({
        title: "Error",
        description: "Error inesperado al cargar descuentos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDiscount = async (formData: FormData) => {
    try {
      setIsSubmitting(true)
      const result = await createDiscount(formData)
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message || "Descuento creado correctamente"
        })
        setIsFormOpen(false)
        await loadDiscounts()
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al crear descuento",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al crear descuento:', error)
      toast({
        title: "Error",
        description: "Error inesperado al crear descuento",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateDiscount = async (formData: FormData) => {
    try {
      setIsSubmitting(true)
      const result = await updateDiscount(formData)
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message || "Descuento actualizado correctamente"
        })
        setIsFormOpen(false)
        setEditingDiscount(null)
        await loadDiscounts()
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar descuento",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al actualizar descuento:', error)
      toast({
        title: "Error",
        description: "Error inesperado al actualizar descuento",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDiscount = async (discountId: string) => {
    try {
      const result = await deleteDiscount(discountId)
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message || "Descuento eliminado correctamente"
        })
        await loadDiscounts()
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al eliminar descuento",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al eliminar descuento:', error)
      toast({
        title: "Error",
        description: "Error inesperado al eliminar descuento",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (discountId: string, isActive: boolean) => {
    try {
      const result = await toggleDiscountActive(discountId, isActive)
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message || "Estado del descuento actualizado"
        })
        await loadDiscounts()
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al cambiar estado del descuento",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al cambiar estado del descuento:', error)
      toast({
        title: "Error",
        description: "Error inesperado al cambiar estado del descuento",
        variant: "destructive"
      })
    }
  }

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount)
    setIsFormOpen(true)
  }

  const handleCreateNew = () => {
    setEditingDiscount(null)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingDiscount(null)
  }

  return (
    <div className="space-y-6">
      <DiscountsTable
        discounts={discounts}
        onEdit={handleEditDiscount}
        onDelete={handleDeleteDiscount}
        onToggleActive={handleToggleActive}
        onCreateNew={handleCreateNew}
        isLoading={isLoading}
      />

      <DiscountForm
        discount={editingDiscount}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingDiscount ? handleUpdateDiscount : handleCreateDiscount}
        isLoading={isSubmitting}
      />
    </div>
  )
}
