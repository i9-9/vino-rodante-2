"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SubscriptionOption {
  id: string
  label: string
  price: number
  period: string
  savings?: string
}

interface SubscriptionSelectorProps {
  plan: {
    id: string
    name: string
    price_monthly: number
    price_bimonthly: number
    price_quarterly: number
  }
}

export default function SubscriptionSelector({ plan }: SubscriptionSelectorProps) {
  const [selectedOption, setSelectedOption] = useState("monthly")

  // Calcular ahorros
  const monthlyPrice = plan.price_monthly
  const bimonthlyMonthlyPrice = plan.price_bimonthly / 2
  const quarterlyMonthlyPrice = plan.price_quarterly / 3

  const bimonthlySavings = Math.round(((monthlyPrice - bimonthlyMonthlyPrice) / monthlyPrice) * 100)
  const quarterlySavings = Math.round(((monthlyPrice - quarterlyMonthlyPrice) / monthlyPrice) * 100)

  const subscriptionOptions: SubscriptionOption[] = [
    {
      id: "monthly",
      label: "Cada mes",
      price: plan.price_monthly,
      period: "cada mes"
    },
    {
      id: "bimonthly",
      label: "Cada dos meses",
      price: plan.price_bimonthly,
      period: "cada 2 meses",
      savings: bimonthlySavings > 0 ? `Ahorrás ${bimonthlySavings}%` : undefined
    },
    {
      id: "quarterly",
      label: "Cada tres meses",
      price: plan.price_quarterly,
      period: "cada 3 meses",
      savings: quarterlySavings > 0 ? `Ahorrás ${quarterlySavings}%` : undefined
    }
  ]

  const selectedSubscription = subscriptionOptions.find(option => option.id === selectedOption)

  const handleSubscribe = () => {
    // Aquí puedes agregar la lógica para procesar la suscripción
    console.log("Suscribirse a:", {
      planId: plan.id,
      planName: plan.name,
      subscriptionType: selectedOption,
      price: selectedSubscription?.price
    })
    
    // Por ahora, solo mostramos un alert
    alert(`¡Próximamente! Suscripción ${selectedSubscription?.label} a ${plan.name} por ${formatCurrency(selectedSubscription?.price || 0)}`)
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
        {selectedSubscription?.savings && (
          <Badge variant="secondary" className="mt-2">
            {selectedSubscription.savings}
          </Badge>
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
                    <div className="text-sm text-muted-foreground">{option.period}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(option.price)}</div>
                    {option.savings && (
                      <div className="text-xs text-green-600 font-medium">{option.savings}</div>
                    )}
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
      >
        Suscribirse - {formatCurrency(selectedSubscription?.price || 0)}
      </Button>

      {/* Información adicional */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>✓ Cancela cuando quieras</p>
        <p>✓ Envío gratis en CABA y GBA</p>
        <p>✓ Selección curada por sommeliers</p>
      </div>
    </div>
  )
} 