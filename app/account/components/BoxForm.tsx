'use client'

import { useState, useEffect } from 'react'
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
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Box, BoxProduct, CreateBox, UpdateBox } from '../types/box'
import { Product } from '../types'
import { REGIONS } from '../types/product'

interface BoxFormProps {
  box?: Box
  onSubmit: (formData: FormData) => Promise<void>
  onClose: () => void
}

export function BoxForm({ box, onSubmit, onClose }: BoxFormProps) {
  const [formData, setFormData] = useState<Partial<CreateBox>>({
    name: box?.name || '',
    description: box?.description || '',
    price: box?.price || '',
    stock: box?.stock || '',
    category: 'Boxes',
    featured: box?.featured || false,
    is_visible: box?.is_visible || true,
    total_wines: box?.total_wines || 3,
    discount_percentage: box?.discount_percentage || 0,
  })
  
  const [boxProducts, setBoxProducts] = useState<BoxProduct[]>(box?.box_products || [])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(box?.image || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Cargar productos disponibles
  useEffect(() => {
    loadAvailableProducts()
  }, [])

  const loadAvailableProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_visible', true)
        .neq('category', 'Boxes')
        .order('name')

      if (error) throw error
      setAvailableProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos disponibles",
        variant: "destructive"
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'total_wines' || name === 'discount_percentage' 
        ? Number(value) || 0 
        : value
    }))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_wines' ? Number(value) : value
    }))
  }

  const addProductToBox = () => {
    if (boxProducts.length >= (formData.total_wines || 3)) {
      toast({
        title: "Límite alcanzado",
        description: `Este box solo puede contener ${formData.total_wines} vinos`,
        variant: "destructive"
      })
      return
    }

    const newProduct: BoxProduct = {
      product_id: '',
      quantity: 1,
      name: '',
      price: 0,
      image: '',
      varietal: '',
      year: '',
      region: ''
    }
    setBoxProducts([...boxProducts, newProduct])
  }

  const removeProductFromBox = (index: number) => {
    setBoxProducts(boxProducts.filter((_, i) => i !== index))
  }

  const updateBoxProduct = (index: number, field: keyof BoxProduct, value: any) => {
    const updated = [...boxProducts]
    updated[index] = { ...updated[index], [field]: value }
    setBoxProducts(updated)
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = availableProducts.find(p => p.id === productId)
    if (product) {
      updateBoxProduct(index, 'product_id', productId)
      updateBoxProduct(index, 'name', product.name)
      updateBoxProduct(index, 'price', product.price)
      updateBoxProduct(index, 'image', product.image)
      updateBoxProduct(index, 'varietal', product.varietal)
      updateBoxProduct(index, 'year', product.year)
      updateBoxProduct(index, 'region', product.region)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Tipo de archivo no permitido. Use JPG, PNG o WebP.",
          variant: "destructive"
        })
        return
      }

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (boxProducts.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un vino al box",
        variant: "destructive"
      })
      return
    }

    if (boxProducts.length !== (formData.total_wines || 3)) {
      toast({
        title: "Error",
        description: `El box debe contener exactamente ${formData.total_wines} vinos`,
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const submitData = new FormData()

      // Datos básicos del box
      submitData.set('name', formData.name || '')
      submitData.set('description', formData.description || '')
      submitData.set('category', 'Boxes')
      submitData.set('price', String(formData.price || 0))
      submitData.set('stock', String(formData.stock || 0))
      submitData.set('total_wines', String(formData.total_wines || 3))
      submitData.set('discount_percentage', String(formData.discount_percentage || 0))
      submitData.set('featured', formData.featured ? 'on' : 'off')
      submitData.set('is_visible', formData.is_visible ? 'on' : 'off')
      
      // Productos del box
      submitData.set('box_products', JSON.stringify(boxProducts))
      
      // Imagen si existe
      if (selectedFile) {
        submitData.set('image_file', selectedFile)
      }
      
      await onSubmit(submitData)
      toast({
        title: "Éxito",
        description: box ? "Box actualizado correctamente" : "Box creado correctamente",
      })
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el box",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Primera fila: Nombre y Descripción */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Box *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Ej: Box Malbec Premium"
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
            placeholder="Describe el box y los vinos incluidos"
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Segunda fila: Precio, Stock, Cantidad de Vinos, Descuento */}
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio del Box *</Label>
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

        <div className="space-y-2">
          <Label htmlFor="total_wines">Cantidad de Vinos *</Label>
          <Select value={String(formData.total_wines)} onValueChange={handleSelectChange('total_wines')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 vinos</SelectItem>
              <SelectItem value="3">3 vinos</SelectItem>
              <SelectItem value="4">4 vinos</SelectItem>
              <SelectItem value="6">6 vinos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_percentage">Descuento (%)</Label>
          <Input
            id="discount_percentage"
            name="discount_percentage"
            type="number"
            min="0"
            max="100"
            value={formData.discount_percentage}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>
      </div>

      {/* Sección de Vinos del Box */}
      <div className="space-y-3">
        <Label>Vinos del Box *</Label>
        <div className="grid grid-cols-2 gap-4">
          {boxProducts.map((product, index) => (
            <div key={index} className="p-3 border rounded-lg space-y-3">
              <div className="space-y-2">
                <Select 
                  value={product.product_id} 
                  onValueChange={(value) => handleProductSelect(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vino" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - {p.varietal} ({p.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {product.name && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div><strong>Varietal:</strong> {product.varietal}</div>
                    <div><strong>Año:</strong> {product.year}</div>
                    <div><strong>Región:</strong> {product.region}</div>
                    <div><strong>Precio:</strong> ${product.price}</div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`quantity-${index}`} className="text-xs">Cantidad:</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) => updateBoxProduct(index, 'quantity', Number(e.target.value))}
                    className="w-16 h-8"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeProductFromBox(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {boxProducts.length < (formData.total_wines || 3) && (
          <Button
            type="button"
            variant="outline"
            onClick={addProductToBox}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Vino al Box
          </Button>
        )}
      </div>

      {/* Imagen y Configuraciones */}
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="image_file">Imagen del Box</Label>
          <div className="flex items-center gap-3">
            {imagePreview && (
              <div className="relative w-16 h-16">
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

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.featured}
            onCheckedChange={handleSwitchChange('featured')}
          />
          <Label htmlFor="featured">Destacado</Label>
        </div>

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.is_visible}
            onCheckedChange={handleSwitchChange('is_visible')}
          />
          <Label htmlFor="is_visible">Visible</Label>
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
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {box ? 'Actualizar Box' : 'Crear Box'}
        </Button>
      </div>
    </form>
  )
}
