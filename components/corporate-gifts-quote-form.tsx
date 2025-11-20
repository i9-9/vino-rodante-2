"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { sendCorporateGiftsQuoteEmail } from "@/lib/contact-actions"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface CorporateGiftsQuoteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CorporateGiftsQuoteForm({ open, onOpenChange }: CorporateGiftsQuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await sendCorporateGiftsQuoteEmail(formData)
      
      if (result.success) {
        setFormSubmitted(true)
        // Reset form usando la referencia
        if (formRef.current) {
          formRef.current.reset()
        }
        // Cerrar el dialog después de 3 segundos
        setTimeout(() => {
          setFormSubmitted(false)
          onOpenChange(false)
        }, 3000)
      } else {
        setError(result.error || 'Error al enviar la solicitud')
      }
    } catch (error) {
      console.error('Error sending corporate gifts quote:', error)
      setError('Error al enviar la solicitud. Por favor, inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      // Resetear el estado cuando se cierra
      setFormSubmitted(false)
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#5B0E2D]">
            Solicitar Cotización - Regalos Empresariales
          </DialogTitle>
          <DialogDescription>
            Complete el formulario y nos pondremos en contacto con usted a la brevedad para preparar una propuesta personalizada.
          </DialogDescription>
        </DialogHeader>

        {formSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-medium text-green-800 mb-2">¡Solicitud enviada!</h3>
            <p className="text-green-700 text-center">
              Gracias por su interés. Hemos recibido su solicitud de cotización y nos pondremos en contacto con usted a la brevedad.
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-red-800 mb-1">Error al enviar</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input id="name" name="name" required placeholder="Juan Pérez" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <Input id="company" name="company" required placeholder="Mi Empresa S.A." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input id="email" name="email" type="email" required placeholder="juan@empresa.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input id="phone" name="phone" type="tel" required placeholder="+54 9 11 1234-5678" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad aproximada</Label>
                <Input id="quantity" name="quantity" type="number" min="1" placeholder="Ej: 50" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Presupuesto estimado</Label>
                <Input id="budget" name="budget" placeholder="Ej: $500.000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate">Fecha del evento / ocasión</Label>
              <Input id="eventDate" name="eventDate" type="date" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje / Requerimientos adicionales</Label>
              <Textarea 
                id="message" 
                name="message"
                rows={4} 
                className="min-h-[100px]" 
                placeholder="Cuéntenos más sobre su necesidad: tipo de evento, preferencias de vino, personalización requerida, etc."
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                className="bg-[#5B0E2D] hover:bg-[#5B0E2D]/90 text-white flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

