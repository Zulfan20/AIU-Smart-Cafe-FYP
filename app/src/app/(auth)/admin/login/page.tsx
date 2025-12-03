"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BarChart3, ArrowLeft } from "lucide-react"

export default function OwnerLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate login for now
    setTimeout(() => {
        setLoading(false)
        router.push('/owner-dashboard') // Redirect to the dashboard
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      {/* Dark background for Admin Login to distinguish it */}
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Owner Portal</CardTitle>
          <CardDescription>
            Secure access for café management
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input id="email" type="email" placeholder="admin@aiu.edu.my" required />
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