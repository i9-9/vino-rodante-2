"use client"

import { X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { useCart } from "@/lib/hooks/use-cart"
import { formatCurrency } from "@/lib/utils"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function CartSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { cartItems, subtotal, removeFromCart, updateCartItemQuantity } = useCart()
  const t = useTranslations()

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
                        {item.year} • {item.region}
                      </p>
                    </div>

                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center border rounded">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.quantity <= 1}
                          onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>

                      <Button 
                        variant="ghost" 
                        className="text-[#A83935]"
                        onClick={() => removeFromCart(item.id)}
                      >
                        {t.common.remove}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
              <Button className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white" size="lg" asChild>
                <Link href="/checkout" onClick={onClose}>
                  {t.cart.checkout}
                </Link>
              </Button>
              <Button variant="outline" className="mt-2 w-full" onClick={onClose}>
                {t.cart.continueShopping}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
