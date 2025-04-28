"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash, Plus, Check, MapPin, Package } from "lucide-react"
import { format } from "date-fns"
import type { Order } from "@/lib/types"
import { useTranslations } from "@/lib/providers/translations-provider"

interface Address {
  id: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export default function AccountPage() {
  const router = useRouter()
  const t = useTranslations()
  const { user, isLoading, signOut } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id' | 'is_default'>>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Argentina",
  })
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/sign-in")
    } else if (user) {
      // Fetch user profile data
      const fetchProfile = async () => {
        const { data, error } = await supabase.from("customers").select("*").eq("id", user.id).single()

        if (data) {
          setName(data.name)
          setEmail(user.email || "")
        }
      }

      // Fetch user orders
      const fetchOrders = async () => {
        setIsLoadingOrders(true)
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select(`*, order_items(*)`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (orderData) {
          setOrders(orderData as any)
        }
        setIsLoadingOrders(false)
      }

      // Fetch user addresses
      const fetchAddresses = async () => {
        setIsLoadingAddresses(true)
        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .select("*")
          .eq("customer_id", user.id)
          .order("is_default", { ascending: false })

        if (addressData) {
          setAddresses(addressData)
        }
        setIsLoadingAddresses(false)
      }

      fetchProfile()
      fetchOrders()
      fetchAddresses()
    }
  }, [user, isLoading, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateMessage(null)

    try {
      const { error } = await supabase.from("customers").update({ name }).eq("id", user?.id)

      if (error) {
        setUpdateMessage({ type: "error", text: error.message })
      } else {
        setUpdateMessage({ type: "success", text: "Profile updated successfully" })
      }
    } catch (error) {
      setUpdateMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    
    // Check if this is the first address (make it default)
    const isDefault = addresses.length === 0
    
    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert({
          ...newAddress,
          customer_id: user?.id,
          is_default: isDefault,
        })
        .select()
        
      if (error) {
        setUpdateMessage({ type: "error", text: error.message })
      } else {
        setAddresses(prev => [...prev, data[0]])
        setNewAddress({
          line1: "",
          line2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "Argentina",
        })
        setAddressDialogOpen(false)
      }
    } catch (error) {
      setUpdateMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleDeleteAddress = async (id: string) => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        
      if (error) {
        setUpdateMessage({ type: "error", text: error.message })
      } else {
        setAddresses(prev => prev.filter(address => address.id !== id))
      }
    } catch (error) {
      setUpdateMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleSetDefaultAddress = async (id: string) => {
    setIsUpdating(true)
    try {
      // First, set all addresses to non-default
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("customer_id", user?.id)
        
      // Then set the selected address as default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id)
        
      if (error) {
        setUpdateMessage({ type: "error", text: error.message })
      } else {
        setAddresses(prev => 
          prev.map(address => ({
            ...address,
            is_default: address.id === id
          }))
        )
      }
    } catch (error) {
      setUpdateMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const getOrderStatusBadge = (status: string, t: any) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{t.common.pending || "Pendiente"}</Badge>
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t.common.processing || "Procesando"}</Badge>
      case 'shipped':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">{t.common.shipped || "Enviado"}</Badge>
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t.common.delivered || "Entregado"}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-[#A83935] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-[#5B0E2D] mb-8">{t.account.title}</h1>

      <Tabs defaultValue="profile" className="max-w-4xl">
        <TabsList>
          <TabsTrigger value="profile">{t.account.profile}</TabsTrigger>
          <TabsTrigger value="orders">{t.account.orders}</TabsTrigger>
          <TabsTrigger value="addresses">{t.account.addresses}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.account.profileInfo}</CardTitle>
              <CardDescription>{t.account.updateProfile}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {updateMessage && (
                  <div
                    className={`p-4 rounded-md ${
                      updateMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {updateMessage.text}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">{t.checkout.fullName}</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.checkout.email}</Label>
                  <Input id="email" value={email} disabled className="bg-gray-100" />
                  <p className="text-sm text-gray-500">{t.account.emailCannotChange}</p>
                </div>

                <div className="flex justify-between">
                  <Button type="submit" className="bg-[#A83935] hover:bg-[#A83935]/90 text-white" disabled={isUpdating}>
                    {isUpdating ? t.common.update + "..." : t.common.update}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSignOut}>
                    {t.common.signOut}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.account.orderHistory}</CardTitle>
              <CardDescription>{t.account.orders}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="py-4 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-[#A83935] border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-500">{t.common.loading}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-500">{t.account.noOrders}</p>
                  <Button 
                    className="mt-4 bg-[#A83935] hover:bg-[#A83935]/90 text-white"
                    onClick={() => router.push('/products')}
                  >
                    {t.navigation.products}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">{t.account.orders} #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-500">
                              {order.created_at && format(new Date(order.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {getOrderStatusBadge(order.status, t)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="space-y-3">
                          {order.order_items && order.order_items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.product_name || t.products.title}</p>
                                <p className="text-sm text-gray-500">{t.common.quantity}: {item.quantity}</p>
                              </div>
                              <p>{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-gray-50 py-3 flex justify-between">
                        <p className="font-medium">{t.common.total}</p>
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t.account.savedAddresses}</CardTitle>
                <CardDescription>{t.account.noAddresses}</CardDescription>
              </div>
              
              <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    {t.account.addNewAddress}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.account.addNewAddress}</DialogTitle>
                    <DialogDescription>
                      {t.account.updateProfile}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddAddress} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="line1">{t.checkout.address1}</Label>
                      <Input 
                        id="line1" 
                        name="line1" 
                        value={newAddress.line1} 
                        onChange={handleNewAddressChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="line2">{t.checkout.address2}</Label>
                      <Input 
                        id="line2" 
                        name="line2" 
                        value={newAddress.line2 || ''} 
                        onChange={handleNewAddressChange} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">{t.checkout.city}</Label>
                        <Input 
                          id="city" 
                          name="city" 
                          value={newAddress.city} 
                          onChange={handleNewAddressChange}
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">{t.checkout.state}</Label>
                        <Input 
                          id="state" 
                          name="state" 
                          value={newAddress.state} 
                          onChange={handleNewAddressChange}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">{t.checkout.postalCode}</Label>
                        <Input 
                          id="postal_code" 
                          name="postal_code" 
                          value={newAddress.postal_code} 
                          onChange={handleNewAddressChange}
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="country">{t.checkout.country}</Label>
                        <Input 
                          id="country" 
                          name="country" 
                          value={newAddress.country} 
                          onChange={handleNewAddressChange}
                          required 
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        className="bg-[#A83935] hover:bg-[#A83935]/90 text-white"
                        disabled={isUpdating}
                      >
                        {isUpdating ? t.common.add + "..." : t.account.addNewAddress}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingAddresses ? (
                <div className="py-4 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-[#A83935] border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-500">{t.common.loading}</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-500">{t.account.noAddresses}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <Card key={address.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            {address.is_default && (
                              <Badge className="mb-2 bg-[#5B0E2D]">{t.common.default || "Default"}</Badge>
                            )}
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-gray-500">{address.line1}</p>
                            {address.line2 && <p className="text-sm text-gray-500">{address.line2}</p>}
                            <p className="text-sm text-gray-500">
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            <p className="text-sm text-gray-500">{address.country}</p>
                          </div>
                          
                          <div className="flex space-x-2">
                            {!address.is_default && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSetDefaultAddress(address.id)}
                                disabled={isUpdating}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                {t.common.setAsDefault || "Set as Default"}
                              </Button>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={isUpdating}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
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
      </Tabs>
    </div>
  )
}
