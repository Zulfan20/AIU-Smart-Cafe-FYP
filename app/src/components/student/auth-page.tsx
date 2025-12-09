"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

interface AuthPageProps {
  onAuth: (userType: "student" | "owner") => void
  onBack: () => void
}

export function AuthPage({ onAuth, onBack }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [accountType, setAccountType] = useState<"student" | "owner">("student")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTimeout(() => {
      onAuth(accountType)
    }, 1000)
  }

  return (
    <div className="min-h-screen relative flex items-start justify-center p-4 pt-12 pb-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/university-canteen-background.jpg")',
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="absolute top-4 left-4 z-20 text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </Button>

      {/* Content */}
      <div className="relative w-full max-w-md z-10">
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold">
              {isSignUp
                ? accountType === "student"
                  ? "Student Sign Up"
                  : "Café Owner Sign Up"
                : accountType === "student"
                  ? "Student Sign In"
                  : "Café Owner Sign In"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isSignUp ? "Sign Up to continue to AIU Smart Café." : "Sign in to continue to AIU Smart Café."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullname" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input id="fullname" type="text" placeholder="e.g. Aisha binti Ahmad" className="h-11" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentid" className="text-sm font-medium text-gray-700">
                      Student ID
                    </Label>
                    <Input id="studentid" type="text" placeholder="e.g. 202312345" className="h-11" required />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {isSignUp ? "AIU Student Email" : accountType === "student" ? "Student Email" : "Owner Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={accountType === "student" ? "yourID@student.aiu.edu.my" : "owner@aiu.edu.my"}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                    className="pr-10 h-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {isSignUp && (
                <p className="text-xs text-gray-500 text-center">
                  By registering, you agree to use your account responsibly and keep your login details secure.
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium text-base mt-4"
                size="lg"
              >
                {isSignUp ? "Create account" : `Sign In as ${accountType === "student" ? "Student" : "Owner"}`}
              </Button>
            </form>

            <div className="mt-3 text-center text-sm">
              <span className="text-gray-600">
                {isSignUp ? "Already have an account?" : "Don't have an account yet?"}
              </span>{" "}
              <Button
                variant="link"
                size="sm"
                className="px-1 font-semibold text-teal-600 hover:text-teal-700"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp
                  ? `Log in as ${accountType === "student" ? "Student" : "Owner"}`
                  : `Register as a new ${accountType === "student" ? "student" : "owner"}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm z-10">
        Albukhary International University - School of Computing and Informatics
      </div>
    </div>
  )
}
