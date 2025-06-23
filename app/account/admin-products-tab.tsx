'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, ArrowUpDown, ArrowUp, ArrowDown, Upload } from 'lucide-react'
import type { Product } from './types'
import type { Translations } from '@/lib/i18n/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Image from 'next/image'
import { updateProduct } from './actions/products'
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
} from '@tanstack/react-table'
import { WINE_TYPES, WINE_REGIONS } from '@/lib/wine-data'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface AdminProductsTabProps {
  products: Product[]
  t: Translations
  onEdit?: (product: Product) => void
}

type VisibilityFilter = 'all' | 'visible' | 'hidden'

const REGIONS = [
  'Mendoza',
  'San Juan',
  'La Rioja',
  'Salta',
  'Catamarca',
  'Neuquén',
  'Río Negro',
  'Córdoba',
  'Buenos Aires'
] as const

const CATEGORIES = [
  'Tinto',
  'Blanco',
  'Rosado',
  'Espumante',
  'Dulce',
  'Otro'
] as const

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
    price: product.price || 0,
    stock: product.stock || 0,
    category: product.category || 'none',
    region: product.region || 'none',
    year: product.year || '',
    varietal: product.varietal || '',
    featured: product.featured || false,
    is_visible: product.is_visible || false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(product.image || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Resetear el estado cuando se abre el diálogo con un nuevo producto
  useEffect(() => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category || 'none',
      region: product.region || 'none',
      year: product.year || '',
      varietal: product.varietal || '',
      featured: product.featured || false,
      is_visible: product.is_visible || false,
    });
    setImagePreview(product.image || null)
    setSelectedFile(null)
    setIsSubmitting(false)
  }, [product])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

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

      // Validar tamaño (max 2MB)
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        toast({
          title: "Error",
          description: "La imagen es demasiado grande. Máximo 2MB.",
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
      
      // Agregar todos los campos del formulario
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          submitData.set(key, value ? 'on' : 'off')
        } else {
          submitData.set(key, String(value))
        }
      })

      // Agregar el ID del producto
      submitData.set('id', product.id)
      
      // Si hay una imagen nueva, subirla primero
      if (selectedFile) {
        const imageUrl = await uploadImage(selectedFile)
        submitData.set('image', imageUrl)
      } else if (product.image) {
        // Mantener la imagen existente si no se seleccionó una nueva
        submitData.set('image', product.image)
      }
      
      await onSubmit(submitData)
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      })
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el producto",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seleccionar categoría</SelectItem>
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seleccionar región</SelectItem>
                  {REGIONS.map((reg) => (
                    <SelectItem key={reg} value={reg}>
                      {reg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="varietal">Varietal</Label>
              <Input
                id="varietal"
                name="varietal"
                value={formData.varietal}
                onChange={handleInputChange}
              />
            </div>
          </div>

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

export default function AdminProductsTab({ products, t }: AdminProductsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
      id: 'image',
      header: 'Imagen',
      cell: ({ row }) => (
        <div className="relative w-[80px] h-[80px]">
          <Image
            src={row.original.image && row.original.image.startsWith('http') ? row.original.image : '/placeholder.svg'}
            alt={row.original.name}
            fill
            className="object-contain bg-gray-50 rounded-md"
            sizes="80px"
          />
        </div>
      ),
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
      cell: ({ row }) => `$${row.original.price.toFixed(2)}`
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
      header: 'Estado',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <Badge variant={row.original.is_visible ? "default" : "secondary"}>
            {row.original.is_visible ? 'Visible' : 'Oculto'}
          </Badge>
          {row.original.featured && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Destacado
            </Badge>
          )}
        </div>
      ),
      enableSorting: false
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
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
      ),
      enableSorting: false
    }
  ], [])

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
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
      if (selectedImage) {
        formData.append('image_file', selectedImage)
      }
      await updateProduct(formData)
      setIsModalOpen(false)
      setSelectedProduct(null)
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  // Convertir los tipos de vino del enum a opciones para el select
  const categoryOptions = Object.entries(WINE_TYPES).map(([key, value]) => ({
    value: t.wineTypes[value as keyof typeof t.wineTypes].toLowerCase(),
    label: t.wineTypes[value as keyof typeof t.wineTypes]
  }))

  // Convertir las regiones del enum a opciones para el select
  const regionOptions = Object.entries(WINE_REGIONS).map(([key, value]) => ({
    value: value,
    label: t.wineRegions[value as keyof typeof t.wineRegions] || value
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">PRODUCTOS</h2>
          <Select value={visibilityFilter} onValueChange={(value: VisibilityFilter) => setVisibilityFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por visibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="visible">Visibles</SelectItem>
              <SelectItem value="hidden">Ocultos</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500">
            {filteredProducts.length} productos
          </div>
        </div>
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

      <EditProductDialog
        product={selectedProduct || ({} as Product)}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
          setSelectedImage(null)
          setImagePreview(null)
        }}
        onSubmit={handleEditProduct}
      />
    </div>
  )
} 