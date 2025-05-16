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
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash, Plus, Check, MapPin, Package } from "lucide-react"
import { format } from "date-fns"
import type { Order, Product } from "@/lib/types"
import { useTranslations } from "@/lib/providers/translations-provider"
import { getProducts } from '@/lib/products-client'
import { createProduct, deleteProduct, updateProduct, uploadProductImage } from '@/lib/products-admin-client'
import { Table } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WINE_TYPES, WINE_REGIONS, WINE_VARIETALS, isValidWineType, isValidWineRegion, isValidWineVarietal, prettyLabel } from "@/lib/wine-data"

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
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    year: "",
    region: "",
    varietal: "",
    stock: 0,
    featured: false,
  })
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const supabase = createClient()

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

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target
    if (name === "image" && files && files[0]) {
      setImageFile(files[0])
      setImagePreview(URL.createObjectURL(files[0]))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let imageUrl = form.image
    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile, form.slug) || form.image
    }
    await createProduct({ ...form, image: imageUrl })
    setProducts(await getProducts())
    setForm({
      name: "",
      slug: "",
      description: "",
      price: 0,
      image: "",
      category: "",
      year: "",
      region: "",
      varietal: "",
      stock: 0,
      featured: false,
    })
    setImageFile(null)
    setImagePreview("")
    setLoading(false)
  }

  const handleDeleteProduct = async (id: string) => {
    setLoading(true)
    await deleteProduct(id)
    setProducts(await getProducts())
    setLoading(false)
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

      <AdminDashboard />
    </div>
  )
}

