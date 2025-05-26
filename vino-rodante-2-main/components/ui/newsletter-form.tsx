"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslations } from "@/lib/providers/translations-provider"
import { subscribeToNewsletter } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

export function NewsletterForm({ className }: { className?: string }) {
  const t = useTranslations()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await subscribeToNewsletter(email)

      if (result.success) {
        toast({
          title: t.common.success,
          description: t.newsletter.success,
          variant: "default",
        })
        setEmail("")
      } else {
        toast({
          title: t.common.error,
          description: result.error || t.newsletter.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.newsletter.error,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder={t.newsletter.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-primary-foreground text-primary h-12 rounded-md"
        />
        <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 rounded-md px-6">
          {isLoading ? t.common.loading : t.newsletter.button}
        </Button>
      </div>
    </form>
  )
}
