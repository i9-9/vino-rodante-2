'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  Plus,
  Calendar,
  Percent,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { getDiscountStatus } from '@/lib/discount-utils'
import type { Discount } from '../types/discount'

interface DiscountsTableProps {
  discounts: Discount[]
  onEdit: (discount: Discount) => void
  onDelete: (id: string) => Promise<void>
  onToggleActive: (id: string, isActive: boolean) => Promise<void>
  onCreateNew: () => void
  isLoading?: boolean
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'expired' | 'upcoming'
type TypeFilter = 'all' | 'percentage' | 'fixed_amount'

export function DiscountsTable({ 
  discounts, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onCreateNew,
  isLoading = false 
}: DiscountsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [discountToDelete, setDiscountToDelete] = useState<string | null>(null)

  // Filtrar descuentos
  const filteredDiscounts = useMemo(() => {
    return discounts.filter(discount => {
      // Filtro de búsqueda
      const matchesSearch = discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          discount.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          discount.target_value.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de estado
      const status = getDiscountStatus(discount)
      const matchesStatus = statusFilter === 'all' || status.status === statusFilter

      // Filtro de tipo
      const matchesType = typeFilter === 'all' || discount.discount_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [discounts, searchTerm, statusFilter, typeFilter])

  const handleDeleteClick = (discountId: string) => {
    setDiscountToDelete(discountId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (discountToDelete) {
      await onDelete(discountToDelete)
      setDeleteDialogOpen(false)
      setDiscountToDelete(null)
    }
  }

  const handleToggleActive = async (discount: Discount) => {
    await onToggleActive(discount.id, !discount.is_active)
  }

  const formatDiscountValue = (discount: Discount) => {
    if (discount.discount_type === 'percentage') {
      return `${discount.discount_value}%`
    } else {
      return `$${discount.discount_value.toLocaleString('es-AR')}`
    }
  }

  const formatTargetValue = (discount: Discount) => {
    if (discount.applies_to === 'all_products') {
      return 'Todos los productos'
    } else if (discount.applies_to === 'category') {
      return discount.target_value
    } else {
      try {
        const productIds = JSON.parse(discount.target_value)
        return `${productIds.length} producto${productIds.length !== 1 ? 's' : ''}`
      } catch {
        return 'Productos específicos'
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Descuentos</h2>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Descuento
          </Button>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Descuentos</h2>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Descuento
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar descuentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
            <SelectItem value="upcoming">Próximos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TypeFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="percentage">Porcentaje</SelectItem>
            <SelectItem value="fixed_amount">Monto fijo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Aplica a</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Uso</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No se encontraron descuentos
                </TableCell>
              </TableRow>
            ) : (
              filteredDiscounts.map((discount) => {
                const status = getDiscountStatus(discount)
                return (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{discount.name}</div>
                        {discount.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
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
                        <span className="capitalize">
                          {discount.discount_type === 'percentage' ? 'Porcentaje' : 'Monto fijo'}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">
                        {formatDiscountValue(discount)}
                      </div>
                      {discount.min_purchase_amount > 0 && (
                        <div className="text-xs text-gray-500">
                          Min: ${discount.min_purchase_amount.toLocaleString('es-AR')}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {formatTargetValue(discount)}
                      </div>
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
                      <div className="text-sm">
                        {discount.usage_limit ? (
                          <div>
                            {discount.used_count} / {discount.usage_limit}
                          </div>
                        ) : (
                          <div>{discount.used_count} usos</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={discount.is_active}
                          onCheckedChange={() => handleToggleActive(discount)}
                          size="sm"
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(discount)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(discount.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar descuento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El descuento será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
