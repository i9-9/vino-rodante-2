"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from "@/lib/providers/translations-provider"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/lib/hooks/use-cart"

interface OrderDetails {
  id: string
  status: string
  total: number
  created_at: string
  user_id: string
}

function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartCleared, setCartCleared] = useState(false)
  const supabase = createClient()

  const orderId = searchParams.get("orderId")

  useEffect(() => {
    if (!orderId) {
      setError("No se proporcionó ID de orden")
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single()

        if (orderError) {
          console.error("Error fetching order:", orderError)
          setError("Error al cargar los detalles de la orden")
          setLoading(false)
          return
        }

        setOrderDetails(order)
        
        // Clear cart when order is confirmed (paid or pending)
        if (order && (order.status === 'paid' || order.status === 'pending') && !cartCleared) {
          console.log("Clearing cart after successful order confirmation")
          clearCart()
          setCartCleared(true)
        }
      } catch (error) {
        console.error("Error:", error)
        setError("Error inesperado")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, supabase, clearCart, cartCleared])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case "pending":
        return <Clock className="h-8 w-8 text-yellow-600" />
      case "cancelled":
      case "refunded":
        return <AlertCircle className="h-8 w-8 text-red-600" />
      default:
        return <Clock className="h-8 w-8 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "¡Pago confirmado!"
      case "pending":
        return "Pago en proceso"
      case "cancelled":
        return "Pago cancelado"
      case "refunded":
        return "Pago reembolsado"
      default:
        return "Estado desconocido"
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "paid":
        return "Tu pedido ha sido confirmado y está siendo preparado. Recibirás un email con los detalles de envío."
      case "pending":
        return "Tu pago está siendo procesado. Te notificaremos cuando se confirme."
      case "cancelled":
        return "El pago fue cancelado. Puedes intentar nuevamente o contactarnos si tienes problemas."
      case "refunded":
        return "El pago fue reembolsado. Si tienes preguntas, contáctanos."
      default:
        return "Estado del pedido desconocido."
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !orderDetails) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Orden no encontrada"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "No se pudo encontrar la orden solicitada."}
          </p>
          <div className="space-x-4">
            <Button onClick={() => router.push("/products")}>
              Continuar comprando
            </Button>
            <Button variant="outline" onClick={() => router.push("/account")}>
              Ver mis pedidos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon(orderDetails.status)}
            </div>
            <CardTitle className="text-2xl">
              {getStatusText(orderDetails.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {getStatusDescription(orderDetails.status)}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Número de orden</p>
                    <p className="text-gray-600">{orderDetails.id}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Total</p>
                    <p className="text-gray-600">{formatCurrency(orderDetails.total)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Fecha</p>
                    <p className="text-gray-600">
                      {new Date(orderDetails.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Estado</p>
                    <p className="text-gray-600 capitalize">{orderDetails.status}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push("/products")}
                className="bg-[#A83935] hover:bg-[#A83935]/90"
              >
                Continuar comprando
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/account")}
              >
                Ver mis pedidos
              </Button>
            </div>

            {orderDetails.status === "pending" && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Pago en proceso
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Los pagos pueden tardar hasta 24 horas en confirmarse. 
                      Te enviaremos un email cuando el pago se confirme.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {orderDetails.status === "cancelled" && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Pago cancelado
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Si tienes problemas con el pago, contáctanos en 
                      <a href="mailto:soporte@vinorodante.com" className="underline ml-1">
                        soporte@vinorodante.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
