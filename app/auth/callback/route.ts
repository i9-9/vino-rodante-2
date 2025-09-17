import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const returnTo = requestUrl.searchParams.get("return_to")
  const next = returnTo || "/account"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user after successful authentication
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if customer record exists, if not create it
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", user.email)
          .single()

        if (!existingCustomer) {
          // Create customer record for OAuth users
          const { error: customerError } = await supabase
            .from("customers")
            .insert({
              email: user.email!,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
              phone: user.user_metadata?.phone || null,
            })

          if (customerError) {
            console.error("Error creating customer record:", customerError)
            // Continue anyway, user is authenticated
          }
        }
      }
      
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL("/auth/auth-code-error", requestUrl.origin))
} 