'use client'

import { useState } from 'react'
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

interface AddressesTabProps {
  addresses: Address[]
  userId: string
  t: Translations
}

export function AddressesTab({ addresses, userId, t }: AddressesTabProps) {
  const router = useRouter()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddAddress = async (formData: FormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await createAddress(formData)
      if (!result.success) {
        throw new Error(result.error)
      }
      
      toast.success(t.account.addressAdded)
      setIsAddModalOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorOccurred)
      toast.error(err instanceof Error ? err.message : t.common.errorOccurred)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditAddress = async (formData: FormData) => {
    if (!selectedAddress) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await updateAddress(selectedAddress.id, formData)
      if (!result.success) {
        throw new Error(result.error)
      }
      
      toast.success(t.account.addressUpdated)
      setIsEditModalOpen(false)
      setSelectedAddress(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorOccurred)
      toast.error(err instanceof Error ? err.message : t.common.errorOccurred)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm(t.account.confirmDeleteAddress)) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await deleteAddress(addressId)
      if (!result.success) {
        throw new Error(result.error)
      }
      
      toast.success(t.account.addressDeleted)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorOccurred)
      toast.error(err instanceof Error ? err.message : t.common.errorOccurred)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await setDefaultAddress(addressId)
      if (error) throw error
      
      toast.success(t.account.addressSetAsDefault)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorOccurred)
      toast.error(err instanceof Error ? err.message : t.common.errorOccurred)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">DIRECCIONES</h2>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar dirección
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {addresses.map((address) => (
          <div 
            key={address.id} 
            className="bg-white rounded-lg border p-4 relative"
          >
            <div className="flex items-start gap-3">
              <div className="text-[#7B1E1E]">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{address.line1}</span>
                  {address.is_default && (
                    <span className="text-xs bg-[#7B1E1E] text-white px-2 py-0.5 rounded">
                      Predeterminada
                    </span>
                  )}
                </div>
                {address.line2 && (
                  <p className="text-gray-600 text-sm">{address.line2}</p>
                )}
                <p className="text-gray-600 text-sm">
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="text-gray-600 text-sm">{address.country}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedAddress(address)
                    setIsEditModalOpen(true)
                  }}
                  className="text-gray-600 hover:text-[#7B1E1E] transition-colors"
                  disabled={isLoading}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefaultAddress(address.id)}
                    className="text-gray-600 hover:text-[#7B1E1E] transition-colors"
                    disabled={isLoading}
                    title="Establecer como predeterminada"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="mb-4">No tienes direcciones guardadas</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
            >
              Agregar primera dirección
            </Button>
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar dirección</DialogTitle>
          </DialogHeader>
          <form action={handleAddAddress} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="line1">Dirección</Label>
              <Input id="line1" name="line1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line2">Dirección (línea 2)</Label>
              <Input id="line2" name="line2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Provincia</Label>
              <Input id="state" name="state" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Código postal</Label>
              <Input id="postal_code" name="postal_code" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input id="country" name="country" required defaultValue="Argentina" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is_default" name="is_default" />
              <Label htmlFor="is_default">Establecer como dirección predeterminada</Label>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Address Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar dirección</DialogTitle>
          </DialogHeader>
          <form action={handleEditAddress} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-line1">Dirección</Label>
              <Input 
                id="edit-line1" 
                name="line1" 
                defaultValue={selectedAddress?.line1}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-line2">Dirección (línea 2)</Label>
              <Input 
                id="edit-line2" 
                name="line2" 
                defaultValue={selectedAddress?.line2 || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">Ciudad</Label>
              <Input 
                id="edit-city" 
                name="city" 
                defaultValue={selectedAddress?.city}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-state">Provincia</Label>
              <Input 
                id="edit-state" 
                name="state" 
                defaultValue={selectedAddress?.state}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-postal_code">Código postal</Label>
              <Input 
                id="edit-postal_code" 
                name="postal_code" 
                defaultValue={selectedAddress?.postal_code}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">País</Label>
              <Input 
                id="edit-country" 
                name="country" 
                defaultValue={selectedAddress?.country}
                required 
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-is_default" 
                name="is_default"
                defaultChecked={selectedAddress?.is_default}
              />
              <Label htmlFor="edit-is_default">Establecer como dirección predeterminada</Label>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedAddress(null)
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 