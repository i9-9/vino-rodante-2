'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Discount, DiscountFormData, APPLIES_TO_OPTIONS, DISCOUNT_TYPES, PRODUCT_CATEGORIES } from '../types/discount'
import { DAYS_OF_WEEK } from '../types/discount'

interface DiscountFormProps {
  discount?: Discount
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
  isLoading?: boolean
}

export function DiscountForm({ 
  discount, 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: DiscountFormProps) {
  const [formData, setFormData] = useState<DiscountFormData>({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase_amount: 0,
    max_discount_amount: null,
    start_date: '',
    end_date: '',
    is_active: true,
    usage_limit: null,
    applies_to: 'all_products',
    target_value: '',
    days_of_week: []
  })

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showProductSelector, setShowProductSelector] = useState(false)

  // Cargar datos del descuento si está editando
  useEffect(() => {
    if (discount) {
      setFormData({
        name: discount.name,
        description: discount.description || '',
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        min_purchase_amount: discount.min_purchase_amount,
        max_discount_amount: discount.max_discount_amount,
        start_date: discount.start_date.split('T')[0], // Solo la fecha
        end_date: discount.end_date.split('T')[0],
        is_active: discount.is_active,
        usage_limit: discount.usage_limit,
        applies_to: discount.applies_to,
        target_value: discount.target_value,
        days_of_week: discount.days_of_week || []
      })

      // Si es descuento por productos específicos, cargar los IDs
      if (discount.applies_to === 'specific_products') {
        try {
          const productIds = JSON.parse(discount.target_value)
          setSelectedProducts(Array.isArray(productIds) ? productIds : [])
        } catch {
          setSelectedProducts([])
        }
      }
    } else {
      // Resetear formulario para nuevo descuento
      setFormData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_purchase_amount: 0,
        max_discount_amount: null,
        start_date: '',
        end_date: '',
        is_active: true,
        usage_limit: null,
        applies_to: 'all_products',
        target_value: ''
      })
      setSelectedProducts([])
    }
  }, [discount, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const form = new FormData()
    form.append('name', formData.name)
    form.append('description', formData.description)
    form.append('discount_type', formData.discount_type)
    form.append('discount_value', formData.discount_value.toString())
    form.append('min_purchase_amount', formData.min_purchase_amount.toString())
    form.append('max_discount_amount', formData.max_discount_amount?.toString() || '')
    form.append('start_date', formData.start_date)
    form.append('end_date', formData.end_date)
    form.append('is_active', formData.is_active ? 'on' : '')
    form.append('usage_limit', formData.usage_limit?.toString() || '')
    form.append('applies_to', formData.applies_to)
    
    // Determinar target_value basado en applies_to
    let targetValue = ''
    if (formData.applies_to === 'all_products') {
      targetValue = 'all'
    } else if (formData.applies_to === 'category') {
      targetValue = formData.target_value
    } else if (formData.applies_to === 'specific_products') {
      targetValue = JSON.stringify(selectedProducts)
    }
    
    form.append('target_value', targetValue)
    form.append('days_of_week', JSON.stringify(formData.days_of_week))
    
    if (discount) {
      form.append('id', discount.id)
    }

    await onSubmit(form)
  }

  const handleAppliesToChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      applies_to: value as 'all_products' | 'category' | 'specific_products',
      target_value: ''
    }))
    setSelectedProducts([])
  }

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleDayToggle = (dayValue: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayValue)
        ? prev.days_of_week.filter(day => day !== dayValue)
        : [...prev.days_of_week, dayValue]
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {discount ? 'Editar Descuento' : 'Crear Nuevo Descuento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Descuento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Descuento de Verano"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional"
                />
              </div>
            </div>
          </div>

          {/* Configuración del descuento */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuración del Descuento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">Tipo de Descuento *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value as 'percentage' | 'fixed_amount' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed_amount">Monto Fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">Valor del Descuento *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                  step={formData.discount_type === 'percentage' ? 0.01 : 1}
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                  placeholder={formData.discount_type === 'percentage' ? '20' : '5000'}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_purchase_amount">Compra Mínima ($)</Label>
                <Input
                  id="min_purchase_amount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.min_purchase_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_purchase_amount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_discount_amount">Descuento Máximo ($)</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.max_discount_amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_discount_amount: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="Sin límite"
                />
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fechas de Vigencia</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Inicio *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de Fin *</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Aplicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Aplicación del Descuento</h3>
            
            <div className="space-y-2">
              <Label htmlFor="applies_to">Aplicar a *</Label>
              <Select
                value={formData.applies_to}
                onValueChange={handleAppliesToChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_products">Todos los productos</SelectItem>
                  <SelectItem value="category">Por categoría</SelectItem>
                  <SelectItem value="specific_products">Productos específicos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.applies_to === 'category' && (
              <div className="space-y-2">
                <Label htmlFor="target_value">Categoría *</Label>
                <Select
                  value={formData.target_value}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, target_value: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tinto">Tinto</SelectItem>
                    <SelectItem value="Blanco">Blanco</SelectItem>
                    <SelectItem value="Rosado">Rosado</SelectItem>
                    <SelectItem value="Espumante">Espumante</SelectItem>
                    <SelectItem value="Naranjo">Naranjo</SelectItem>
                    <SelectItem value="Dulce">Dulce</SelectItem>
                    <SelectItem value="Boxes">Boxes</SelectItem>
                    <SelectItem value="Otras Bebidas">Otras Bebidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.applies_to === 'specific_products' && (
              <div className="space-y-2">
                <Label>Productos Seleccionados</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map(productId => (
                    <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                      {productId}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleProductToggle(productId)}
                      />
                    </Badge>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProductSelector(true)}
                >
                  Seleccionar Productos
                </Button>
              </div>
            )}
          </div>

          {/* Días de la semana */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Días de Aplicación</h3>
            <div className="space-y-2">
              <Label>Seleccionar días de la semana</Label>
              <p className="text-sm text-muted-foreground">
                Si no selecciona ningún día, el descuento se aplicará todos los días
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={formData.days_of_week.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <Label htmlFor={`day-${day.value}`} className="text-sm">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuración adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuración Adicional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Límite de Uso</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.usage_limit || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="Sin límite"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Descuento Activo</Label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (discount ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
