"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch" // You might need to install this component
import { Separator } from "@/components/ui/separator" // You might need to install this component
import { Clock, Power, Save } from "lucide-react"

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)
    // TODO: Call PUT /api/admin/settings
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Store Settings</h2>
        <p className="text-gray-500 mt-1">Manage your café's operating status and configuration.</p>
      </div>

      {/* 1. Master Switch */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl">Café Status</CardTitle>
            <CardDescription>Turn the entire ordering system ON or OFF.</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
             <div className={`px-3 py-1 rounded-full text-xs font-bold ${isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {isOpen ? 'OPEN' : 'CLOSED'}
             </div>
             {/* Note: If Switch component is missing, use a simple button toggle for now */}
             <Button 
                variant={isOpen ? "default" : "destructive"} 
                size="sm" 
                onClick={() => setIsOpen(!isOpen)}
                className={isOpen ? "bg-emerald-600 hover:bg-emerald-700" : ""}
             >
                <Power className="w-4 h-4 mr-2" />
                {isOpen ? 'Close Café' : 'Open Café'}
             </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 2. Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>Set the standard opening and closing times for the café.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="open-time">Opening Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="open-time" type="time" defaultValue="08:00" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="close-time">Closing Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="close-time" type="time" defaultValue="17:00" className="pl-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Order Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Order Rules</CardTitle>
          <CardDescription>Configure constraints for student orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cutoff">Lunch Pre-Order Cutoff Time</Label>
              <Input id="cutoff" type="time" defaultValue="11:30" className="w-full md:w-1/3" />
              <p className="text-xs text-gray-500">Orders placed after this time cannot be pre-ordered for lunch.</p>
            </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t px-6 py-4">
            <Button onClick={handleSave} disabled={loading} className="ml-auto bg-teal-600 hover:bg-teal-700">
                {loading ? (
                    "Saving..."
                ) : (
                    <>
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
