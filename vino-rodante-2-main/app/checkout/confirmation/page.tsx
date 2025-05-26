import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export const metadata = {
  title: "Order Confirmation | Vino Rodante",
  description: "Thank you for your order with Vino Rodante.",
}

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId: string }
}) {
  const orderId = searchParams.orderId

  if (!orderId) {
    return (
      <div className="container px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-[#5B0E2D] mb-4">Order Not Found</h1>
        <p className="mb-8">We couldn't find your order. Please check your email for confirmation details.</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container px-4 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#5B0E2D] mb-2">Thank You for Your Order!</h1>
        <p className="text-lg text-[#1F1F1F]/70">Your order has been received and is being processed.</p>
      </div>

      <div className="border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#1F1F1F]/70">Order Number</p>
            <p className="font-medium">{orderId}</p>
          </div>
          <div>
            <p className="text-sm text-[#1F1F1F]/70">Order Date</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-[#1F1F1F]/70">Shipping Method</p>
            <p className="font-medium">Standard Shipping</p>
          </div>
          <div>
            <p className="text-sm text-[#1F1F1F]/70">Payment Method</p>
            <p className="font-medium">Credit Card</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">What Happens Next?</h2>
        <ol className="space-y-4 list-decimal list-inside">
          <li className="pl-2">
            <span className="font-medium">Order Processing:</span> We're preparing your wines for shipment.
          </li>
          <li className="pl-2">
            <span className="font-medium">Shipping Confirmation:</span> You'll receive an email with tracking
            information once your order ships.
          </li>
          <li className="pl-2">
            <span className="font-medium">Delivery:</span> Your wines will be delivered to your doorstep. Please note
            that an adult signature is required.
          </li>
        </ol>
      </div>

      <div className="text-center">
        <p className="mb-4">If you have any questions about your order, please contact our customer service team.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/orders">View Your Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
