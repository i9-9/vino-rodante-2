'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIES, REGIONS, VARIETALS } from '../types/product'
import { BoxForm } from './BoxForm'

interface CreateProductFormProps {
  onSubmit: (formData: FormData) => Promise<void>
  onClose: () => void
}

export function CreateProductForm({ onSubmit, onClose }: CreateProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Tinto',
    region: 'Mendoza',
    year: '',
    varietal: '',
    featured: false,
    is_visible: true,
    free_shipping: false,
    is_box: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedWines, setSelectedWines] = useState<Array<{id: string, name: string, quantity: number}>>([])
  const [availableWines, setAvailableWines] = useState<any[]>([])
  const [wineSearchTerm, setWineSearchTerm] = useState('')
  const { toast } = useToast()
  const supabase = createClient()

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
      submitData.set('free_shipping', formData.free_shipping ? 'on' : 'off')
      submitData.set('is_box', formData.is_box ? 'on' : 'off')
      
      // Si hay una imagen, agregarla
      if (selectedFile) {
        submitData.set('image_file', selectedFile)
      }

      // Si es un box, agregar los vinos seleccionados
      if (formData.is_box && selectedWines.length > 0) {
        submitData.set('box_wines', JSON.stringify(selectedWines))
      }
      
      await onSubmit(submitData)
      // Toast de éxito manejado por el componente padre
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el producto",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
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

  // Si la categoría es Boxes, mostrar el formulario específico de boxes
  if (formData.category === 'Boxes') {
    return (
      <BoxForm
        onSubmit={onSubmit}
        onClose={onClose}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción *</Label>
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
          <Label htmlFor="price">Precio *</Label>
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
          <Label htmlFor="stock">Stock *</Label>
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
          <Label htmlFor="category">Categoría *</Label>
          <Select 
            value={formData.category} 
            onValueChange={handleSelectChange('category')}
            disabled={formData.is_box}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Región *</Label>
          <Select 
            value={formData.region} 
            onValueChange={handleSelectChange('region')}
            disabled={formData.is_box}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
            value={formData.year}
            onChange={handleInputChange}
            placeholder="2020"
            disabled={formData.is_box}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="varietal">Varietal</Label>
          <Select
            value={formData.varietal}
            onValueChange={(value) => setFormData(prev => ({ ...prev, varietal: value }))}
            disabled={formData.is_box}
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

      <div className="space-y-2">
        <Label htmlFor="image_file">Imagen</Label>
        <div className="flex items-center gap-4">
          {imagePreview && (
            <div className="relative w-20 h-20">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover rounded-md"
              />
            </div>
          )}
          <Input
            id="image_file"
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
            checked={formData.featured}
            onCheckedChange={handleSwitchChange('featured')}
          />
          <Label htmlFor="featured">Destacado</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_visible}
            onCheckedChange={handleSwitchChange('is_visible')}
          />
          <Label htmlFor="is_visible">Visible</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.free_shipping}
            onCheckedChange={handleSwitchChange('free_shipping')}
          />
          <Label htmlFor="free_shipping">Envío gratis</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_box}
            onCheckedChange={handleSwitchChange('is_box')}
          />
          <Label htmlFor="is_box">Es un Box</Label>
        </div>
      </div>

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
                          {wine.varietal} - {wine.year} - {wine.region}
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
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Crear Producto
        </Button>
      </div>
    </form>
  )
}
