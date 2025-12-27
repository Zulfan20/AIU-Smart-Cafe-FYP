"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BarChart3, ArrowLeft } from "lucide-react"

export default function OwnerLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // NEW: Real Login Function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const email = (document.getElementById("email") as HTMLInputElement).value
    const password = (document.getElementById("password") as HTMLInputElement).value

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.error || "Login failed")
        }

        // Check if user is actually admin/staff
        if (data.user.role === "student") {
            setError("Access Denied: Students cannot access Owner Portal")
            return
        }

        // CRITICAL: Save the token with admin-specific key!
        // This prevents conflicts with student login in other tabs
        localStorage.setItem("adminToken", data.token)
        localStorage.setItem("adminRole", data.user.role)
        localStorage.setItem("adminUser", JSON.stringify(data.user))
        
        // Clear any student tokens to prevent confusion
        localStorage.removeItem("studentToken")
        localStorage.removeItem("token") // legacy key

        router.push('/owner-dashboard') 

    } catch (err: any) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Owner Portal</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-600 text-sm rounded">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input id="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Verifying..." : "Access Dashboard"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push('/')} type="button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}