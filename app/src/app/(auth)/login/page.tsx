"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Utensils, ArrowLeft } from "lucide-react"

export default function StudentLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // NEW: Real Login Function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Get values directly from the form elements
    const email = (document.getElementById("email") as HTMLInputElement).value
    const password = (document.getElementById("password") as HTMLInputElement).value

    try {
        // Call your backend API
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.error || "Login failed")
        }

        // CRITICAL: Save the token with student-specific key!
        // This prevents conflicts with admin login in other tabs
        localStorage.setItem("studentToken", data.token)
        localStorage.setItem("studentRole", data.user.role)
        localStorage.setItem("studentUser", JSON.stringify(data.user))
        
        // Clear any admin tokens to prevent confusion
        localStorage.removeItem("adminToken")
        localStorage.removeItem("token") // legacy key

        // Redirect to the Student Dashboard (Menu)
        router.push('/student-dashboard') 

    } catch (err: any) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
            <Utensils className="w-6 h-6 text-teal-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Student Login</CardTitle>
          <CardDescription>
            Enter your student email to access the canteen
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            
            {/* Error Message Display */}
            {error && <div className="p-3 bg-red-100 text-red-600 text-sm rounded">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="e.g. zulfan.abidin@student.aiu.edu.my" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-teal-600 hover:underline">Forgot password?</a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            
            <div className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <span className="text-teal-600 font-semibold cursor-pointer hover:underline" onClick={() => router.push('/register')}>
                    Register
                </span>
            </div>

            <Button variant="ghost" className="w-full" onClick={() => router.push('/')} type="button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu (Guest)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}