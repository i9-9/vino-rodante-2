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
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIES, REGIONS } from '../types/product'
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
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

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
      
      // Si hay una imagen, agregarla
      if (selectedFile) {
        submitData.set('image_file', selectedFile)
      }
      
      await onSubmit(submitData)
      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
      })
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
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
          <Select value={formData.category} onValueChange={handleSelectChange('category')}>
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
          <Select value={formData.region} onValueChange={handleSelectChange('region')}>
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="varietal">Varietal</Label>
          <Input
            id="varietal"
            name="varietal"
            value={formData.varietal}
            onChange={handleInputChange}
            placeholder="Malbec"
          />
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
