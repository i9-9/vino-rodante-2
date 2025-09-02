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
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { BoxProduct, CreateBoxSchema } from '../types/box'

interface BoxFormProps {
  onSubmit: (formData: FormData) => Promise<void>
  onClose: () => void
  initialData?: any // Datos del box existente para editar (simplificado)
}

interface BoxProductItem {
  product_id: string
  quantity: number
  name: string
  price: number
  image?: string
  varietal?: string
  year?: string
  region?: string
}

export function BoxForm({ onSubmit, onClose }: BoxFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    total_wines: 3,
    discount_percentage: 0,
    featured: false,
    is_visible: true,
    free_shipping: false,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [boxProducts, setBoxProducts] = useState<BoxProductItem[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [showProductSelector, setShowProductSelector] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Cargar productos disponibles
  useEffect(() => {
    loadAvailableProducts()
  }, [])

  const loadAvailableProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, varietal, year, region')
        .neq('category', 'Boxes')
        .eq('is_visible', true)
        .order('name')

      if (error) throw error
      setAvailableProducts(data || [])
    } catch (error) {
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
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

  const addProductToBox = (product: any) => {
    const existingProduct = boxProducts.find(p => p.product_id === product.id)
    if (existingProduct) {
      setBoxProducts(prev => prev.map(p => 
        p.product_id === product.id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ))
    } else {
      setBoxProducts(prev => [...prev, {
        product_id: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
        image: product.image,
        varietal: product.varietal,
        year: product.year,
        region: product.region
      }])
    }
    setShowProductSelector(false)
  }

  const removeProductFromBox = (productId: string) => {
    setBoxProducts(prev => prev.filter(p => p.product_id !== productId))
  }

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromBox(productId)
      return
    }
    setBoxProducts(prev => prev.map(p => 
      p.product_id === productId ? { ...p, quantity } : p
    ))
  }

  const calculateTotalPrice = () => {
    return boxProducts.reduce((total, product) => {
      return total + (product.price * product.quantity)
    }, 0)
  }

  const calculateDiscountedPrice = () => {
    const totalPrice = calculateTotalPrice()
    const discount = (totalPrice * formData.discount_percentage) / 100
    return totalPrice - discount
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (boxProducts.length === 0) {
        throw new Error('Debe agregar al menos un producto al box')
      }

      if (boxProducts.length !== formData.total_wines) {
        throw new Error(`El box debe contener exactamente ${formData.total_wines} vinos`)
      }

      const submitData = new FormData()

      // Campos básicos
      submitData.set('name', formData.name)
      submitData.set('description', formData.description)
      submitData.set('price', calculateDiscountedPrice().toString())
      submitData.set('stock', formData.stock)
      submitData.set('total_wines', formData.total_wines.toString())
      submitData.set('discount_percentage', formData.discount_percentage.toString())
      submitData.set('featured', formData.featured ? 'on' : 'off')
      submitData.set('is_visible', formData.is_visible ? 'on' : 'off')
      submitData.set('free_shipping', formData.free_shipping ? 'on' : 'off')
      
      // Productos del box
      submitData.set('box_products', JSON.stringify(boxProducts))
      
      // Imagen
      if (selectedFile) {
        submitData.set('image_file', selectedFile)
      }
      
      await onSubmit(submitData)
      toast({
        title: "Éxito",
        description: "Box creado correctamente",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el box",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold">Crear Box de Vinos</h3>
        <p className="text-sm text-muted-foreground">
          Agrupa múltiples vinos en un solo paquete con descuento
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Información básica del box */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Box *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej: Box Malbec Premium"
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
            placeholder="Describe el contenido del box..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_wines">Cantidad de Vinos *</Label>
            <Select 
              value={formData.total_wines.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, total_wines: parseInt(value) }))}
            >
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_file">Imagen del Box</Label>
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
        </div>

        {/* Productos del box */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Productos del Box ({boxProducts.length}/{formData.total_wines})</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowProductSelector(true)}
              disabled={boxProducts.length >= formData.total_wines}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Vino
            </Button>
          </div>

          {boxProducts.length > 0 && (
            <div className="space-y-2">
              {boxProducts.map((product) => (
                <div key={product.product_id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {product.image && (
                    <div className="relative w-12 h-12">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.varietal} • {product.year} • {product.region}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => updateProductQuantity(product.product_id, parseInt(e.target.value) || 1)}
                      className="w-16"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProductFromBox(product.product_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resumen de precios */}
          {boxProducts.length > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Precio total de productos:</span>
                <span>${calculateTotalPrice().toFixed(2)}</span>
              </div>
              {formData.discount_percentage > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({formData.discount_percentage}%):</span>
                  <span>-${((calculateTotalPrice() * formData.discount_percentage) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Precio final del box:</span>
                <span>${calculateDiscountedPrice().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Switches */}
        <div className="space-y-4">
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
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-4">
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
            disabled={isSubmitting || boxProducts.length === 0}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Crear Box
          </Button>
        </div>
      </form>

      {/* Modal selector de productos */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Seleccionar Vinos</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductSelector(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {availableProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => addProductToBox(product)}
                >
                  {product.image && (
                    <div className="relative w-12 h-12">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.varietal} • {product.year} • {product.region}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