function AdminDashboard() {
  const { user } = useAuth()
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    year: "",
    region: "",
    varietal: "",
    stock: 0,
    featured: false,
  })
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState<Omit<Product, "id"> | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string>("")
  const [editLoading, setEditLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target
    if (name === "image" && files && files[0]) {
      setImageFile(files[0])
      setImagePreview(URL.createObjectURL(files[0]))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target
    if (name === "image" && files && files[0]) {
      setEditImageFile(files[0])
      setEditImagePreview(URL.createObjectURL(files[0]))
    } else {
      setEditForm((prev) => prev ? ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }) : null)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let imageUrl = form.image
    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile, form.slug) || form.image
    }
    await createProduct({ ...form, image: imageUrl })
    setProducts(await getProducts())
    setForm({
      name: "",
      slug: "",
      description: "",
      price: 0,
      image: "",
      category: "",
      year: "",
      region: "",
      varietal: "",
      stock: 0,
      featured: false,
    })
    setImageFile(null)
    setImagePreview("")
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    await deleteProduct(id)
    setProducts(await getProducts())
    setLoading(false)
  }

  const openEditDialog = (product: Product) => {
    setEditProduct(product)
    setEditForm({ ...product })
    setEditImageFile(null)
    setEditImagePreview(product.image)
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProduct || !editForm) return
    setEditLoading(true)
    let imageUrl = editForm.image
    if (editImageFile) {
      imageUrl = await uploadProductImage(editImageFile, editForm.slug) || editForm.image
    }
    await updateProduct(editProduct.id, { ...editForm, image: imageUrl })
    setProducts(await getProducts())
    setEditDialogOpen(false)
    setEditProduct(null)
    setEditForm(null)
    setEditImageFile(null)
    setEditImagePreview("")
    setEditLoading(false)
  }

  if (!user?.is_admin) return null

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4 mb-8">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
        <Input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug" required />
        <Input name="description" value={form.description} onChange={handleChange} placeholder="Descripción" required />
        <Input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Precio" required />
        
        <div className="space-y-2">
          <Label htmlFor="category">Tipo de Vino</Label>
          <Select
            value={form.category}
            onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(WINE_TYPES).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {t.wineTypes[value as keyof typeof t.wineTypes] || prettyLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Región</Label>
          <Select
            value={form.region}
            onValueChange={(value) => setForm(prev => ({ ...prev, region: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar región" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(WINE_REGIONS).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {t.wineRegions[value as keyof typeof t.wineRegions] || prettyLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="varietal">Varietal</Label>
          <Select
            value={form.varietal}
            onValueChange={(value) => setForm(prev => ({ ...prev, varietal: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar varietal" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(WINE_VARIETALS).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {t.wineVarietals[value as keyof typeof t.wineVarietals] || prettyLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input name="year" value={form.year} onChange={handleChange} placeholder="Año" required />
        <Input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stock" required />
        
        <label className="flex items-center gap-2 col-span-2">
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
          Destacado
        </label>
        
        <div className="col-span-2">
          <label className="block mb-2 font-medium">Imagen del producto</label>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="mt-2 h-24 object-contain border rounded" />
          )}
        </div>
        
        <Button type="submit" disabled={loading} className="col-span-2">Agregar producto</Button>
      </form>

      <Table className="border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300">Imagen</th>
            <th className="border border-gray-300">Nombre</th>
            <th className="border border-gray-300">Precio</th>
            <th className="border border-gray-300">Tipo</th>
            <th className="border border-gray-300">Región</th>
            <th className="border border-gray-300">Varietal</th>
            <th className="border border-gray-300">Stock</th>
            <th className="border border-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border border-gray-300">{p.image && <img src={p.image} alt={p.name} className="h-12 w-12 object-contain rounded" />}</td>
              <td className="border border-gray-300">{p.name}</td>
              <td className="border border-gray-300">${p.price}</td>
              <td className="border border-gray-300">{t.wineTypes[p.category as keyof typeof t.wineTypes] || prettyLabel(p.category)}</td>
              <td className="border border-gray-300">{t.wineRegions[p.region as keyof typeof t.wineRegions] || prettyLabel(p.region)}</td>
              <td className="border border-gray-300">{t.wineVarietals[p.varietal as keyof typeof t.wineVarietals] || prettyLabel(p.varietal)}</td>
              <td className="border border-gray-300">{p.stock}</td>
              <td className="border border-gray-300 space-x-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(p)} disabled={loading}>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)} disabled={loading}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4">
              <Input name="name" value={editForm.name} onChange={handleEditChange} placeholder="Nombre" required />
              <Input name="slug" value={editForm.slug} onChange={handleEditChange} placeholder="Slug" required />
              <Input name="description" value={editForm.description} onChange={handleEditChange} placeholder="Descripción" required />
              <Input name="price" type="number" value={editForm.price} onChange={handleEditChange} placeholder="Precio" required />
              
              <div className="space-y-2">
                <Label htmlFor="category">Tipo de Vino</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) => setEditForm(prev => prev ? { ...prev, category: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WINE_TYPES).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {t.wineTypes[value as keyof typeof t.wineTypes] || prettyLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Región</Label>
                <Select
                  value={editForm.region}
                  onValueChange={(value) => setEditForm(prev => prev ? { ...prev, region: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WINE_REGIONS).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {t.wineRegions[value as keyof typeof t.wineRegions] || prettyLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="varietal">Varietal</Label>
                <Select
                  value={editForm.varietal}
                  onValueChange={(value) => setEditForm(prev => prev ? { ...prev, varietal: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar varietal" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WINE_VARIETALS).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {t.wineVarietals[value as keyof typeof t.wineVarietals] || prettyLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input name="year" value={editForm.year} onChange={handleEditChange} placeholder="Año" required />
              <Input name="stock" type="number" value={editForm.stock} onChange={handleEditChange} placeholder="Stock" required />
              
              <label className="flex items-center gap-2 col-span-2">
                <input type="checkbox" name="featured" checked={editForm.featured} onChange={handleEditChange} />
                Destacado
              </label>
              
              <div className="col-span-2">
                <label className="block mb-2 font-medium">Imagen del producto</label>
                <input type="file" name="image" accept="image/*" onChange={handleEditChange} />
                {editImagePreview && (
                  <img src={editImagePreview} alt="Preview" className="mt-2 h-24 object-contain border rounded" />
                )}
              </div>
              
              <DialogFooter className="col-span-2 flex gap-2">
                <Button type="submit" disabled={editLoading}>Guardar cambios</Button>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>Cancelar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
