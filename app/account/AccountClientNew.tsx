'use client'

import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import type { Profile } from '@/lib/types'
import type { Product, Subscription, Order, Address } from './types'
import type { Translations } from '@/lib/i18n/types'

// Import tab components
import { ProfileTab } from './components/ProfileTab'
import { OrdersTab } from './components/OrdersTab'
import { AddressesTab } from './components/AddressesTab'
import AdminOrdersTab from './admin-orders-tab'
import AdminProductsTab from './admin-products-tab'
import AdminSubscriptionsTab from './admin-subscriptions-tab'

interface AccountClientProps {
  user: User
  profile: Profile
  orders: Order[]
  addresses: Address[]
  userRole: 'admin' | 'user'
  t: Translations
  // Admin data
  adminOrders?: Order[]
  adminSubscriptions?: Subscription[]
  adminProducts?: Product[]
}

export default function AccountClientNew({
  user,
  profile,
  orders,
  addresses,
  userRole,
  t,
  // Admin data
  adminOrders = [],
  adminSubscriptions = [],
  adminProducts = [],
}: AccountClientProps) {
  const router = useRouter()
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    const result = await signOut()
    if (result?.error) {
      toast.error(t.errors.signOutError(result.error))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[2000px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t.account.title}</h2>
              <p className="text-muted-foreground">
                {t.account.subtitle}
              </p>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t.common.signOut}
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">{t.account.profile}</TabsTrigger>
              <TabsTrigger value="orders">{t.account.orders}</TabsTrigger>
              <TabsTrigger value="addresses">{t.account.addresses}</TabsTrigger>
              {userRole === 'admin' && (
                <>
                  <TabsTrigger value="admin-orders">{t.account.adminOrders}</TabsTrigger>
                  <TabsTrigger value="admin-products">{t.account.adminProducts}</TabsTrigger>
                  <TabsTrigger value="admin-subscriptions">{t.account.adminSubscriptions}</TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ProfileTab user={user} profile={profile} t={t} />
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="grid gap-4">
                <OrdersTab orders={orders} t={t} />
              </div>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AddressesTab addresses={addresses} userId={user.id} t={t} />
              </div>
            </TabsContent>

            {userRole === 'admin' && (
              <>
                <TabsContent value="admin-orders" className="space-y-4">
                  <div className="grid gap-4">
                    <AdminOrdersTab orders={adminOrders} t={t} />
                  </div>
                </TabsContent>

                <TabsContent value="admin-products" className="space-y-4">
                  <div className="grid gap-4">
                    <AdminProductsTab 
                      products={adminProducts} 
                      t={t} 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="admin-subscriptions" className="space-y-4">
                  <div className="grid gap-4">
                    <AdminSubscriptionsTab 
                      subscriptions={adminSubscriptions} 
                      onEdit={(subscription: Subscription) => {
                        setSelectedSubscription(subscription)
                        setIsSubscriptionModalOpen(true)
                      }}
                      t={t} 
                    />
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <Spinner size={40} />
          </div>
        </div>
      )}
    </div>
  )
} 