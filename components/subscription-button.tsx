'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import type { SubscriptionPlan, SubscriptionFrequency } from '@/types/subscription';
import { 
  formatPrice, 
  getFrequencyLabel, 
  calculateSubscriptionPrice,
  calculateDiscountPercentage 
} from '@/utils/subscription-helpers';

interface SubscriptionButtonProps {
  plan: SubscriptionPlan;
  className?: string;
}

export function SubscriptionButton({ plan, className }: SubscriptionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      
      // Preparar datos de suscripción
      const subscriptionData = {
        planId: plan.id,
        frequency,
        price: calculateSubscriptionPrice(plan, frequency),
        bottles: plan.wines_per_delivery,
        label: `${plan.name} - ${frequency}`
      }

      // Guardar datos de suscripción en sessionStorage para el checkout
      sessionStorage.setItem('subscriptionData', JSON.stringify(subscriptionData))
      
      // Redirigir al checkout de suscripciones (funciona tanto para usuarios autenticados como invitados)
      router.push('/checkout/subscription');

    } catch (error) {
      console.error('Error al suscribirse:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar la suscripción');
    } finally {
      setIsLoading(false);
    }
  };

  const price = calculateSubscriptionPrice(plan, frequency);
  const discount = calculateDiscountPercentage(plan, frequency);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`${className} bg-[#A83935] hover:bg-[#8B2D2A] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200`}
        size="lg"
      >
        Suscribirse
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Selecciona tu frecuencia de entrega</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <RadioGroup
              value={frequency}
              onValueChange={(value) => setFrequency(value as SubscriptionFrequency)}
              className="grid gap-4"
            >
              {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => {
                const freqPrice = calculateSubscriptionPrice(plan, freq);
                const freqDiscount = calculateDiscountPercentage(plan, freq);
                
                return (
                  <div
                    key={freq}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      frequency === freq ? 'border-red-600 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={freq} id={freq} />
                      <Label htmlFor={freq} className="font-medium">
                        {getFrequencyLabel(freq)}
                      </Label>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(freqPrice)}</div>
                      {freqDiscount > 0 && (
                        <div className="text-sm text-green-600">
                          {freqDiscount}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Vinos por entrega</span>
                <span>{plan.wines_per_delivery}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total por entrega</span>
                <span>{formatPrice(price)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Ahorro</span>
                  <span>{discount}% OFF</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubscribe}
              className="w-full mt-4 bg-[#A83935] hover:bg-[#8B2D2A] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Confirmar suscripción'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 