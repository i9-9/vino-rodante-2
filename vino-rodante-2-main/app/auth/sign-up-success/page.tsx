import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccess() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 px-4 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="text-3xl font-bold text-[#5B0E2D]">Registration Successful!</h1>
        <p className="text-gray-600">
          Thank you for creating an account with Vino Rodante. Please check your email to verify your account.
        </p>
        <div className="pt-4">
          <Button asChild className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
