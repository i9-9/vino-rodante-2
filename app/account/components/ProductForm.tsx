'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProductSchema, ProductFormData, ImageSchema } from '../types/product'
import { useImageCompression } from '../hooks/useImageCompression'
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
import { CATEGORIES, REGIONS } from '../types/product'
import Image from 'next/image'
import { useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProductFormProps {
  product?: ProductFormData
  onSubmit: (data: ProductFormData, imageFile?: File) => Promise<void>
  isSubmitting?: boolean
}

export function ProductForm({ product, onSubmit, isSubmitting = false }: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image || null)
  const { compressImage, isCompressing } = useImageCompression()
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<{data: ProductFormData, imageFile?: File} | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: product || {
      featured: false,
      is_visible: true,
    }
  })

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const compressedFile = await compressImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      toast.error('Error al procesar la imagen')
    }
  }

  const onFormSubmit = async (data: ProductFormData) => {
    const imageFile = (document.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0]
    
    // Si hay cambios importantes, pedir confirmación
    if (
      (product && (
        data.price !== product.price ||
        data.stock !== product.stock ||
        data.is_visible !== product.is_visible
      )) ||
      isDirty
    ) {
      setNeedsConfirmation(true)
      setPendingData({ data, imageFile })
      return
    }

    try {
      await onSubmit(data, imageFile)
      toast.success('Producto guardado exitosamente')
    } catch (error) {
      toast.error('Error al guardar el producto')
    }
  }

  const handleConfirmedSubmit = async () => {
    if (!pendingData) return
    
    try {
      await onSubmit(pendingData.data, pendingData.imageFile)
      setNeedsConfirmation(false)
      setPendingData(null)
      toast.success('Producto guardado exitosamente')
    } catch (error) {
      toast.error('Error al guardar el producto')
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          {...register('name')}
          className={cn(errors.name && 'border-red-500')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register('description')}
          className={cn(errors.description && 'border-red-500')}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className={cn(errors.price && 'border-red-500')}
            aria-invalid={!!errors.price}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            {...register('stock', { valueAsNumber: true })}
            className={cn(errors.stock && 'border-red-500')}
            aria-invalid={!!errors.stock}
          />
          {errors.stock && (
            <p className="text-sm text-red-500">{errors.stock.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger className={cn(errors.category && 'border-red-500')}>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Región</Label>
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger className={cn(errors.region && 'border-red-500')}>
                  <SelectValue placeholder="Seleccionar región" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.region && (
            <p className="text-sm text-red-500">{errors.region.message}</p>
          )}
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
        <Controller
          name="featured"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="featured">Destacado</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Controller
          name="is_visible"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="is_visible">Visible</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={isSubmitting || isCompressing}
        >
          {(isSubmitting || isCompressing) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {product ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>

      <AlertDialog open={needsConfirmation} onOpenChange={setNeedsConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Has realizado cambios importantes en el producto. ¿Estás seguro de que deseas guardar estos cambios?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setNeedsConfirmation(false)
              setPendingData(null)
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
} 