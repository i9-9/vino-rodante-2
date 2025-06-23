'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useSubscriptionPlans, useUserSubscriptions, useIsAdmin } from '@/hooks/use-subscriptions';
import { formatPrice, formatDate, getSubscriptionStatusLabel, getSubscriptionStatusColor } from '@/utils/subscription-helpers';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { SubscriptionPlan, WineType } from '@/types/subscription';

interface PlanFormData {
  name: string;
  description: string;
  tagline: string;
  price_weekly: string;
  price_biweekly: string;
  price_monthly: string;
  wines_per_delivery: string;
  features: string;
}

export function SubscriptionsDashboard({ userId }: { userId: string }) {
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin();
  const { subscriptions, isLoading: isLoadingSubscriptions } = useUserSubscriptions(userId);
  const { plans, isLoading: isLoadingPlans, createPlan, updatePlan, deletePlan } = useSubscriptionPlans();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    tagline: '',
    price_weekly: '',
    price_biweekly: '',
    price_monthly: '',
    wines_per_delivery: '',
    features: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const planData = {
        name: formData.name,
        description: formData.description,
        tagline: formData.tagline,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        price_weekly: parseInt(formData.price_weekly) * 100,
        price_biweekly: parseInt(formData.price_biweekly) * 100,
        price_monthly: parseInt(formData.price_monthly) * 100,
        price_quarterly: 0, // No usado por ahora
        wines_per_delivery: parseInt(formData.wines_per_delivery),
        features: formData.features.split('\n'),
        is_active: true,
        is_visible: true,
        club: 'tinto' as WineType,
        status: 'active' as const,
        display_order: plans.length + 1,
        discount_percentage: 0,
        image: '/images/club/tinto.jpg',
        banner_image: null,
        type: 'subscription'
      };

      if (selectedPlan) {
        await updatePlan(selectedPlan.id, planData);
        toast.success('Plan actualizado correctamente');
      } else {
        await createPlan(planData);
        toast.success('Plan creado correctamente');
      }

      setIsDialogOpen(false);
      setSelectedPlan(null);
      setFormData({
        name: '',
        description: '',
        tagline: '',
        price_weekly: '',
        price_biweekly: '',
        price_monthly: '',
        wines_per_delivery: '',
        features: ''
      });

    } catch (error) {
      toast.error('Error al guardar el plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan(planId);
      toast.success('Plan eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar el plan');
    }
  };

  if (isLoadingAdmin || isLoadingSubscriptions || isLoadingPlans) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="subscriptions" className="w-full">
      <TabsList>
        <TabsTrigger value="subscriptions">Mis Suscripciones</TabsTrigger>
        {isAdmin && <TabsTrigger value="plans">Gestionar Planes</TabsTrigger>}
      </TabsList>

      <TabsContent value="subscriptions" className="space-y-4">
        {subscriptions.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No tienes suscripciones activas</p>
          </Card>
        ) : (
          subscriptions.map((subscription) => (
            <Card key={subscription.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {subscription.plan?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Próxima entrega: {formatDate(subscription.next_delivery_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getSubscriptionStatusColor(subscription.status)}`}>
                    {getSubscriptionStatusLabel(subscription.status)}
                  </p>
                  <p className="text-lg font-semibold">
                    {formatPrice(subscription.plan?.price_monthly || 0)}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </TabsContent>

      {isAdmin && (
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedPlan(null);
                setIsDialogOpen(true);
              }}
            >
              Nuevo Plan
            </Button>
          </div>

          {plans.map((plan) => (
            <Card key={plan.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setFormData({
                        name: plan.name,
                        description: plan.description,
                        tagline: plan.tagline,
                        price_weekly: (plan.price_weekly / 100).toString(),
                        price_biweekly: (plan.price_biweekly / 100).toString(),
                        price_monthly: (plan.price_monthly / 100).toString(),
                        wines_per_delivery: plan.wines_per_delivery.toString(),
                        features: plan.features.join('\n')
                      });
                      setIsDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedPlan ? 'Editar Plan' : 'Nuevo Plan'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_weekly">Precio Semanal</Label>
                    <Input
                      id="price_weekly"
                      type="number"
                      value={formData.price_weekly}
                      onChange={(e) => setFormData({ ...formData, price_weekly: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_biweekly">Precio Quincenal</Label>
                    <Input
                      id="price_biweekly"
                      type="number"
                      value={formData.price_biweekly}
                      onChange={(e) => setFormData({ ...formData, price_biweekly: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_monthly">Precio Mensual</Label>
                    <Input
                      id="price_monthly"
                      type="number"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wines_per_delivery">Vinos por Entrega</Label>
                  <Input
                    id="wines_per_delivery"
                    type="number"
                    value={formData.wines_per_delivery}
                    onChange={(e) => setFormData({ ...formData, wines_per_delivery: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Características (una por línea)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  {selectedPlan ? 'Actualizar Plan' : 'Crear Plan'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      )}
    </Tabs>
  );
} 