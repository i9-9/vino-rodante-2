"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

interface SubscriptionPlan {
  id: string
  name: string
  price_weekly: number
  price_biweekly: number
  price_monthly: number
  wines_per_delivery: number
  description: string
  features: string[]
  club: string
}

interface SubscriptionOption {
  id: string
  planId: string
  label: string
  price: number
  period: string
  bottles: number
  frequency: string
}

interface SubscriptionSelectorProps {
  plans: SubscriptionPlan[]
}

export default function SubscriptionSelector({ plans }: SubscriptionSelectorProps) {
  console.log('PLANS ENVIADOS AL SELECTOR:', plans)
  const [selectedOption, setSelectedOption] = useState<string>("")

  // Crear opciones basadas en los planes disponibles
  const subscriptionOptions: SubscriptionOption[] = plans.flatMap(plan => {
    const options: SubscriptionOption[] = []
    
    // Agregar opciones según las frecuencias disponibles
    if (plan.price_weekly > 0) {
      options.push({
        id: `${plan.id}-weekly`,
        planId: plan.id,
        label: `${plan.name} - Semanal`,
        price: plan.price_weekly,
        period: "cada semana",
        bottles: plan.wines_per_delivery,
        frequency: "weekly"
      })
    }
    
    if (plan.price_biweekly > 0) {
      options.push({
        id: `${plan.id}-biweekly`,
        planId: plan.id,
        label: `${plan.name} - Quincenal`,
        price: plan.price_biweekly,
        period: "cada 2 semanas",
        bottles: plan.wines_per_delivery,
        frequency: "biweekly"
      })
    }
    
    if (plan.price_monthly > 0) {
      options.push({
        id: `${plan.id}-monthly`,
        planId: plan.id,
        label: `${plan.name} - Mensual`,
        price: plan.price_monthly,
        period: "cada mes",
        bottles: plan.wines_per_delivery,
        frequency: "monthly"
      })
    }
    
    return options
  })

  // Seleccionar la primera opción por defecto
  if (selectedOption === "" && subscriptionOptions.length > 0) {
    setSelectedOption(subscriptionOptions[0].id)
  }

  const selectedSubscription = subscriptionOptions.find(option => option.id === selectedOption)

  const handleSubscribe = async () => {
    if (!selectedSubscription) return

    try {
      // Verificar autenticación
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        // Redirigir al login si no está autenticado
        window.location.href = '/auth/sign-in?redirectTo=' + encodeURIComponent(window.location.pathname)
        return
      }

      // Redirigir al checkout específico de suscripciones
      const subscriptionData = {
        planId: selectedSubscription.planId,
        frequency: selectedSubscription.frequency,
        price: selectedSubscription.price,
        bottles: selectedSubscription.bottles,
        label: selectedSubscription.label
      }

      // Guardar datos de suscripción en sessionStorage para el checkout
      sessionStorage.setItem('subscriptionData', JSON.stringify(subscriptionData))
      
      // Redirigir al checkout de suscripciones
      window.location.href = '/checkout/subscription'

    } catch (error) {
      console.error('Error al suscribirse:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Precio destacado */}
      <div className="text-center">
        <div className="text-3xl font-bold text-primary mb-2">
          {formatCurrency(selectedSubscription?.price || 0)}
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedSubscription?.period}
        </div>
        {selectedSubscription?.bottles && (
          <div className="text-sm text-muted-foreground">
            {selectedSubscription.bottles} botellas por entrega
          </div>
        )}
      </div>

      {/* Selector de opciones */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Elige tu plan:</Label>
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          {subscriptionOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.period} • {option.bottles} botellas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(option.price)}</div>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Botón de suscripción */}
      <Button 
        size="lg" 
        className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white"
        onClick={handleSubscribe}
        data-subscribe-button
      >
        Suscribirse - {formatCurrency(selectedSubscription?.price || 0)}
      </Button>

      {/* Información adicional - solo beneficios únicos */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>✓ Cancela cuando quieras</p>
        <p>✓ Selección curada por sommeliers</p>
      </div>
    </div>
  )
} 