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

async function uploadPlanImage(file: File, planId: string) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${planId}-${Date.now()}.${fileExt}`
  const filePath = fileName
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('subscription-plans')
    .upload(filePath, file, { upsert: true })
  if (uploadError) {
    return { data: null, error: uploadError }
  }
  const { data: publicUrlData } = supabase.storage
    .from('subscription-plans')
    .getPublicUrl(filePath)
  const publicUrl = publicUrlData?.publicUrl
  return { data: publicUrl, error: null }
}

async function uploadBannerImage(file: File, planId: string) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${planId}-banner-${Date.now()}.${fileExt}`
  const filePath = fileName
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('subscription-plans')
    .upload(filePath, file, { upsert: true })
  if (uploadError) {
    return { data: null, error: uploadError }
  }
  const { data: publicUrlData } = supabase.storage
    .from('subscription-plans')
    .getPublicUrl(filePath)
  const publicUrl = publicUrlData?.publicUrl
  return { data: publicUrl, error: null }
}

export default function AccountClient({ user, isAdmin }: { user: User, isAdmin: boolean }) {
  const router = useRouter()
  const t = useTranslations()
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [subscriptionPlans, setSubscriptionPlans] = useState<Database['public']['Tables']['subscription_plans']['Row'][]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [planImageFile, setPlanImageFile] = useState<File | null>(null)
  const [savingPlan, setSavingPlan] = useState(false)
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [planProducts, setPlanProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [loadingPlanProducts, setLoadingPlanProducts] = useState(false)
  const [addingProduct, setAddingProduct] = useState(false)
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [profileRes, ordersRes, addressesRes] = await Promise.all([
          getProfile(user.id),
          getOrders(user.id),
          getAddresses(user.id)
        ])

        if (profileRes.error) throw profileRes.error
        if (ordersRes.error) throw ordersRes.error
        if (addressesRes.error) throw addressesRes.error

        setProfile(profileRes.data)
        setOrders(ordersRes.data || [])
        setAddresses(addressesRes.data || [])
      } catch (err) {
        console.error('Error loading account data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user.id])

  useEffect(() => {
    if (!isAdmin) return
    const fetchProducts = async () => {
      setLoadingProducts(true)
      setProductError(null)
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
        if (error) throw error
        setProducts(data || [])
      } catch (err: any) {
        setProductError(err.message || 'Error cargando productos')
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    const fetchPlans = async () => {
      setLoadingPlans(true)
      const supabase = createClient()
      const { data, error } = await supabase.from('subscription_plans').select('*').order('created_at', { ascending: false })
      if (!error) setSubscriptionPlans(data || [])
      setLoadingPlans(false)
    }
    fetchPlans()
  }, [isAdmin])

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      formData.append('userId', user.id)
      await updateProfileAction(formData)
      router.refresh()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

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

      console.log('Attempting to add address:', address)
      const { error } = await addAddress(user.id, address)
      
      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(error.message || 'Error al agregar la dirección')
      }

      const { data: addresses, error: fetchError } = await getAddresses(user.id)
      if (fetchError) {
        console.error('Error fetching updated addresses:', fetchError)
        throw new Error(fetchError.message || 'Error al actualizar la lista de direcciones')
      }

      setAddresses(addresses || [])
      setShowAddressModal(false)
    } catch (err) {
      console.error('Error adding address:', err)
      setError(err instanceof Error ? err.message : 'Ocurrió un error al agregar la dirección')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await deleteAddress(id)
      if (error) throw error

      setAddresses(addresses.filter(addr => addr.id !== id))
    } catch (err) {
      console.error('Error deleting address:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const { error } = await setDefaultAddress(user.id, id)
      if (error) throw error

      const { data: addresses } = await getAddresses(user.id)
      setAddresses(addresses || [])
    } catch (err) {
      console.error('Error setting default address:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setShowProductModal(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }

  const handleCloseModal = () => {
    setEditingProduct(null)
    setShowProductModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas borrar este producto?')) return
    const { error } = await deleteProduct(id)
    if (!error) {
      setProducts(products.filter(p => p.id !== id))
    } else {
      alert('Error al borrar producto: ' + error.message)
    }
  }

  const handleSave = async (formData: FormData) => {
    const fields = [
      'name', 'slug', 'description', 'price', 'image', 'category', 'year', 'region', 'varietal', 'stock', 'featured'
    ]
    const product: any = {}
    fields.forEach(f => product[f] = formData.get(f))
    product.price = parseFloat(product.price)
    product.stock = parseInt(product.stock)
    product.featured = formData.get('featured') === 'on'
    if (formData.get('image') instanceof File && (formData.get('image') as File).size > 0) {
      const file = formData.get('image') as File
      const { data: imageUrl, error: imgErr } = await uploadProductImage(file, product.slug)
      if (imgErr) {
        alert('Error subiendo imagen: ' + imgErr.message)
        return
      }
      product.image = imageUrl
    }
    let result
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, product)
    } else {
      result = await createProduct(product)
    }
    if (result.error) {
      alert('Error guardando producto: ' + result.error.message)
    } else {
      handleCloseModal()
      const supabase = createClient()
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      setProducts(data || [])
    }
  }

  const handleToggleVisible = async (product: Product) => {
    const { error } = await updateProduct(product.id, { is_visible: !product.is_visible })
    if (!error) {
      setProducts(products =>
        products.map(p =>
          p.id === product.id ? { ...p, is_visible: !p.is_visible } : p
        )
      )
    } else {
      alert('Error actualizando visibilidad: ' + error.message)
    }
  }

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan)
    setPlanImageFile(null)
  }

  const handleSavePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPlan) return
    setSavingPlan(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    let imageUrl = editingPlan.image
    let bannerImageUrl = editingPlan.banner_image
    if (planImageFile) {
      const { data, error } = await uploadPlanImage(planImageFile, editingPlan.id || formData.get('name'))
      if (error) {
        alert('Error subiendo imagen: ' + error.message)
        setSavingPlan(false)
        return
      }
      imageUrl = data
    }
    if (bannerImageFile) {
      const { data, error } = await uploadBannerImage(bannerImageFile, editingPlan.id || formData.get('name'))
      if (error) {
        alert('Error subiendo imagen de banner: ' + error.message)
        setSavingPlan(false)
        return
      }
      bannerImageUrl = data
    }
    const supabase = createClient()
    let error
    if (editingPlan.id) {
      // Update
      ({ error } = await supabase.from('subscription_plans').update({
        name: formData.get('name'),
        club: formData.get('club'),
        description: formData.get('description'),
        tagline: formData.get('tagline'),
        price_monthly: Number(formData.get('price_monthly')),
        price_quarterly: Number(formData.get('price_quarterly')),
        price_yearly: Number(formData.get('price_yearly')),
        is_visible: formData.get('is_visible') === 'on',
        image: imageUrl,
        banner_image: bannerImageUrl
      }).eq('id', editingPlan.id))
    } else {
      // Insert
      ({ error } = await supabase.from('subscription_plans').insert({
        name: formData.get('name'),
        club: formData.get('club'),
        description: formData.get('description'),
        tagline: formData.get('tagline'),
        price_monthly: Number(formData.get('price_monthly')),
        price_quarterly: Number(formData.get('price_quarterly')),
        price_yearly: Number(formData.get('price_yearly')),
        is_visible: formData.get('is_visible') === 'on',
        image: imageUrl,
        banner_image: bannerImageUrl
      }))
    }
    if (error) {
      alert('Error guardando plan: ' + error.message)
    } else {
      setEditingPlan(null)
      setPlanImageFile(null)
      setBannerImageFile(null)
      const { data } = await supabase.from('subscription_plans').select('*').order('created_at', { ascending: false })
      setSubscriptionPlans(data || [])
    }
    setSavingPlan(false)
  }

  const handleOpenProducts = async (plan: any) => {
    setSelectedPlan(plan)
    setShowProductsModal(true)
    setLoadingPlanProducts(true)
    const supabase = createClient()
    const { data: planProductsData } = await supabase
      .from('subscription_plan_products')
      .select('id, product_id, quantity, products(name, image)')
      .eq('plan_id', plan.id)
    setPlanProducts(planProductsData || [])
    const { data: allProductsData } = await supabase
      .from('products')
      .select('*')
      .order('name')
    setAllProducts(allProductsData || [])
    setLoadingPlanProducts(false)
    setProductSearch('')
  }

  const handleAddProductToPlan = async (productId: string) => {
    if (!selectedPlan) return
    setAddingProduct(true)
    const supabase = createClient()
    const { error } = await supabase.from('subscription_plan_products').insert({
      plan_id: selectedPlan.id,
      product_id: productId,
      quantity: 1
    })
    if (error) {
      alert('Error agregando producto: ' + error.message)
    } else {
      handleOpenProducts(selectedPlan)
    }
    setAddingProduct(false)
  }

  const handleRemoveProductFromPlan = async (planProductId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('subscription_plan_products').delete().eq('id', planProductId)
    if (error) {
      alert('Error quitando producto: ' + error.message)
    } else {
      setPlanProducts(planProducts.filter(p => p.id !== planProductId))
    }
  }

  const handleChangeQuantity = async (planProductId: string, quantity: number) => {
    const supabase = createClient()
    const { error } = await supabase.from('subscription_plan_products').update({ quantity }).eq('id', planProductId)
    if (error) {
      alert('Error actualizando cantidad: ' + error.message)
    } else {
      setPlanProducts(planProducts.map(p => p.id === planProductId ? { ...p, quantity } : p))
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este plan? Esta acción no se puede deshacer.')) return
    const supabase = createClient()
    const { error } = await supabase.from('subscription_plans').delete().eq('id', planId)
    if (error) {
      alert('Error eliminando plan: ' + error.message)
    } else {
      const { data } = await supabase.from('subscription_plans').select('*').order('created_at', { ascending: false })
      setSubscriptionPlans(data || [])
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[40vh]"><Spinner size={48} /></div>
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">{t.account.profile}</TabsTrigger>
          <TabsTrigger value="orders">{t.account.orders}</TabsTrigger>
          <TabsTrigger value="addresses">{t.account.addresses}</TabsTrigger>
          {isAdmin && <TabsTrigger value="products">Productos</TabsTrigger>}
          {isAdmin && <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>}
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

              <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
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
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Administrar Productos</CardTitle>
                <Button onClick={handleOpenCreate}>Agregar producto</Button>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                {loadingProducts ? (
                  <div className="p-6">Cargando productos...</div>
                ) : productError ? (
                  <div className="text-red-500 p-6">{productError}</div>
                ) : (
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Destacado</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Año</TableHead>
                        <TableHead>Región</TableHead>
                        <TableHead>Varietal</TableHead>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Visible</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(product => (
                        <TableRow key={product.id} className="even:bg-muted/30">
                          <TableCell className="font-medium max-w-[160px] truncate">{product.name}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{product.slug}</TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>{product.featured ? <Badge variant="default">Sí</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{product.category}</TableCell>
                          <TableCell>{product.year}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{product.region}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{product.varietal}</TableCell>
                          <TableCell>
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md border" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={product.is_visible}
                              onCheckedChange={() => handleToggleVisible(product)}
                              aria-label="Cambiar visibilidad"
                            />
                          </TableCell>
                          <TableCell className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(product)}>
                              Editar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                              Borrar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            {showProductModal && (
              <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Editar producto' : 'Agregar producto'}</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={e => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      handleSave(formData)
                    }}
                  >
                    <Input name="name" placeholder="Nombre" defaultValue={editingProduct?.name} required />
                    <Input name="slug" placeholder="Slug" defaultValue={editingProduct?.slug} required />
                    <Input name="description" placeholder="Descripción" defaultValue={editingProduct?.description} required />
                    <Input name="price" type="number" step="0.01" placeholder="Precio" defaultValue={editingProduct?.price} required />
                    <Input name="stock" type="number" placeholder="Stock" defaultValue={editingProduct?.stock} required />
                    <Input name="category" placeholder="Categoría" defaultValue={editingProduct?.category} required />
                    <Input name="year" placeholder="Año" defaultValue={editingProduct?.year} required />
                    <Input name="region" placeholder="Región" defaultValue={editingProduct?.region} required />
                    <Input name="varietal" placeholder="Varietal" defaultValue={editingProduct?.varietal} required />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="featured" defaultChecked={!!editingProduct?.featured} /> Destacado
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="is_visible" defaultChecked={!!editingProduct?.is_visible} /> Visible
                    </label>
                    <Input name="image" type="file" accept="image/*" />
                    <DialogFooter>
                      <Button type="submit">{editingProduct ? 'Guardar cambios' : 'Crear producto'}</Button>
                      <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
        )}
        {isAdmin && (
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Administrar Suscripciones</CardTitle>
                <CardDescription>Gestioná los planes de suscripción y sus productos asociados.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="mb-4" onClick={() => { setEditingPlan({ name: '', description: '', tagline: '', price_monthly: '', price_quarterly: '', price_yearly: '', is_visible: true, image: null }); setPlanImageFile(null); setBannerImageFile(null); }}>
                  Agregar plan
                </Button>
                {loadingPlans ? (
                  <div className="p-6">Cargando planes...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr>
                          <th className="border px-2 py-1">Nombre</th>
                          <th className="border px-2 py-1">Imagen</th>
                          <th className="border px-2 py-1">Precios</th>
                          <th className="border px-2 py-1">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptionPlans.map(plan => (
                          <tr key={plan.id}>
                            <td className="border px-2 py-1 font-medium">{plan.name}</td>
                            <td className="border px-2 py-1">
                              {plan.image ? (
                                <img src={plan.image} alt={plan.name} className="w-16 h-16 object-cover rounded" />
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="border px-2 py-1">
                              <div>Mensual: ${plan.price_monthly}</div>
                              <div>Trimestral: ${plan.price_quarterly}</div>
                              <div>Anual: ${plan.price_yearly}</div>
                            </td>
                            <td className="border px-2 py-1">
                              <Button size="sm" variant="outline" onClick={() => handleEditPlan(plan)}>Editar</Button>
                              <Button size="sm" variant="secondary" className="ml-2" onClick={() => handleOpenProducts(plan)}>Productos</Button>
                              <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeletePlan(plan.id)}>Eliminar</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
            <Dialog open={!!editingPlan} onOpenChange={open => { if (!open) setEditingPlan(null) }}>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Plan de Suscripción</DialogTitle>
                </DialogHeader>
                {editingPlan && (
                  <form className="space-y-4" onSubmit={handleSavePlan}>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre</label>
                      <Input name="name" defaultValue={editingPlan.name} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Club</label>
                      <select name="club" defaultValue={editingPlan.club || ''} required className="w-full border rounded px-2 py-1">
                        <option value="">Seleccionar club</option>
                        <option value="tinto">Tinto</option>
                        <option value="blanco">Blanco</option>
                        <option value="mixto">Mixto</option>
                        <option value="naranjo">Naranjo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Descripción</label>
                      <Input name="description" defaultValue={editingPlan.description} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tagline</label>
                      <Input name="tagline" defaultValue={editingPlan.tagline || ''} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Precio Mensual</label>
                      <Input name="price_monthly" type="number" step="0.01" defaultValue={editingPlan.price_monthly || ''} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Precio Trimestral</label>
                      <Input name="price_quarterly" type="number" step="0.01" defaultValue={editingPlan.price_quarterly || ''} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Precio Anual</label>
                      <Input name="price_yearly" type="number" step="0.01" defaultValue={editingPlan.price_yearly || ''} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Imagen</label>
                      {editingPlan.image && (
                        <img src={editingPlan.image} alt="Imagen actual" className="w-24 h-24 object-cover rounded mb-2" />
                      )}
                      <Input type="file" accept="image/*" onChange={e => setPlanImageFile(e.target.files?.[0] || null)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Imagen de Banner</label>
                      {editingPlan.banner_image && (
                        <img src={editingPlan.banner_image} alt="Banner actual" className="w-32 h-20 object-cover rounded mb-2" />
                      )}
                      <Input type="file" accept="image/*" onChange={e => setBannerImageFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="is_visible" id="is_visible" defaultChecked={!!editingPlan.is_visible} />
                      <label htmlFor="is_visible">Visible</label>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={savingPlan}>{savingPlan ? 'Guardando...' : 'Guardar cambios'}</Button>
                      <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>Cancelar</Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
            <Dialog open={showProductsModal} onOpenChange={open => { if (!open) setShowProductsModal(false) }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Productos del Plan</DialogTitle>
                </DialogHeader>
                {selectedPlan && (
                  <div>
                    <div className="mb-4">
                      <strong>Plan:</strong> {selectedPlan.name}
                    </div>
                    {loadingPlanProducts ? (
                      <div>Cargando productos...</div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <strong>Agregar producto:</strong>
                          <Input
                            placeholder="Buscar producto..."
                            value={productSearch}
                            onChange={e => setProductSearch(e.target.value)}
                            className="mt-1 mb-2"
                          />
                          <div className="max-h-40 overflow-y-auto border rounded">
                            {allProducts
                              .filter(p =>
                                !planProducts.some(pp => pp.product_id === p.id) &&
                                (p.name.toLowerCase().includes(productSearch.toLowerCase()) || productSearch === '')
                              )
                              .map(p => (
                                <div key={p.id} className="flex items-center justify-between px-2 py-1 hover:bg-muted/30">
                                  <div className="flex items-center gap-2">
                                    {p.image && <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded" />}
                                    <span>{p.name}</span>
                                  </div>
                                  <Button size="sm" variant="outline" disabled={addingProduct} onClick={() => handleAddProductToPlan(p.id)}>
                                    Agregar
                                  </Button>
                                </div>
                              ))}
                            {allProducts.filter(p => !planProducts.some(pp => pp.product_id === p.id) && (p.name.toLowerCase().includes(productSearch.toLowerCase()) || productSearch === '')).length === 0 && (
                              <div className="px-2 py-2 text-muted-foreground text-sm">No hay productos para agregar.</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <strong>Productos asociados:</strong>
                          <table className="min-w-full border text-sm mt-2">
                            <thead>
                              <tr>
                                <th className="border px-2 py-1">Producto</th>
                                <th className="border px-2 py-1">Cantidad</th>
                                <th className="border px-2 py-1">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {planProducts.map(pp => (
                                <tr key={pp.id}>
                                  <td className="border px-2 py-1 flex items-center gap-2">
                                    {pp.products?.image && <img src={pp.products.image} alt={pp.products.name} className="w-8 h-8 object-cover rounded" />}
                                    {pp.products?.name}
                                  </td>
                                  <td className="border px-2 py-1">
                                    <Input
                                      type="number"
                                      min={1}
                                      value={pp.quantity}
                                      onChange={e => handleChangeQuantity(pp.id, Number(e.target.value))}
                                      className="w-16"
                                    />
                                  </td>
                                  <td className="border px-2 py-1">
                                    <Button size="sm" variant="destructive" onClick={() => handleRemoveProductFromPlan(pp.id)}>
                                      Quitar
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                              {planProducts.length === 0 && (
                                <tr><td colSpan={3} className="text-center text-muted-foreground py-2">No hay productos asociados.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
} 