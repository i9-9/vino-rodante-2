'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Percent, 
  DollarSign, 
  Calendar, 
  Tag,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { getDiscountStatus, formatDiscountedPrice } from '@/lib/discount-utils'
import { createDiscount, updateDiscount, deleteDiscount, toggleDiscountActive } from '../actions/discounts'
import { DiscountForm } from './DiscountForm'
import type { Discount, ProductWithDiscount } from '../types/discount'

interface ProductDiscountManagerProps {
  product: ProductWithDiscount
  onRefresh: () => Promise<void>
}

export function ProductDiscountManager({ product, onRefresh }: ProductDiscountManagerProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar descuentos aplicables al producto
  useEffect(() => {
    loadDiscounts()
  }, [product.id])

  const loadDiscounts = async () => {
    setIsLoading(true)
    try {
      // Aquí deberías cargar los descuentos que aplican a este producto
      // Por ahora simulamos con una lista vacía
      setDiscounts([])
    } catch (error) {
      console.error('Error al cargar descuentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDiscount = async (formData: FormData) => {
    try {
      const result = await createDiscount(formData)
      if (result.success) {
        setIsFormOpen(false)
        await onRefresh()
        await loadDiscounts()
      }
    } catch (error) {
      console.error('Error al crear descuento:', error)
    }
  }

  const handleUpdateDiscount = async (formData: FormData) => {
    try {
      const result = await updateDiscount(formData)
      if (result.success) {
        setIsFormOpen(false)
        setEditingDiscount(null)
        await onRefresh()
        await loadDiscounts()
      }
    } catch (error) {
      console.error('Error al actualizar descuento:', error)
    }
  }

  const handleDeleteDiscount = async (discountId: string) => {
    try {
      const result = await deleteDiscount(discountId)
      if (result.success) {
        await onRefresh()
        await loadDiscounts()
      }
    } catch (error) {
      console.error('Error al eliminar descuento:', error)
    }
  }

  const handleToggleActive = async (discountId: string, isActive: boolean) => {
    try {
      const result = await toggleDiscountActive(discountId, isActive)
      if (result.success) {
        await onRefresh()
        await loadDiscounts()
      }
    } catch (error) {
      console.error('Error al cambiar estado del descuento:', error)
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

  const filteredDiscounts = discounts.filter(discount =>
    discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Descuentos para {product.name}</h3>
          <p className="text-sm text-gray-600">
            Gestiona los descuentos aplicables a este producto
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Descuento
        </Button>
      </div>

      {/* Descuento actual del producto */}
      {product.discount && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-800">Descuento Activo</h4>
              <p className="text-sm text-green-600">{product.discount.name}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  {product.discount.discount_type === 'percentage' ? (
                    <Percent className="h-4 w-4" />
                  ) : (
                    <DollarSign className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {product.discount.discount_type === 'percentage' 
                      ? `${product.discount.discount_value}%`
                      : `$${product.discount.discount_value.toLocaleString('es-AR')}`
                    }
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Precio original:</span>
                  <span className="line-through ml-1">${product.price.toLocaleString('es-AR')}</span>
                </div>
                <div className="text-sm font-medium text-green-700">
                  <span className="text-gray-500">Precio final:</span>
                  <span className="ml-1">${product.discount.final_price.toLocaleString('es-AR')}</span>
                </div>
                <div className="text-sm text-green-600">
                  <span className="text-gray-500">Ahorro:</span>
                  <span className="ml-1">${product.discount.savings.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Activo
            </Badge>
          </div>
        </div>
      )}

      {/* Lista de descuentos */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar descuentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay descuentos configurados para este producto</p>
            <p className="text-sm">Crea uno nuevo para comenzar</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscounts.map((discount) => {
                  const status = getDiscountStatus(discount)
                  return (
                    <TableRow key={discount.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{discount.name}</div>
                          {discount.description && (
                            <div className="text-sm text-gray-500">
                              {discount.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {discount.discount_type === 'percentage' ? (
                            <Percent className="h-4 w-4" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                          <span className="capitalize text-sm">
                            {discount.discount_type === 'percentage' ? 'Porcentaje' : 'Monto fijo'}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">
                          {discount.discount_type === 'percentage' 
                            ? `${discount.discount_value}%`
                            : `$${discount.discount_value.toLocaleString('es-AR')}`
                          }
                        </div>
                        {discount.min_purchase_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            Min: ${discount.min_purchase_amount.toLocaleString('es-AR')}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(discount.start_date), 'dd/MM/yyyy', { locale: es })}
                          </div>
                          <div className="text-gray-500">
                            hasta {format(new Date(discount.end_date), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={status.status === 'active' ? 'default' : 'secondary'}
                          className={cn('text-xs', status.color)}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={discount.is_active}
                            onCheckedChange={() => handleToggleActive(discount.id, !discount.is_active)}
                            size="sm"
                          />
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDiscount(discount)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDiscount(discount.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Formulario de descuento */}
      <DiscountForm
        discount={editingDiscount}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingDiscount(null)
        }}
        onSubmit={editingDiscount ? handleUpdateDiscount : handleCreateDiscount}
        isLoading={isLoading}
      />
    </div>
  )
}
