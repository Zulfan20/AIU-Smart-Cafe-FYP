"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Power, Save } from "lucide-react"
// import { toast } from "sonner" 

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // State matches your DB schema (Removed orderCutoffTime)
  const [settings, setSettings] = useState({
    isCafeOpen: true,
    operatingHours: { start: "08:00", end: "17:00" }
  })

  // 1. Fetch Real Settings on Load
  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            const data = await res.json()
            if (res.ok) {
                setSettings({
                    isCafeOpen: data.isCafeOpen,
                    // Removed orderCutoffTime from here
                    operatingHours: data.operatingHours || { start: "08:00", end: "17:00" }
                })
            }
        } catch (error) {
            console.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }
    fetchSettings()
  }, [])

  // 2. Save Changes
  const handleSave = async () => {
    setSaving(true)
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token") // fallback for legacy

    try {
        const res = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(settings)
        })

        const data = await res.json()

        if (!res.ok) {
            console.error('Settings save error:', data)
            throw new Error(data.error || "Failed to save")
        }
        
        alert("Settings saved successfully!")

    } catch (error: any) {
        console.error('Save settings error:', error)
        alert(`Error saving settings: ${error.message}`)
    } finally {
        setSaving(false)
    }
  }

  // Toggle Handler with auto-save
  const toggleCafe = async () => {
    const newStatus = !settings.isCafeOpen
    setSettings(prev => ({ ...prev, isCafeOpen: newStatus }))
    
    // Auto-save the new status immediately
    setSaving(true)
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...settings, isCafeOpen: newStatus })
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Toggle cafe error:', data)
        throw new Error(data.error || "Failed to update cafe status")
      }
      
      alert(`Café ${newStatus ? 'opened' : 'closed'} successfully!`)
    } catch (error: any) {
      console.error('Toggle cafe error:', error)
      alert(`Error updating cafe status: ${error.message}`)
      // Revert the change if save failed
      setSettings(prev => ({ ...prev, isCafeOpen: !newStatus }))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Store Settings</h2>
        <p className="text-gray-500 mt-1">Manage your café's operating status and configuration.</p>
      </div>

      {/* 1. Master Switch */}
      <Card className={`border-l-4 ${settings.isCafeOpen ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl">Café Status</CardTitle>
            <CardDescription>Turn the entire ordering system ON or OFF.</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
             <div className={`px-3 py-1 rounded-full text-xs font-bold ${settings.isCafeOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {settings.isCafeOpen ? 'OPEN' : 'CLOSED'}
             </div>
             <Button 
                variant={settings.isCafeOpen ? "default" : "destructive"} 
                size="sm" 
                onClick={toggleCafe}
                className={settings.isCafeOpen ? "bg-emerald-600 hover:bg-emerald-700" : ""}
             >
                <Power className="w-4 h-4 mr-2" />
                {settings.isCafeOpen ? 'Close Café' : 'Open Café'}
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
              <Label>Opening Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                    type="time" 
                    value={settings.operatingHours.start}
                    onChange={(e) => setSettings({...settings, operatingHours: {...settings.operatingHours, start: e.target.value}})}
                    className="pl-10" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Closing Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                    type="time" 
                    value={settings.operatingHours.end}
                    onChange={(e) => setSettings({...settings, operatingHours: {...settings.operatingHours, end: e.target.value}})}
                    className="pl-10" 
                />
              </div>
            </div>
          </div>
        </CardContent>
        {/* Moved Save Button Here */}
        <CardFooter className="bg-gray-50 border-t px-6 py-4">
            <Button onClick={handleSave} disabled={saving} className="ml-auto bg-teal-600 hover:bg-teal-700">
                {saving ? (
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