"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/providers/auth-provider"
import { supabase } from "@/lib/supabase"

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoading, signOut } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/sign-in")
    } else if (user) {
      // Fetch user profile data
      const fetchProfile = async () => {
        const { data, error } = await supabase.from("customers").select("*").eq("id", user.id).single()

        if (data) {
          setName(data.name)
          setEmail(user.email || "")
        }
      }

      fetchProfile()
    }
  }, [user, isLoading, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateMessage(null)

    try {
      const { error } = await supabase.from("customers").update({ name }).eq("id", user?.id)

      if (error) {
        setUpdateMessage({ type: "error", text: error.message })
      } else {
        setUpdateMessage({ type: "success", text: "Profile updated successfully" })
      }
    } catch (error) {
      setUpdateMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-[#A83935] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-[#5B0E2D] mb-8">My Account</h1>

      <Tabs defaultValue="profile" className="max-w-4xl">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {updateMessage && (
                  <div
                    className={`p-4 rounded-md ${
                      updateMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {updateMessage.text}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled className="bg-gray-100" />
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div className="flex justify-between">
                  <Button type="submit" className="bg-[#A83935] hover:bg-[#A83935]/90 text-white" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">You haven't placed any orders yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>Manage your shipping addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">You don't have any saved addresses yet.</p>
              <Button className="mt-4 bg-[#A83935] hover:bg-[#A83935]/90 text-white">Add New Address</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
