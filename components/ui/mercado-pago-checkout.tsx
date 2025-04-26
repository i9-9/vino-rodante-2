"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/providers/translations-provider"
import { Loader2 } from "lucide-react"
import Script from "next/script"

interface MercadoPagoCheckoutProps {
  preferenceId: string
  onPaymentSuccess: () => void
  onPaymentError: (error: string) => void
}

export function MercadoPagoCheckout({ preferenceId, onPaymentSuccess, onPaymentError }: MercadoPagoCheckoutProps) {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(true)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    if (isScriptLoaded && preferenceId) {
      setIsLoading(false)
    }
  }, [isScriptLoaded, preferenceId])

  const handleScriptLoad = () => {
    setIsScriptLoaded(true)
  }

  const handlePayment = () => {
    if (!window.MercadoPago) {
      onPaymentError("Error al cargar Mercado Pago")
      return
    }

    const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!, {
      locale: "es-AR",
    })

    mp.checkout({
      preference: {
        id: preferenceId,
      },
      render: {
        container: ".mercadopago-button-container",
        label: "Pagar con Mercado Pago",
      },
      callbacks: {
        onError: (error: any) => {
          console.error("Mercado Pago error:", error)
          onPaymentError("Error al procesar el pago")
        },
        onSubmit: () => {
          setIsLoading(true)
        },
      },
    })
  }

  return (
    <div>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={handleScriptLoad}
        onReady={handlePayment}
        strategy="lazyOnload"
      />

      {isLoading ? (
        <Button disabled className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t.common.loading}
        </Button>
      ) : (
        <div className="mercadopago-button-container"></div>
      )}
    </div>
  )
}
