"use client"
import type { User } from "@supabase/supabase-js"
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash, Plus, Check, MapPin, Package } from "lucide-react"
import { format } from "date-fns"
import type { Order, Product } from "@/lib/types"
import { useTranslations } from "@/lib/providers/translations-provider"
import { getProfile, getOrders, getAddresses, addAddress, deleteAddress, setDefaultAddress } from './actions/auth-client'
import { updateProfileAction } from './actions/auth'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createProduct, updateProduct, deleteProduct, uploadProductImage } from './actions/products'
import Spinner from "@/components/ui/Spinner"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import type { Database } from '@/lib/database.types'

export default function AccountClientClient({
  user,
  isAdmin,
  profile: initialProfile,
  orders: initialOrders,
  addresses: initialAddresses,
  children
}: {
  user: User,
  isAdmin: boolean,
  profile: any,
  orders: any[],
  addresses: any[],
  children?: React.ReactNode
}) {
  const router = useRouter()
  const t = useTranslations()
  const [profile, setProfile] = useState<any>(initialProfile)
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [addresses, setAddresses] = useState<any[]>(initialAddresses)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // ... aquí irían los estados y lógica para productos, suscripciones, modales, etc.

  // Ejemplo de handler para actualizar perfil
  const handleUpdateProfile = async (formData: FormData) => {
    try {
      formData.append('userId', user.id)
      await updateProfileAction(formData)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Ejemplo de handler para agregar dirección
  const handleAddAddress = async (formData: FormData) => {
    try {
      const address = {
        line1: formData.get('line1') as string,
        line2: formData.get('line2') as string || null,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        postal_code: formData.get('postal_code') as string,
        country: formData.get('country') as string,
      }
      const { error } = await addAddress(user.id, address)
      if (error) throw error
      // Refrescar direcciones
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al agregar la dirección')
    }
  }

  // Ejemplo de handler para borrar dirección
  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await deleteAddress(id)
      if (error) throw error
      setAddresses(addresses.filter(addr => addr.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Ejemplo de handler para setear dirección por defecto
  const handleSetDefaultAddress = async (id: string) => {
    try {
      const { error } = await setDefaultAddress(user.id, id)
      if (error) throw error
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // ... aquí irían los handlers y lógica para productos, suscripciones, modales, etc.

  return (
    <div className="container py-8">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">{t.account.profile}</TabsTrigger>
          <TabsTrigger value="orders">{t.account.orders}</TabsTrigger>
          <TabsTrigger value="addresses">{t.account.addresses}</TabsTrigger>
          {isAdmin && <TabsTrigger value="products">Productos</TabsTrigger>}
          {isAdmin && <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>}
          {isAdmin && <TabsTrigger value="admin-orders">Pedidos</TabsTrigger>}
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t.account.profileInfo}</CardTitle>
              <CardDescription>{t.account.updateProfile}</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                  <p className="text-sm text-muted-foreground">{t.account.emailCannotChange}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={profile?.name} />
                </div>
                <Button type="submit">Update Profile</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t.account.orderHistory}</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p>{t.account.noOrders}</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Order #{order.id}</CardTitle>
                            <CardDescription>
                              {order.created_at ? format(new Date(order.created_at), 'PPP') : 'No date'}
                            </CardDescription>
                          </div>
                          <Badge>{order.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between">
                              <span>{item.product_name}</span>
                              <span>{formatCurrency(item.price)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>{t.account.savedAddresses}</CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <p>{t.account.noAddresses}</p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <Card key={address.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium">{address.street}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            <p className="text-sm text-muted-foreground">{address.country}</p>
                          </div>
                          <div className="flex gap-2">
                            {address.is_default ? (
                              <Badge variant="secondary">
                                <Check className="w-4 h-4 mr-1" />
                                {t.common.default}
                              </Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                {t.common.setAsDefault}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.account.addNewAddress}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.account.addNewAddress}</DialogTitle>
                  </DialogHeader>
                  <form action={handleAddAddress} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="line1">{t.checkout.address1}</Label>
                      <Input id="line1" name="line1" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line2">{t.checkout.address2}</Label>
                      <Input id="line2" name="line2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t.checkout.city}</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">{t.checkout.state}</Label>
                      <Input id="state" name="state" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">{t.checkout.postalCode}</Label>
                      <Input id="postal_code" name="postal_code" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{t.checkout.country}</Label>
                      <Input id="country" name="country" required />
                    </div>
                    <DialogFooter>
                      <Button type="submit">{t.account.addNewAddress}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
        {isAdmin && (
          <TabsContent value="admin-orders">
            {children}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
} 