'use client'

import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, Menu, X } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { toast } from 'sonner'

import { useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import type { Profile } from '@/lib/types'
import type { Address } from './types'
import type { Translations } from '@/lib/i18n/types'

// Import tab components
import { ProfileTab } from './components/ProfileTab'
import { AddressesTab } from './components/AddressesTab'
import SmartLoader from './components/SmartLoader'
import { SubscriptionsTabSkeleton } from './components/SubscriptionsTabSkeleton'
import { AdminSubscriptionsSkeleton } from './components/AdminSkeleton'

// Import components directly with skeletons for better UX
import OrdersTabLazy from './components/OrdersTabLazy'
import { SubscriptionsTab } from './components/SubscriptionsTab'
import AdminOrdersTabLazy from './admin-orders-tab-lazy'
import AdminProductsTabLazy from './admin-products-tab-lazy'
import { AdminSubscriptionsTab } from './admin-subscriptions-tab'
import AdminPlansTabLazy from './admin-plans-tab-lazy'

interface AccountClientProps {
  user: User
  profile: Profile
  addresses: Address[]
  userRole: 'admin' | 'user'
  t: Translations
}

// Placeholder data - en una implementación real vendría del servidor
import type { UserSubscription, SubscriptionPlan } from './types'

const mockSubscriptions: UserSubscription[] = []
const mockAvailablePlans: SubscriptionPlan[] = []




export default function AccountClientNew({
  user,
  profile,
  addresses,
  userRole,
  t
}: AccountClientProps) {
  const [isLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const result = await signOut()
    if (result?.error) {
      toast.error(t.errors.signOutError)
    }
  }

  // Define tabs array for easier management
  const tabs = [
    { value: 'profile', label: t.account.profile },
    { value: 'orders', label: t.account.orders },
    { value: 'addresses', label: t.account.addresses },
    { value: 'subscriptions', label: t.account.subscriptions },
    ...(userRole === 'admin' ? [
      { value: 'admin-orders', label: t.account.adminOrders },
      { value: 'admin-products', label: t.account.adminProducts },
      { value: 'admin-subscriptions', label: t.account.adminSubscriptions },
      { value: 'admin-plans', label: t.account.adminPlans },
    ] : [])
  ]

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setIsMobileMenuOpen(false)
  }

  const currentTabLabel = tabs.find(tab => tab.value === activeTab)?.label || ''

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[2000px] px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t.account.title}</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t.account.subtitle}
              </p>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start sm:self-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t.common.signOut}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 flex flex-col flex-1">
            {/* Mobile Tab Selector */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-full justify-between"
              >
                <span>{currentTabLabel}</span>
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
              
              {isMobileMenuOpen && (
                <Card className="mt-2 p-2 border shadow-lg">
                  <div className="grid gap-1">
                    {tabs.map((tab) => (
                      <Button
                        key={tab.value}
                        variant={activeTab === tab.value ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleTabChange(tab.value)}
                        className="justify-start"
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Desktop Tabs - Responsive Grid */}
            <div className="hidden sm:block">
              <Card className="p-1">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:flex lg:justify-start gap-1">
                  {tabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value}
                      className="text-xs sm:text-sm lg:flex-none lg:px-4"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Card>
            </div>

            {/* Tab Contents */}
            <div className="mt-4 sm:mt-6 flex-1 flex flex-col">
              <TabsContent value="profile" className="space-y-4 m-0">
                <ProfileTab user={user} profile={profile} t={t} />
              </TabsContent>

              <TabsContent value="orders" className="space-y-4 m-0">
                <OrdersTabLazy userId={user.id} t={t} />
              </TabsContent>

              <TabsContent value="addresses" className="space-y-4 m-0">
                <AddressesTab addresses={addresses} userId={user.id} t={t} />
              </TabsContent>

              <TabsContent value="subscriptions" className="space-y-4 m-0">
                <SmartLoader skeleton={<SubscriptionsTabSkeleton />}>
                  <SubscriptionsTab subscriptions={mockSubscriptions} availablePlans={mockAvailablePlans} t={t} />
                </SmartLoader>
              </TabsContent>

              {userRole === 'admin' && (
                <>
                  <TabsContent value="admin-orders" className="space-y-4 m-0">
                    <AdminOrdersTabLazy t={t} />
                  </TabsContent>

                  <TabsContent value="admin-products" className="space-y-4 m-0">
                    <AdminProductsTabLazy t={t} />
                  </TabsContent>

                  <TabsContent value="admin-subscriptions" className="space-y-4 m-0">
                    <SmartLoader skeleton={<AdminSubscriptionsSkeleton />}>
                      <AdminSubscriptionsTab t={t} />
                    </SmartLoader>
                  </TabsContent>

                  <TabsContent value="admin-plans" className="space-y-4 m-0">
                    <AdminPlansTabLazy t={t} />
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <Spinner size={40} />
          </div>
        </div>
      )}
    </div>
  )
} 