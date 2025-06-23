'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createAddress, deleteAddress, setDefaultAddress, updateAddress } from '../actions/addresses'
import type { Address } from '../types'
import type { Translations } from '@/lib/i18n/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface AddressesTabProps {
  addresses: Address[]
  userId: string
  t: Translations
}

export function AddressesTab({ addresses, userId, t }: AddressesTabProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Efecto para forzar la actualización de la página cuando cambia el estado
  useEffect(() => {
    router.refresh()
  }, [addresses, router])

  const handleAddAddress = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await createAddress(formData)
        if (result.error) {
          setError(result.error)
          toast.error(result.error)
        } else {
          setIsAddModalOpen(false)
          toast.success('Dirección agregada correctamente')
          router.refresh()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        setError(message)
        toast.error(message)
      }
    })
  }

  const handleEditAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedAddress) return

    setError(null)
    const formData = new FormData(event.currentTarget)
    
    // Asegurar que el ID esté en el FormData
    formData.set('id', selectedAddress.id)
    
    // Manejar explícitamente el checkbox is_default
    const isDefault = event.currentTarget.querySelector<HTMLInputElement>('input[name="is_default"]')?.checked
    formData.set('is_default', isDefault ? 'true' : 'false')

    startTransition(async () => {
      try {
        const result = await updateAddress(formData)
        
        if (result.error) {
          setError(result.error)
          toast.error(result.error)
        } else {
          setIsEditModalOpen(false)
          setSelectedAddress(null)
          toast.success('Dirección actualizada correctamente')
          router.refresh()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        setError(message)
        toast.error(message)
      }
    })
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) return

    setError(null)
    const formData = new FormData()
    formData.append('id', addressId)
    
    startTransition(async () => {
      try {
        const result = await deleteAddress(formData)
        if (result.error) {
          setError(result.error)
          toast.error(result.error)
        } else {
          toast.success('Dirección eliminada correctamente')
          router.refresh()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        setError(message)
        toast.error(message)
      }
    })
  }

  const handleSetDefaultAddress = async (address: Address) => {
    if (address.is_default) return
    
    setError(null)
    const formData = new FormData()
    formData.append('id', address.id)
    
    startTransition(async () => {
      try {
        const result = await setDefaultAddress(formData)
        if (result.error) {
          setError(result.error)
          toast.error(result.error)
        } else {
          toast.success('Dirección predeterminada actualizada')
          router.refresh()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        setError(message)
        toast.error(message)
      }
    })
  }

  const handleOpenEditModal = (address: Address) => {
    setSelectedAddress({...address}) // Crear una copia del objeto
    setError(null)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedAddress(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Direcciones</h2>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar dirección
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start justify-between rounded-lg border p-4"
          >
            <div className="flex items-start space-x-4">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">
                  {address.line1}
                  {address.line2 && `, ${address.line2}`}
                </div>
                <div className="text-sm text-gray-500">
                  {address.city}, {address.state} {address.postal_code}
                </div>
                {address.is_default && (
                  <div className="mt-1 flex items-center text-sm text-green-600">
                    <Check className="mr-1 h-4 w-4" />
                    Dirección predeterminada
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleOpenEditModal(address)}
                disabled={isPending}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {!address.is_default && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSetDefaultAddress(address)}
                  disabled={isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isPending || address.is_default}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Agregar dirección</DialogTitle>
          </DialogHeader>
          <form action={handleAddAddress} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="line1" className="text-sm font-medium">
                Calle y número *
              </Label>
              <Input 
                id="line1" 
                name="line1" 
                placeholder="Ej: Av. Santa Fe 1234"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line2" className="text-sm font-medium">
                Piso y departamento (opcional)
              </Label>
              <Input 
                id="line2" 
                name="line2" 
                placeholder="Ej: Piso 3, Depto B"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                Ciudad *
              </Label>
              <Input 
                id="city" 
                name="city" 
                placeholder="Ej: Buenos Aires"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">
                Provincia *
              </Label>
              <Input 
                id="state" 
                name="state" 
                placeholder="Ej: Buenos Aires"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code" className="text-sm font-medium">
                Código postal *
              </Label>
              <Input 
                id="postal_code" 
                name="postal_code" 
                placeholder="Ej: 1425"
                required 
              />
            </div>
            <input type="hidden" name="country" value="Argentina" />
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="is_default" name="is_default" />
              <Label htmlFor="is_default" className="text-sm">
                Establecer como dirección predeterminada
              </Label>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
                disabled={isPending}
              >
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Address Modal */}
      <Dialog 
        open={isEditModalOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseEditModal()
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Editar dirección</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAddress} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-line1" className="text-sm font-medium">
                Calle y número *
              </Label>
              <Input 
                id="edit-line1" 
                name="line1" 
                defaultValue={selectedAddress?.line1}
                placeholder="Ej: Av. Santa Fe 1234"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-line2" className="text-sm font-medium">
                Piso y departamento (opcional)
              </Label>
              <Input 
                id="edit-line2" 
                name="line2" 
                defaultValue={selectedAddress?.line2 || ''}
                placeholder="Ej: Piso 3, Depto B"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city" className="text-sm font-medium">
                Ciudad *
              </Label>
              <Input 
                id="edit-city" 
                name="city" 
                defaultValue={selectedAddress?.city}
                placeholder="Ej: Buenos Aires"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-state" className="text-sm font-medium">
                Provincia *
              </Label>
              <Input 
                id="edit-state" 
                name="state" 
                defaultValue={selectedAddress?.state}
                placeholder="Ej: Buenos Aires"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-postal_code" className="text-sm font-medium">
                Código postal *
              </Label>
              <Input 
                id="edit-postal_code" 
                name="postal_code" 
                defaultValue={selectedAddress?.postal_code}
                placeholder="Ej: 1425"
                required 
              />
            </div>
            <input type="hidden" name="country" value="Argentina" />
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="edit-is_default" 
                name="is_default"
                defaultChecked={selectedAddress?.is_default}
              />
              <Label htmlFor="edit-is_default" className="text-sm">
                Establecer como dirección predeterminada
              </Label>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCloseEditModal}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
                disabled={isPending}
              >
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 