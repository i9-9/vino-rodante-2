'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Eye, EyeOff, Tag } from 'lucide-react'
import type { Product } from './types'
import type { Translations } from '@/lib/i18n/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import Image from 'next/image'
import { updateProduct, createProduct, deleteProducts, toggleProductVisibility } from './actions/products'
import { CreateProductForm } from './components/CreateProductForm'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  getFilteredRowModel,
  getPaginationRowModel,
  type RowSelectionState,
} from '@tanstack/react-table'

import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIES, REGIONS, VARIETALS } from './types/product'
import { BoxForm } from './components/BoxForm'
import { ProductDiscountBadge } from './components/ProductDiscountBadge'

interface AdminProductsTabProps {
  products: Product[]
  t: Translations
  onEdit?: (product: Product) => void
  onRefresh?: () => Promise<void> | void
}

type VisibilityFilter = 'all' | 'visible' | 'hidden'

interface EditProductDialogProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}

function EditProductDialog({ product, isOpen, onClose, onSubmit }: EditProductDialogProps) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    // Guardar como string para no perder formato parcial (p. ej. "123.", "123,45")
    price: typeof product.price === 'number' ? String(product.price) : (product.price ?? ''),
    stock: typeof product.stock === 'number' ? String(product.stock) : (product.stock ?? ''),
    category: product.category || 'Tinto',
    region: product.region || 'Mendoza',
    year: product.year || '',
    varietal: product.varietal || '',
    featured: product.featured || false,
    is_visible: product.is_visible || false,
    free_shipping: (product as { free_shipping?: boolean }).free_shipping || false,
    is_box: (product as { is_box?: boolean }).is_box || false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(product.image || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedWines, setSelectedWines] = useState<Array<{id: string, name: string, quantity: number}>>([])
  const [availableWines, setAvailableWines] = useState<any[]>([])
  const [wineSearchTerm, setWineSearchTerm] = useState('')
  const { toast } = useToast()
  const supabase = createClient()

  // Resetear el estado cuando se abre el diálogo con un nuevo producto
  useEffect(() => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: typeof product.price === 'number' ? String(product.price) : (product.price ?? ''),
      stock: typeof product.stock === 'number' ? String(product.stock) : (product.stock ?? ''),
      category: product.category || 'Tinto',
      region: product.region || 'Mendoza',
      year: product.year || '',
      varietal: product.varietal || '',
      featured: product.featured || false,
      is_visible: product.is_visible || false,
      free_shipping: (product as { free_shipping?: boolean }).free_shipping || false,
      is_box: (product as { is_box?: boolean }).is_box || false,
    });
    setImagePreview(product.image || null)
    setSelectedFile(null)
    setIsSubmitting(false)
  }, [product])

  // Cargar vinos disponibles cuando es un box
  useEffect(() => {
    if (formData.is_box) {
      loadAvailableWines()
    }
  }, [formData.is_box])

  const loadAvailableWines = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, varietal, year, region')
        .eq('is_visible', true)
        .neq('category', 'Boxes')
        .order('name')

      if (error) throw error
      setAvailableWines(data || [])
    } catch (error) {
      console.error('Error loading wines:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const addWineToBox = (wine: any) => {
    const existingWine = selectedWines.find(w => w.id === wine.id)
    if (existingWine) {
      setSelectedWines(prev => prev.map(w => 
        w.id === wine.id ? { ...w, quantity: w.quantity + 1 } : w
      ))
    } else {
      setSelectedWines(prev => [...prev, { id: wine.id, name: wine.name, quantity: 1 }])
    }
  }

  const removeWineFromBox = (wineId: string) => {
    setSelectedWines(prev => prev.filter(w => w.id !== wineId))
  }

  const updateWineQuantity = (wineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeWineFromBox(wineId)
    } else {
      setSelectedWines(prev => prev.map(w => 
        w.id === wineId ? { ...w, quantity } : w
      ))
    }
  }

  // Filtrar vinos basado en el término de búsqueda
  const filteredWines = availableWines.filter(wine => {
    const searchLower = wineSearchTerm.toLowerCase()
    return (
      wine.name.toLowerCase().includes(searchLower) ||
      wine.varietal.toLowerCase().includes(searchLower) ||
      wine.region.toLowerCase().includes(searchLower) ||
      wine.year.toLowerCase().includes(searchLower)
    )
  })

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Tipo de archivo no permitido. Use JPG, PNG o WebP.",
          variant: "destructive"
        })
        return
      }

      // Validar tamaño (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({
          title: "Error",
          description: "La imagen es demasiado grande. Máximo 10MB.",
          variant: "destructive"
        })
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.type.split('/')[1]
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Error al subir imagen: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const submitData = new FormData()

      // Campos de texto
      submitData.set('name', formData.name)
      submitData.set('description', formData.description)
      submitData.set('category', formData.category)
      submitData.set('region', formData.region)
      submitData.set('year', String(formData.year ?? ''))
      submitData.set('varietal', String(formData.varietal ?? ''))

      // Normalizar precio (acepta "," o "." como separador decimal)
      const normalizedPrice = (formData.price ?? '').trim().replace(',', '.')
      const priceNumber = Number(normalizedPrice)
      if (!Number.isFinite(priceNumber) || priceNumber < 0) {
        throw new Error('Precio inválido')
      }
      submitData.set('price', priceNumber.toString())

      // Normalizar stock (solo dígitos)
      const stockDigits = (formData.stock ?? '').toString().replace(/[^0-9]/g, '')
      const stockNumber = stockDigits === '' ? 0 : parseInt(stockDigits, 10)
      if (!Number.isFinite(stockNumber) || stockNumber < 0) {
        throw new Error('Stock inválido')
      }
      submitData.set('stock', stockNumber.toString())

      // Booleans
      submitData.set('featured', formData.featured ? 'on' : 'off')
      submitData.set('is_visible', formData.is_visible ? 'on' : 'off')
      submitData.set('is_box', formData.is_box ? 'on' : 'off')

      // Si es edición, agregar el ID del producto
      if (product.id) {
        submitData.set('id', product.id)
      }
      
      // Si hay una imagen nueva, subirla primero
      if (selectedFile) {
        const imageUrl = await uploadImage(selectedFile)
        submitData.set('image', imageUrl)
      }

      // Si es un box, agregar los vinos seleccionados
      if (formData.is_box && selectedWines.length > 0) {
        submitData.set('box_wines', JSON.stringify(selectedWines))
      }
      
      await onSubmit(submitData)
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar el producto",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para renderizar la imagen
  const renderImage = () => {
    if (!imagePreview) return null;

    // Si es una data URL (preview de archivo nuevo)
    if (imagePreview.startsWith('data:')) {
      return (
        <div className="relative w-20 h-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt={formData.name || 'Preview'}
            className="object-cover rounded-md w-full h-full"
          />
        </div>
      );
    }

    // Detectar si es un enlace de Google Drive
    const isGoogleDriveLink = imagePreview.includes('drive.google.com');
    if (isGoogleDriveLink) {
      return (
        <div className="relative w-20 h-20 flex items-center justify-center bg-gray-100 rounded-md">
          <div className="text-xs text-center p-1">
            Google Drive<br/>Link
          </div>
        </div>
      );
    }

    // Si es una URL normal
    try {
      new URL(imagePreview);
      return (
        <div className="relative w-20 h-20">
          <Image
            src={imagePreview}
            alt={formData.name || 'Preview'}
            fill
            className="object-cover rounded-md"
          />
        </div>
      );
    } catch {
      return null;
    }
  };

  // Si es un box, mostrar el formulario específico de boxes
  if (product.category === 'Boxes') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Box</DialogTitle>
          </DialogHeader>
          <BoxForm
            onSubmit={onSubmit}
            onClose={onClose}
            initialData={product}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.id ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select 
                name="category"
                value={formData.category}
                onValueChange={handleSelectChange('category')}
                disabled={formData.is_box}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Región</Label>
              <Select 
                name="region"
                value={formData.region}
                onValueChange={handleSelectChange('region')}
                disabled={formData.is_box}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar región" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((reg) => (
                    <SelectItem key={reg} value={reg}>
                      {reg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Solo mostrar campos año y varietal si NO es un box */}
          {!formData.is_box && formData.category !== 'Boxes' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleInputChange}
                  required={formData.category !== 'Boxes'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="varietal">Varietal *</Label>
                <Select
                  value={formData.varietal}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, varietal: value }))}
                  required={formData.category !== 'Boxes'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un varietal" />
                  </SelectTrigger>
                  <SelectContent>
                    {VARIETALS.map((varietal) => (
                      <SelectItem key={varietal} value={varietal}>
                        {varietal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Selector de vinos para boxes */}
          {formData.is_box && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Vinos del Box</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Selecciona los vinos individuales que incluirá este box.
                </p>
                
                {/* Lista de vinos disponibles */}
                <div className="space-y-2">
                  <Label>Vinos Disponibles</Label>
                  
                  {/* Campo de búsqueda */}
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar por nombre, varietal, región o año..."
                      value={wineSearchTerm}
                      onChange={(e) => setWineSearchTerm(e.target.value)}
                      className="pr-8"
                    />
                    {wineSearchTerm && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setWineSearchTerm('')}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {filteredWines.length > 0 ? (
                      filteredWines.map((wine) => (
                        <div key={wine.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <span className="font-medium">{wine.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {capitalizeWords(wine.varietal)} - {wine.year} - {capitalizeWords(wine.region)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addWineToBox(wine)}
                          >
                            Agregar
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {wineSearchTerm ? 
                          `No se encontraron vinos que coincidan con "${wineSearchTerm}"` :
                          'No hay vinos disponibles'
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Vinos seleccionados */}
                {selectedWines.length > 0 && (
                  <div className="mt-4">
                    <Label>Vinos Seleccionados</Label>
                    <div className="space-y-2">
                      {selectedWines.map((wine) => (
                        <div key={wine.id} className="flex items-center justify-between p-2 bg-white border rounded">
                          <span className="font-medium">{wine.name}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateWineQuantity(wine.id, wine.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{wine.quantity}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateWineQuantity(wine.id, wine.quantity + 1)}
                            >
                              +
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeWineFromBox(wine.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image_file">Imagen</Label>
            <div className="flex items-center gap-4">
              {renderImage()}
              <Input
                id="image_file"
                name="image_file"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
            </div>
          </div>

          {/* Toggles en grilla */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                name="featured"
                checked={formData.featured}
                onCheckedChange={handleSwitchChange('featured')}
              />
              <Label htmlFor="featured">Destacado</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_visible"
                name="is_visible"
                checked={formData.is_visible}
                onCheckedChange={handleSwitchChange('is_visible')}
              />
              <Label htmlFor="is_visible">Visible</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="free_shipping"
                name="free_shipping"
                checked={!!(formData as any).free_shipping}
                onCheckedChange={handleSwitchChange('free_shipping')}
              />
              <Label htmlFor="free_shipping">Envío gratis</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_box"
                name="is_box"
                checked={formData.is_box}
                onCheckedChange={handleSwitchChange('is_box')}
              />
              <Label htmlFor="is_box">Es un Box</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function AdminProductsTab({ products, t, onRefresh }: AdminProductsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const { toast } = useToast()

  const filteredProducts = useMemo(() => 
    products.filter(product => {
      switch (visibilityFilter) {
        case 'visible':
          return product.is_visible
        case 'hidden':
          return !product.is_visible
        default:
          return true
      }
    }),
    [products, visibilityFilter]
  )

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'image',
      header: 'Imagen',
      cell: ({ row }) => {
        // Check if it's a Google Drive link
        const isGoogleDriveLink = row.original.image && 
          typeof row.original.image === 'string' && 
          row.original.image.includes('drive.google.com');
        
        // Use placeholder for Google Drive links or invalid URLs
        const imgSrc = row.original.image && 
          row.original.image.startsWith('http') && 
          !isGoogleDriveLink ? 
          row.original.image : 
          '/placeholder.svg';
          
        return (
        <div className="relative w-[80px] h-[80px]">
          <Image
              src={imgSrc}
            alt={row.original.name}
            fill
            className="object-contain bg-gray-50 rounded-md"
            sizes="80px"
          />
            {isGoogleDriveLink && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 text-xs text-center p-1">
                Google Drive<br/>Link
              </div>
            )}
        </div>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Nombre
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-gray-500 line-clamp-1">{row.original.description}</div>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Categoría
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Precio
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-2">
          <div className="font-medium">
            ${row.original.price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <ProductDiscountBadge product={row.original} />
        </div>
      )
    },
    {
      accessorKey: 'stock',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Stock
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    {
      id: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Estado
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      accessorKey: 'is_visible',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge 
              variant={row.original.is_visible ? "default" : "secondary"}
              className={row.original.is_visible 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-gray-100 text-gray-600 border-gray-200"
              }
            >
              {row.original.is_visible ? 'Visible' : 'Oculto'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleToggleVisibility(row.original.id, !row.original.is_visible)
              }}
              className="h-6 px-2 text-xs"
            >
              {row.original.is_visible ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
          {row.original.featured && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Destacado
            </Badge>
          )}
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.is_visible ? 1 : 0
        const b = rowB.original.is_visible ? 1 : 0
        return a - b
      }
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedProduct(row.original)
              setImagePreview(row.original.image || null)
              setIsModalOpen(true)
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Abrir modal de gestión de descuentos
              console.log('Gestionar descuentos para:', row.original.name)
            }}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Tag className="h-4 w-4 mr-2" />
            Descuentos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDeleteDialog(row.original)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      ),
      enableSorting: false
    }
  ], [])

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 20, // Mostrar 20 productos por página
      },
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditProduct = async (formData: FormData) => {
    try {
      // Check if the image is a Google Drive link
      const imageUrl = formData.get('image') as string;
      if (imageUrl && imageUrl.includes('drive.google.com')) {
        // If using toast, show a warning
        toast({
          title: "Advertencia sobre imagen",
          description: "Los enlaces de Google Drive no se mostrarán correctamente. Por favor, sube la imagen directamente o usa una URL de imagen pública.",
          variant: "destructive",
        });
      }
      
      if (selectedImage) {
        formData.append('image_file', selectedImage)
      }
      
      let result;
      // Determinar si es crear o editar
      if (selectedProduct?.id) {
        formData.append('id', selectedProduct.id)
        result = await updateProduct(formData)
      } else {
        result = await createProduct(formData)
      }
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: selectedProduct?.id ? "Producto actualizado correctamente" : "Producto creado correctamente",
        })
        
        // Solicitar refresh de datos al padre si está disponible
        if (onRefresh) {
          await onRefresh()
        }
        setIsModalOpen(false)
        setSelectedProduct(null)
        setSelectedImage(null)
        setImagePreview(null)
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar el producto",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete?.id) return

    setIsDeleting(true)
    try {
      await deleteProducts([productToDelete.id])
      
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      })
      
      // Solicitar refresh de datos al padre si está disponible
      if (onRefresh) {
        await onRefresh()
      }
      
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map(row => row.original.id)

    if (selectedIds.length === 0) {
      toast({
        title: "Error",
        description: "No hay productos seleccionados para eliminar",
        variant: "destructive",
      })
      return
    }

    setIsBulkDeleting(true)
    try {
      await deleteProducts(selectedIds)
      
      toast({
        title: "Éxito",
        description: `${selectedIds.length} producto(s) eliminado(s) correctamente`,
      })
      
      // Solicitar refresh de datos al padre si está disponible
      if (onRefresh) {
        await onRefresh()
      }
      
      setBulkDeleteDialogOpen(false)
      setRowSelection({})
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar los productos",
        variant: "destructive",
      })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const openBulkDeleteDialog = () => {
    const selectedCount = table.getFilteredSelectedRowModel().rows.length
    if (selectedCount === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un producto para eliminar",
        variant: "destructive",
      })
      return
    }
    setBulkDeleteDialogOpen(true)
  }

  const handleToggleVisibility = async (productId: string, visible: boolean) => {
    try {
      const result = await toggleProductVisibility(productId, visible)
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message,
        })
        
        // Solicitar refresh de datos al padre si está disponible
        if (onRefresh) {
          await onRefresh()
        }
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar visibilidad del producto",
        variant: "destructive",
      })
    }
  }

  const handleBulkToggleVisibility = async (visible: boolean) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map(row => row.original.id)

    if (selectedIds.length === 0) {
      toast({
        title: "Error",
        description: "No hay productos seleccionados",
        variant: "destructive",
      })
      return
    }

    try {
      // Cambiar visibilidad de todos los productos seleccionados
      const promises = selectedIds.map(id => toggleProductVisibility(id, visible))
      const results = await Promise.all(promises)
      
      const successCount = results.filter(r => r.success).length
      const errorCount = results.length - successCount
      
      if (successCount > 0) {
        toast({
          title: "Éxito",
          description: `${successCount} producto(s) ${visible ? 'mostrado(s)' : 'oculto(s)'} correctamente`,
        })
      }
      
      if (errorCount > 0) {
        toast({
          title: "Advertencia",
          description: `${errorCount} producto(s) no pudieron ser actualizado(s)`,
          variant: "destructive",
        })
      }
      
      // Solicitar refresh de datos al padre si está disponible
      if (onRefresh) {
        await onRefresh()
      }
      
      // Limpiar selección
      setRowSelection({})
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar visibilidad de los productos",
        variant: "destructive",
      })
    }
  }

  // Opciones para los selects
  const categoryOptions = CATEGORIES.map(category => ({
    value: category,
    label: category
  }))

  const regionOptions = REGIONS.map(region => ({
    value: region,
    label: region
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">PRODUCTOS</h2>
          <Select value={visibilityFilter} onValueChange={(value: VisibilityFilter) => setVisibilityFilter(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por visibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center justify-between w-full">
                  <span>Todos</span>
                  <span className="ml-2 text-xs text-gray-500">({products.length})</span>
                </div>
              </SelectItem>
              <SelectItem value="visible">
                <div className="flex items-center justify-between w-full">
                  <span>Visibles</span>
                  <span className="ml-2 text-xs text-green-600">({products.filter(p => p.is_visible).length})</span>
                </div>
              </SelectItem>
              <SelectItem value="hidden">
                <div className="flex items-center justify-between w-full">
                  <span>Ocultos</span>
                  <span className="ml-2 text-xs text-gray-600">({products.filter(p => !p.is_visible).length})</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500">
            {filteredProducts.length} productos mostrados
          </div>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="text-sm text-blue-600 font-medium">
              {table.getFilteredSelectedRowModel().rows.length} seleccionado(s)
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              <Button 
                onClick={() => handleBulkToggleVisibility(true)}
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                <Eye className="h-4 w-4 mr-2" />
                Mostrar seleccionados ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
              <Button 
                onClick={() => handleBulkToggleVisibility(false)}
                variant="outline"
                className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Ocultar seleccionados ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
              <Button 
                onClick={openBulkDeleteDialog}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar seleccionados ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
            </>
          )}
          <Button 
            onClick={() => {
              setSelectedProduct(null)
              setImagePreview(null)
              setIsModalOpen(true)
            }}
            className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar producto
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay productos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            de {table.getFilteredRowModel().rows.length} productos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {selectedProduct ? (
        <EditProductDialog
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProduct(null)
            setSelectedImage(null)
            setImagePreview(null)
          }}
          onSubmit={handleEditProduct}
        />
      ) : (
        <Dialog open={isModalOpen} onOpenChange={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
          setSelectedImage(null)
          setImagePreview(null)
        }}>
          <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Producto</DialogTitle>
            </DialogHeader>
            <CreateProductForm
              onSubmit={handleEditProduct}
              onClose={() => {
                setIsModalOpen(false)
                setSelectedProduct(null)
                setSelectedImage(null)
                setImagePreview(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el producto{' '}
              <strong>"{productToDelete?.name}"</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para eliminación en lote */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar productos seleccionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente{' '}
              <strong>{table.getFilteredSelectedRowModel().rows.length} producto(s)</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar todos'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 