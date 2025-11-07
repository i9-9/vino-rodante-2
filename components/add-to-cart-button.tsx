"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/hooks/use-cart"
import type { Product } from "@/lib/types"
import { Loader2, Check, ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function AddToCartButton({ product, label }: { product: Product, label: string }) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    // Pequeño delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 200))
    
    addToCart(product)
    
    // Mostrar toast notification con animación
    toast({
      title: "¡Agregado al carrito!",
      description: `${product.name} se agregó correctamente`,
      duration: 3000,
    })
    
    // Cambiar estado del botón con animación
    setJustAdded(true)
    setIsAdding(false)
    
    // Resetear después de 2 segundos
    setTimeout(() => {
      setJustAdded(false)
    }, 2000)
  }

  return (
    <Button 
      size="lg" 
      className={cn(
        "w-full text-white transition-all duration-300 relative overflow-hidden font-semibold",
        justAdded 
          ? "bg-green-600 hover:bg-green-700 shadow-lg" 
          : "bg-[#A83935] hover:bg-[#7A2521] active:bg-[#6B1F1C] shadow-md hover:shadow-lg"
      )}
      onClick={handleAddToCart}
      disabled={isAdding || justAdded}
    >
      <span className={cn(
        "flex items-center justify-center gap-2 transition-all duration-300",
        justAdded && "animate-pulse"
      )}>
        {isAdding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Agregando...</span>
          </>
        ) : justAdded ? (
          <>
            <Check className="w-4 h-4" />
            <span>¡Agregado!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </span>
    </Button>
  )
} 