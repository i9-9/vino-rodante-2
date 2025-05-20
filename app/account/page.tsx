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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WINE_TYPES, WINE_REGIONS, WINE_VARIETALS, isValidWineType, isValidWineRegion, isValidWineVarietal, prettyLabel } from "@/lib/wine-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { PostgrestError } from "@supabase/supabase-js"
import { read, utils } from 'xlsx'
import { Textarea } from "@/components/ui/textarea"

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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState<Omit<Product, "id"> | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string>("")
  const [editLoading, setEditLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [importText, setImportText] = useState("")
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
    setError(null)
    setSuccess(null)

    try {
      let imageUrl = form.image
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await uploadProductImage(imageFile, form.slug)
        if (uploadError) {
          setError(uploadError.message)
          return
        }
        imageUrl = uploadData || form.image
      }

      const { data, error } = await createProduct({ ...form, image: imageUrl })
      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Product created successfully')
      await getProducts()
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
    } catch (err) {
      console.error('[AdminDashboard] Error creating product:', err)
      setError('Error creating product')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await deleteProduct(id)
      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Product deleted successfully')
      await getProducts()
    } catch (err) {
      console.error('[AdminDashboard] Error deleting product:', err)
      setError('Error deleting product')
    } finally {
      setLoading(false)
    }
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
    setError(null)
    setSuccess(null)

    try {
      let imageUrl = editForm.image
      if (editImageFile) {
        const { data: uploadData, error: uploadError } = await uploadProductImage(editImageFile, editForm.slug)
        if (uploadError) {
          setError(uploadError.message)
          return
        }
        imageUrl = uploadData || editForm.image
      }

      const { error } = await updateProduct(editProduct.id, { ...editForm, image: imageUrl })
      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Product updated successfully')
      await getProducts()
      setEditDialogOpen(false)
      setEditProduct(null)
      setEditForm(null)
      setEditImageFile(null)
      setEditImagePreview("")
    } catch (err) {
      console.error('[AdminDashboard] Error updating product:', err)
      setError('Error updating product')
    } finally {
      setEditLoading(false)
    }
  }

  const handleBulkImport = async () => {
    if (!importText.trim()) return

    setImportLoading(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      const rows = importText.split('\n').filter(row => row.trim())
      let successCount = 0
      let errorCount = 0

      for (const row of rows) {
        try {
          // Parse CSV row handling quoted fields
          const fields: string[] = []
          let currentField = ''
          let insideQuotes = false
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i]
            if (char === '"') {
              insideQuotes = !insideQuotes
            } else if (char === ',' && !insideQuotes) {
              fields.push(currentField.trim())
              currentField = ''
            } else {
              currentField += char
            }
          }
          fields.push(currentField.trim()) // Push the last field

          const [name, slug, description, price, category, year, region, varietal, stock, featured] = fields
          
          // Validar nombre
          if (!name) {
            console.error('Product name is required')
            errorCount++
            continue
          }

          // Limpiar el slug
          const cleanSlug = slug
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

          // Validar y limpiar el precio
          let cleanPrice = 0
          if (price && price !== 'Sin información') {
            const numericPrice = price.replace(/[^0-9.]/g, '')
            if (!isNaN(Number(numericPrice))) {
              cleanPrice = Number(numericPrice)
            }
          }

          // Validar y limpiar la categoría
          let cleanCategory = 'tinto'
          if (category && category !== 'Sin información') {
            const lowerCategory = category.toLowerCase()
            if (['tinto', 'blanco', 'rosado', 'espumante', 'naranjo', 'gin', 'sidra'].includes(lowerCategory)) {
              cleanCategory = lowerCategory
            }
          }

          // Validar y limpiar la región
          let cleanRegion = 'mendoza'
          if (region && region !== 'Sin información') {
            const lowerRegion = region.toLowerCase()
            if (['mendoza', 'jujuy', 'río negro', 'buenos aires', 'patagonia'].includes(lowerRegion)) {
              cleanRegion = lowerRegion
            }
          }

          // Validar y limpiar el varietal
          let cleanVarietal = 'malbec'
          if (varietal && varietal !== 'Sin información') {
            const lowerVarietal = varietal.toLowerCase()
            if (['malbec', 'cabernet sauvignon', 'cabernet franc', 'chardonnay', 'syrah', 'pinot noir', 'torrontés', 'chenin blanc', 'nebbiolo', 'bonarda', 'petit verdot', 'blend'].includes(lowerVarietal)) {
              cleanVarietal = lowerVarietal
            }
          }

          // Validar y limpiar el año
          const cleanYear = year && year !== 'Sin información' ? year : '2024'

          // Validar y limpiar el stock
          const cleanStock = stock ? Number(stock) : 1000

          const product = {
            name,
            slug: cleanSlug,
            description: description || 'Sin descripción',
            price: cleanPrice,
            image: '',
            category: cleanCategory,
            year: cleanYear,
            region: cleanRegion,
            varietal: cleanVarietal,
            stock: cleanStock,
            featured: featured?.toLowerCase() === 'true' || false,
          }

          console.log('Importing product:', product)

          const { error } = await createProduct(product)
          if (error) {
            console.error(`Error importing product ${product.name}:`, error)
            errorCount++
          } else {
            successCount++
          }
        } catch (err) {
          console.error('Error processing row:', err)
          errorCount++
        }
      }

      setImportSuccess(`Import completed. ${successCount} products imported successfully. ${errorCount} failed.`)
      setImportText("")
      await getProducts()
    } catch (err) {
      console.error('[AdminDashboard] Error importing products:', err)
      setImportError('Error importing products')
    } finally {
      setImportLoading(false)
    }
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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState<Omit<Product, "id"> | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string>("")
  const [editLoading, setEditLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [importText, setImportText] = useState("")

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await getProducts()
      if (error) {
        setError(error.message)
        return
      }
      setProducts(data || [])
    } catch (err) {
      console.error('[AdminDashboard] Error loading products:', err)
      setError('Error loading products')
    }
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
    setError(null)
    setSuccess(null)

    try {
      let imageUrl = form.image
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await uploadProductImage(imageFile, form.slug)
        if (uploadError) {
          setError(uploadError.message)
          return
        }
        imageUrl = uploadData || form.image
      }

      const { data, error } = await createProduct({ ...form, image: imageUrl })
      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Product created successfully')
      await loadProducts()
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
    } catch (err) {
      console.error('[AdminDashboard] Error creating product:', err)
      setError('Error creating product')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await deleteProduct(id)
      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Product deleted successfully')
      await loadProducts()
    } catch (err) {
      console.error('[AdminDashboard] Error deleting product:', err)
      setError('Error deleting product')
    } finally {
      setLoading(false)
    }
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
    setError(null)
    setSuccess(null)

    try {
      let imageUrl = editForm.image
      if (editImageFile) {
        const { data: uploadData, error: uploadError } = await uploadProductImage(editImageFile, editForm.slug)
        if (uploadError) {
          setError(uploadError.message)
          return
        }
        imageUrl = uploadData || editForm.image
      }

      const { error } = await updateProduct(editProduct.id, { ...editForm, image: imageUrl })
      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Product updated successfully')
      await loadProducts()
      setEditDialogOpen(false)
      setEditProduct(null)
      setEditForm(null)
      setEditImageFile(null)
      setEditImagePreview("")
    } catch (err) {
      console.error('[AdminDashboard] Error updating product:', err)
      setError('Error updating product')
    } finally {
      setEditLoading(false)
    }
  }

  const handleBulkImport = async () => {
    if (!importText.trim()) return

    setImportLoading(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      const rows = importText.split('\n').filter(row => row.trim())
      let successCount = 0
      let errorCount = 0

      for (const row of rows) {
        try {
          // Parse CSV row handling quoted fields
          const fields: string[] = []
          let currentField = ''
          let insideQuotes = false
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i]
            if (char === '"') {
              insideQuotes = !insideQuotes
            } else if (char === ',' && !insideQuotes) {
              fields.push(currentField.trim())
              currentField = ''
            } else {
              currentField += char
            }
          }
          fields.push(currentField.trim()) // Push the last field

          const [name, slug, description, price, category, year, region, varietal, stock, featured] = fields
          
          // Validar nombre
          if (!name) {
            console.error('Product name is required')
            errorCount++
            continue
          }

          // Limpiar el slug
          const cleanSlug = slug
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

          // Validar y limpiar el precio
          let cleanPrice = 0
          if (price && price !== 'Sin información') {
            const numericPrice = price.replace(/[^0-9.]/g, '')
            if (!isNaN(Number(numericPrice))) {
              cleanPrice = Number(numericPrice)
            }
          }

          // Validar y limpiar la categoría
          let cleanCategory = 'tinto'
          if (category && category !== 'Sin información') {
            const lowerCategory = category.toLowerCase()
            if (['tinto', 'blanco', 'rosado', 'espumante', 'naranjo', 'gin', 'sidra'].includes(lowerCategory)) {
              cleanCategory = lowerCategory
            }
          }

          // Validar y limpiar la región
          let cleanRegion = 'mendoza'
          if (region && region !== 'Sin información') {
            const lowerRegion = region.toLowerCase()
            if (['mendoza', 'jujuy', 'río negro', 'buenos aires', 'patagonia'].includes(lowerRegion)) {
              cleanRegion = lowerRegion
            }
          }

          // Validar y limpiar el varietal
          let cleanVarietal = 'malbec'
          if (varietal && varietal !== 'Sin información') {
            const lowerVarietal = varietal.toLowerCase()
            if (['malbec', 'cabernet sauvignon', 'cabernet franc', 'chardonnay', 'syrah', 'pinot noir', 'torrontés', 'chenin blanc', 'nebbiolo', 'bonarda', 'petit verdot', 'blend'].includes(lowerVarietal)) {
              cleanVarietal = lowerVarietal
            }
          }

          // Validar y limpiar el año
          const cleanYear = year && year !== 'Sin información' ? year : '2024'

          // Validar y limpiar el stock
          const cleanStock = stock ? Number(stock) : 1000

          const product = {
            name,
            slug: cleanSlug,
            description: description || 'Sin descripción',
            price: cleanPrice,
            image: '',
            category: cleanCategory,
            year: cleanYear,
            region: cleanRegion,
            varietal: cleanVarietal,
            stock: cleanStock,
            featured: featured?.toLowerCase() === 'true' || false,
          }

          console.log('Importing product:', product)

          const { error } = await createProduct(product)
          if (error) {
            console.error(`Error importing product ${product.name}:`, error)
            errorCount++
          } else {
            successCount++
          }
        } catch (err) {
          console.error('Error processing row:', err)
          errorCount++
        }
      }

      setImportSuccess(`Import completed. ${successCount} products imported successfully. ${errorCount} failed.`)
      setImportText("")
      await loadProducts()
    } catch (err) {
      console.error('[AdminDashboard] Error importing products:', err)
      setImportError('Error importing products')
    } finally {
      setImportLoading(false)
    }
  }

  if (!user?.is_admin) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-[#5B0E2D] mb-6">Admin Dashboard</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {importError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      {importSuccess && (
        <Alert className="mb-4">
          <AlertDescription>{importSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="destructive"
              onClick={async () => {
                if (!confirm('¿Estás seguro de que quieres eliminar todos los productos? Esta acción no se puede deshacer.')) return
                
                setLoading(true)
                try {
                  const { data: products } = await getProducts()
                  if (products) {
                    for (const product of products) {
                      await deleteProduct(product.id)
                    }
                  }
                  await loadProducts()
                  setSuccess('Todos los productos han sido eliminados')
                } catch (err) {
                  console.error('Error deleting products:', err)
                  setError('Error al eliminar los productos')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar todos los productos"}
            </Button>
          </div>

          <div>
            <Label htmlFor="bulk-import">Bulk Import Products</Label>
            <Textarea
              id="bulk-import"
              placeholder="Paste your products here, one per line. Format: name,slug,description,price,category,year,region,varietal,stock,featured"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="h-32"
              disabled={importLoading}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleBulkImport} 
              disabled={importLoading || !importText.trim()}
              variant="outline"
            >
              {importLoading ? "Importing..." : "Import Products"}
            </Button>
            <p className="text-sm text-gray-500">
              One product per line. Fields: name, slug, description, price, category, year, region, varietal, stock, featured
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            name="category"
            value={form.category}
            onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(WINE_TYPES).map((type: string) => (
                <SelectItem key={type} value={type}>
                  {t.wineTypes[type as keyof typeof t.wineTypes] || prettyLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select
            name="region"
            value={form.region}
            onValueChange={(value) => setForm(prev => ({ ...prev, region: value }))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(WINE_REGIONS).map((region: string) => (
                <SelectItem key={region} value={region}>
                  {t.wineRegions[region as keyof typeof t.wineRegions] || prettyLabel(region)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="varietal">Varietal</Label>
          <Select
            name="varietal"
            value={form.varietal}
            onValueChange={(value) => setForm(prev => ({ ...prev, varietal: value }))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select varietal" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(WINE_VARIETALS).map((varietal: string) => (
                <SelectItem key={varietal} value={varietal}>
                  {t.wineVarietals[varietal as keyof typeof t.wineVarietals] || prettyLabel(varietal)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            value={form.year}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="image">Product Image</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={loading}
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="mt-2 h-24 object-contain border rounded" />
          )}
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Checkbox
            id="featured"
            name="featured"
            checked={form.featured}
            onCheckedChange={(checked) => setForm(prev => ({ ...prev, featured: checked as boolean }))}
            disabled={loading}
          />
          <Label htmlFor="featured">Featured Product</Label>
        </div>

        <Button type="submit" disabled={loading} className="col-span-2">
          {loading ? "Adding..." : "Add Product"}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Varietal</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.image && (
                  <img src={product.image} alt={product.name} className="h-12 w-12 object-contain rounded" />
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{t.wineTypes[product.category as keyof typeof t.wineTypes] || prettyLabel(product.category)}</TableCell>
              <TableCell>{t.wineRegions[product.region as keyof typeof t.wineRegions] || prettyLabel(product.region)}</TableCell>
              <TableCell>{t.wineVarietals[product.varietal as keyof typeof t.wineVarietals] || prettyLabel(product.varietal)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(product)} disabled={loading}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)} disabled={loading}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  value={editForm.slug}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={editForm.price}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  name="category"
                  value={editForm.category}
                  onValueChange={(value) => setEditForm(prev => prev ? { ...prev, category: value } : null)}
                  disabled={editLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(WINE_TYPES).map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {t.wineTypes[type as keyof typeof t.wineTypes] || prettyLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-region">Region</Label>
                <Select
                  name="region"
                  value={editForm.region}
                  onValueChange={(value) => setEditForm(prev => prev ? { ...prev, region: value } : null)}
                  disabled={editLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(WINE_REGIONS).map((region: string) => (
                      <SelectItem key={region} value={region}>
                        {t.wineRegions[region as keyof typeof t.wineRegions] || prettyLabel(region)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-varietal">Varietal</Label>
                <Select
                  name="varietal"
                  value={editForm.varietal}
                  onValueChange={(value) => setEditForm(prev => prev ? { ...prev, varietal: value } : null)}
                  disabled={editLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select varietal" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(WINE_VARIETALS).map((varietal: string) => (
                      <SelectItem key={varietal} value={varietal}>
                        {t.wineVarietals[varietal as keyof typeof t.wineVarietals] || prettyLabel(varietal)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  name="stock"
                  type="number"
                  value={editForm.stock}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  name="year"
                  value={editForm.year}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Product Image</Label>
                <Input
                  id="edit-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleEditChange}
                  disabled={editLoading}
                />
                {editImagePreview && (
                  <img src={editImagePreview} alt="Preview" className="mt-2 h-24 object-contain border rounded" />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-featured"
                  name="featured"
                  checked={editForm.featured}
                  onCheckedChange={(checked) => setEditForm(prev => prev ? { ...prev, featured: checked as boolean } : null)}
                  disabled={editLoading}
                />
                <Label htmlFor="edit-featured">Featured Product</Label>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? "Updating..." : "Update Product"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
