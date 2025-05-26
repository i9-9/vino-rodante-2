"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function ContactPageContent() {
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envío de formulario
    setTimeout(() => {
      setIsSubmitting(false)
      setFormSubmitted(true)
    }, 1500)
  }

  return (
    <div className="container px-4 py-16 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-[#5B0E2D] mb-6">Contacto</h1>
      <p className="text-lg text-[#1F1F1F]/80 mb-12 max-w-3xl">
        Estamos aquí para ayudarte. Si tienes alguna pregunta sobre nuestros vinos, pedidos o si estás interesado en colaborar con nosotros, no dudes en contactarnos.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-[#5B0E2D] mb-6">Envíanos un mensaje</h2>
          
          {formSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4">
              <h3 className="text-xl font-medium text-green-800 mb-2">¡Mensaje enviado!</h3>
              <p className="text-green-700">
                Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos a la brevedad.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" name="name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input id="subject" name="subject" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  rows={5} 
                  className="min-h-[120px]" 
                  required 
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-[#A83935] hover:bg-[#A83935]/90 text-white w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar mensaje"}
              </Button>
            </form>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-[#5B0E2D] mb-6">Información de contacto</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-[#A83935] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-lg">Dirección</h3>
                <p className="text-[#1F1F1F]/70">
                  123 Calle Vino, Valle Viñedo, <br />
                  Buenos Aires, Argentina
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-[#A83935] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-lg">Teléfono</h3>
                <p className="text-[#1F1F1F]/70">+54 (11) 1234-5678</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-[#A83935] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-lg">Correo electrónico</h3>
                <p className="text-[#1F1F1F]/70">info@vinorodante.com</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <h3 className="font-medium text-lg mb-4">Horario de atención</h3>
            <p className="text-[#1F1F1F]/70 mb-2">Lunes a Viernes: 9:00 - 18:00</p>
            <p className="text-[#1F1F1F]/70">Sábado: 10:00 - 14:00</p>
          </div>
        </div>
      </div>
    </div>
  )
} 