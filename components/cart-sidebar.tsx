"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { useCart } from "@/lib/hooks/use-cart"
import { formatCurrency } from "@/lib/utils"
import { useTranslations } from "@/lib/providers/translations-provider"
import { AlertCircle, CheckCircle2, ShoppingBag, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useState } from "react"

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Componente para mostrar el estado del mínimo de botellas
function MinimumBottlesAlert({ 
  totalBottles, 
  hasBoxes 
}: { 
  totalBottles: number
  hasBoxes: boolean 
}) {
  const MINIMUM_BOTTLES = 3
  
  if (hasBoxes) {
    return (
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 mb-1">
              Listo para comprar
            </h4>
            <p className="text-sm text-green-800">
              Los boxes no tienen mínimo de compra. Puedes proceder al checkout.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const progress = Math.min((totalBottles / MINIMUM_BOTTLES) * 100, 100)
  const remaining = Math.max(MINIMUM_BOTTLES - totalBottles, 0)
  const isComplete = totalBottles >= MINIMUM_BOTTLES

  if (isComplete) {
    return (
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 mb-1">
              Mínimo alcanzado
            </h4>
            <p className="text-sm text-green-800">
              Tienes {totalBottles} botella{totalBottles === 1 ? '' : 's'}. Puedes proceder al checkout.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-900 mb-1">
            Mínimo de compra requerido
          </h4>
          <p className="text-sm text-amber-800 mb-2">
            Necesitas al menos {MINIMUM_BOTTLES} botellas para compras individuales. 
            Actualmente tienes {totalBottles} botella{totalBottles === 1 ? '' : 's'}.
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-amber-900">Progreso</span>
              <span className="text-amber-700">{totalBottles}/{MINIMUM_BOTTLES}</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Necesitas {remaining} botella{remaining === 1 ? '' : 's'} más para completar tu pedido
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { cartItems, subtotal, removeFromCart, updateCartItemQuantity, clearCart } = useCart()
  const t = useTranslations()
  const { toast } = useToast()
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  // Verificar si hay boxes en el carrito
  const hasBoxes = cartItems.some(item => item.is_box || item.category === 'Boxes')
  const totalBottles = cartItems.reduce((total, item) => total + item.quantity, 0)
  const canCheckout = hasBoxes || totalBottles >= 3

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeFromCart(itemId)
    toast({
      title: "Producto eliminado",
      description: `${itemName} se eliminó del carrito`,
      duration: 3000,
    })
    setItemToRemove(null)
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "Carrito vaciado",
      description: "Todos los productos se eliminaron del carrito",
      duration: 3000,
    })
    setShowClearConfirm(false)
  }

  const handleQuantityChange = (itemId: string, newQuantity: number, itemName: string) => {
    updateCartItemQuantity(itemId, newQuantity)
    if (newQuantity > 0) {
      toast({
        title: "Cantidad actualizada",
        description: `${itemName}: ${newQuantity} unidad${newQuantity > 1 ? 'es' : ''}`,
        duration: 2000,
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>{t.cart.title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-6">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="mb-4 text-lg font-medium">{t.cart.empty}</p>
              <Button onClick={onClose} className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
                {t.cart.continueShopping}
              </Button>
            </div>
          ) : (
            <>
              {/* Información sobre mínimo de botellas - Mejorado */}
              <MinimumBottlesAlert totalBottles={totalBottles} hasBoxes={hasBoxes} />

              <ul className="divide-y">
                {cartItems.map((item) => (
                <li key={item.id} className="flex py-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium">
                        <h3>
                          <Link href={`/products/${item.slug}`} onClick={onClose}>
                            {item.name}
                          </Link>
                        </h3>
                        <p className="ml-4">{formatCurrency(item.price)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.year} • {capitalizeWords(item.region)}
                      </p>
                    </div>

                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center border rounded">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.quantity <= 1}
                          onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1), item.name)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.name)}
                        >
                          +
                        </Button>
                      </div>

                      <Button 
                        variant="ghost" 
                        className="text-[#A83935] hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setItemToRemove(item.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {t.common.remove}
                      </Button>
                    </div>
                  </div>
                </li>
                              ))}
              </ul>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="w-full">
              <div className="flex justify-between py-2 text-base font-medium">
                <p>{t.common.subtotal}</p>
                <p>{formatCurrency(subtotal)}</p>
              </div>
              <p className="text-sm text-gray-500 mb-4">{t.cart.shippingTaxes}</p>
              
              <Button 
                className={cn(
                  "w-full transition-all duration-200 font-semibold text-base",
                  canCheckout 
                    ? "bg-[#A83935] hover:bg-[#7A2521] active:bg-[#6B1F1C] text-white shadow-lg hover:shadow-xl border-2 border-[#A83935] hover:border-[#7A2521]" 
                    : "bg-gray-200 text-gray-600 cursor-not-allowed border-2 border-gray-300 opacity-70"
                )}
                size="lg" 
                asChild
                disabled={!canCheckout}
              >
                <Link 
                  href={canCheckout ? "/checkout" : "#"} 
                  onClick={(e) => {
                    if (!canCheckout) {
                      e.preventDefault()
                    } else {
                      onClose()
                    }
                  }} 
                  className="flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t.cart.checkout}
                </Link>
              </Button>
              
              {!canCheckout && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-center text-amber-800 font-medium">
                    Agrega {3 - totalBottles} botella{(3 - totalBottles) === 1 ? '' : 's'} más para continuar
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  {t.cart.continueShopping}
                </Button>
                {cartItems.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Vaciar
                  </Button>
                )}
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>

      {/* Confirmación para eliminar item */}
      {itemToRemove && (() => {
        const item = cartItems.find(i => i.id === itemToRemove)
        return item ? (
          <ConfirmDialog
            open={!!itemToRemove}
            onOpenChange={(open) => !open && setItemToRemove(null)}
            onConfirm={() => handleRemoveItem(itemToRemove, item.name)}
            title="¿Eliminar producto?"
            description={`¿Estás seguro de que quieres eliminar "${item.name}" del carrito?`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            variant="destructive"
          />
        ) : null
      })()}

      {/* Confirmación para vaciar carrito */}
      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={handleClearCart}
        title="¿Vaciar carrito?"
        description="¿Estás seguro de que quieres eliminar todos los productos del carrito? Esta acción no se puede deshacer."
        confirmText="Vaciar carrito"
        cancelText="Cancelar"
        variant="destructive"
      />
    </Sheet>
  )
}
