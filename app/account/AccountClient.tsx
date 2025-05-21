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
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        postal_code: formData.get('postal_code') as string,
        country: formData.get('country') as string,
      }

      const { error } = await addAddress(user.id, address)
      if (error) throw error

      const { data: addresses } = await getAddresses(user.id)
      setAddresses(addresses || [])
    } catch (err) {
      console.error('Error adding address:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
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

  // Nueva función para cambiar visibilidad
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
                                Default
                              </Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                Set as Default
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
                      <Label htmlFor="street">Street Address</Label>
                      <Input id="street" name="street" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" name="state" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input id="postal_code" name="postal_code" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" required />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Address</Button>
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
      </Tabs>
    </div>
  )
} 