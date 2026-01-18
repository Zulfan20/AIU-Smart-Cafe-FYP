"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Utensils, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Get values
    const name = (document.getElementById("name") as HTMLInputElement).value
    const email = (document.getElementById("email") as HTMLInputElement).value
    const password = (document.getElementById("password") as HTMLInputElement).value
    const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement).value

    // Basic Validation
    if (password !== confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
    }

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.error || "Registration failed")
        }

        // Success! Show pending approval message
        alert(data.message || "Registration successful! Your account is pending approval.")
        router.push('/login')

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
          <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription>
            Join AIU Smart Café to order food
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            
            {error && <div className="p-3 bg-red-100 text-red-600 text-sm rounded">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="e.g. Zulfan Abidin" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Student Email</Label>
              <Input id="email" type="email" placeholder="e.g. zulfan.abidin@student.aiu.edu.my" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" required />
            </div>

          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
            
            <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <span className="text-teal-600 font-semibold cursor-pointer hover:underline" onClick={() => router.push('/login')}>
                    Login
                </span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}