'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil } from 'lucide-react'
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

interface AdminProductsTabProps {
  products: Product[]
  t: Translations
  onEdit?: (product: Product) => void
}

export default function AdminProductsTab({ products, t }: AdminProductsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleEditProduct = async (formData: FormData) => {
    try {
      await updateProduct(formData)
      setIsModalOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">PRODUCTOS</h2>
        <Button 
          onClick={() => {
            setSelectedProduct(null)
            setIsModalOpen(true)
          }}
          className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar producto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={product.image && product.image.startsWith('http') ? product.image : '/placeholder.svg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSelectedProduct(product)
                    setIsModalOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                <p>Precio: ${product.price.toFixed(2)}</p>
                <p>Stock: {product.stock}</p>
                <p>Categoría: {product.category}</p>
                <p>Año: {product.year}</p>
                <p>Región: {product.region}</p>
                <p>Varietal: {product.varietal}</p>
                <div className="flex items-center gap-2">
                  <span>Visible:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.is_visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_visible ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Destacado:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.featured ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.featured ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Editar producto' : 'Agregar producto'}
            </DialogTitle>
          </DialogHeader>
          <form action={handleEditProduct} className="space-y-4">
            {selectedProduct && (
              <input type="hidden" name="id" value={selectedProduct.id} />
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={selectedProduct?.name} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedProduct?.price} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input 
                  id="category" 
                  name="category" 
                  defaultValue={selectedProduct?.category || ''} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input 
                  id="stock" 
                  name="stock" 
                  type="number"
                  defaultValue={selectedProduct?.stock} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input 
                  id="year" 
                  name="year" 
                  defaultValue={selectedProduct?.year || ''} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Región</Label>
                <Input 
                  id="region" 
                  name="region" 
                  defaultValue={selectedProduct?.region || ''} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="varietal">Varietal</Label>
                <Input 
                  id="varietal" 
                  name="varietal" 
                  defaultValue={selectedProduct?.varietal || ''} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">URL de la imagen</Label>
                <Input 
                  id="image" 
                  name="image" 
                  defaultValue={selectedProduct?.image || ''} 
                  required 
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={selectedProduct?.description || ''} 
                  required 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_visible" 
                  name="is_visible"
                  defaultChecked={selectedProduct?.is_visible} 
                />
                <Label htmlFor="is_visible">Visible</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="featured" 
                  name="featured"
                  defaultChecked={selectedProduct?.featured} 
                />
                <Label htmlFor="featured">Destacado</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
              >
                {selectedProduct ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 