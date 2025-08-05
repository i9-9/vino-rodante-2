"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from "@/lib/providers/translations-provider"

interface OrderDetails {
  id: string
  status: string
  total: number
  created_at: string
  user_id: string
}

function PendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      } catch (error) {
        console.error("Error:", error)
        setError("Error inesperado")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, supabase])

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
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">
              Pago en proceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Tu pago está siendo procesado. Esto puede tardar hasta 24 horas en confirmarse.
                Te enviaremos un email cuando el pago se confirme.
              </p>
              
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Número de orden</p>
                    <p className="text-gray-600">{orderDetails.id}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Estado</p>
                    <p className="text-gray-600 capitalize">{orderDetails.status}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Fecha</p>
                    <p className="text-gray-600">
                      {new Date(orderDetails.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Total</p>
                    <p className="text-gray-600">${orderDetails.total.toLocaleString('es-AR')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    ¿Qué pasa ahora?
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• MercadoPago está procesando tu pago</li>
                    <li>• Recibirás una confirmación por email</li>
                    <li>• Puedes verificar el estado en tu cuenta</li>
                    <li>• Si tienes problemas, contáctanos</li>
                  </ul>
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

            <div className="text-center text-sm text-gray-500">
              <p>
                ¿Tienes preguntas? Contáctanos en{" "}
                <a href="mailto:soporte@vinorodante.com" className="underline">
                  soporte@vinorodante.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PendingPage() {
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
      <PendingContent />
    </Suspense>
  )
} 