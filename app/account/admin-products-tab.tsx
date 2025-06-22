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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
      <div className="flex justify-between items-center mb-6">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative w-[80px] h-[80px]">
                    <Image
                      src={product.image && product.image.startsWith('http') ? product.image : '/placeholder.svg'}
                      alt={product.name}
                      fill
                      className="object-contain bg-gray-50 rounded-md"
                      sizes="80px"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={product.is_visible ? "default" : "secondary"}>
                      {product.is_visible ? 'Visible' : 'Oculto'}
                    </Badge>
                    {product.featured && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Destacado
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product)
                      setIsModalOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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