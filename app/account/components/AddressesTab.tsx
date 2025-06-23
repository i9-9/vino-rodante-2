'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)

  const handleAddAddress = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    startTransition(async () => {
      try {
        const result = await createAddress(formData)
        if (result.error) {
          setError(result.error)
          toast.error(result.error)
        } else {
          setIsAddModalOpen(false)
          toast.success(t.account.addressAdded as string)
          router.refresh()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    })
  }

  const handleEditAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedAddress) return

    setError(null)
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)
    
    formData.set('id', selectedAddress.id)
    
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
          toast.success(t.account.addressUpdated as string)
          router.refresh()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    })
  }

  const handleDeleteAddress = async (addressId: string) => {
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
          toast.success(t.account.addressDeleted as string)
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
          toast.success(t.account.addressSetAsDefault as string)
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
    setSelectedAddress({...address})
    setError(null)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedAddress(null)
    setError(null)
    setIsLoading(false)
  }

  if (addresses.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {t.account.noAddresses as string}
        </h3>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          {t.account.addFirstAddress as string}
        </p>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.account.addNewAddress as string}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {t.account.savedAddresses as string}
          </h2>
          <p className="text-sm text-muted-foreground">
            {addresses.length} {addresses.length === 1 ? t.common.address : t.common.addresses}
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white w-full sm:w-auto gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.account.addNewAddress as string}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="divide-y border rounded-lg flex-1">
        {addresses.map((address) => (
          <div 
            key={address.id}
            className="p-4 first:rounded-t-lg last:rounded-b-lg flex flex-col sm:flex-row sm:items-start gap-4"
          >
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-[#7B1E1E] mt-1" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-medium">
                  {address.is_default ? 'DIRECCIÓN PRINCIPAL' : `Dirección #${addresses.indexOf(address) + 1}`}
                </h3>
                {address.is_default && (
                  <div className="px-2 py-1 text-xs font-medium bg-[#7B1E1E]/10 text-[#7B1E1E] rounded">
                    Principal
                  </div>
                )}
              </div>
              <div className="mt-1 text-sm text-muted-foreground space-y-0.5">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state}</p>
                <p>{address.postal_code}, {address.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap mt-4 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => handleOpenEditModal(address)}
                disabled={isPending}
              >
                <Pencil className="h-3 w-3 mr-2" />
                Editar
              </Button>
              {!address.is_default && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-[#7B1E1E] text-[#7B1E1E] hover:bg-[#7B1E1E] hover:text-white"
                  onClick={() => handleSetDefaultAddress(address)}
                  disabled={isPending}
                >
                  Principal
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={address.is_default || isPending}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. La dirección será eliminada permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteAddress(address.id)}
                      className="bg-red-600 hover:bg-red-700"
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
            <DialogTitle className="text-xl font-semibold">
              {t.account.addNewAddress as string}
            </DialogTitle>
          </DialogHeader>
          <form action={handleAddAddress} className="space-y-4">
            <input type="hidden" name="userId" value={userId} />
            
            <div className="space-y-2">
              <Label htmlFor="line1" className="text-sm font-medium">
                Calle y número *
              </Label>
              <Input
                id="line1"
                name="line1"
                placeholder="Ej: Av. Santa Fe 1234"
                required
                className="h-10"
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
                className="h-10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  Ciudad *
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Ej: Buenos Aires"
                  required
                  className="h-10"
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
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postal_code" className="text-sm font-medium">
                  Código postal *
                </Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  placeholder="Ej: 1425"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  País *
                </Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue="Argentina"
                  required
                  className="h-10"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {t.common.cancel as string}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.common.saving as string}
                  </>
                ) : (
                  t.common.save as string
                )}
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
            <DialogTitle className="text-xl font-semibold">
              Editar dirección
            </DialogTitle>
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
                className="h-10"
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
                className="h-10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                  className="h-10"
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
                  className="h-10"
                />
              </div>
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
                className="h-10"
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

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="pt-4 gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCloseEditModal}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {t.common.cancel as string}
              </Button>
              <Button 
                type="submit"
                className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white flex-1 sm:flex-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.common.saving as string}
                  </>
                ) : (
                  t.common.save as string
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 