"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, RefreshCcw } from "lucide-react"

// Define the shape of our Order data (matching your Mongoose Model)
interface OrderItem {
  name: string
  quantity: number
}

interface Order {
  _id: string
  userId: {
    name: string
    email: string
  }
  items: OrderItem[]
  totalAmount: number
  status: string
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Function to fetch orders from your API
  const fetchOrders = async () => {
    setLoading(true)
    try {
      // retrieves token from localStorage (saved during login)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") // fallback for legacy
      
      const res = await fetch("/api/admin/orders", {
        headers: {
          "Authorization": `Bearer ${token}` // Send the token!
        }
      })

      if (!res.ok) throw new Error("Failed to fetch orders")

      const data = await res.json()
      setOrders(data)
    } catch (err) {
      setError("Error loading orders. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchOrders()
  }, [])

  // Function to update status (Accept/Reject)
  const updateStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token") // fallback for legacy
    try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        })

        if (res.ok) {
            // Refresh list after update
            fetchOrders() 
        }
    } catch (err) {
        console.error("Failed to update status", err)
    }
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Live Orders</h2>
            <p className="text-gray-500 mt-1">Manage incoming orders from students.</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      <div className="grid gap-4">
        {orders.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500">No active orders found.</div>
        )}

        {orders.map((order) => (
          <Card key={order._id} className="border-l-4 border-l-yellow-400 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                
                {/* Order Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-gray-900">Order #{order._id.slice(-4)}</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {order.status}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold">{order.userId?.name || "Unknown User"}</span> 
                    <span className="text-gray-400 mx-2">•</span> 
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                  </div>
                  
                  <p className="text-sm font-bold text-emerald-600 mt-1">
                    Total: RM {(order.totalAmount / 100).toFixed(2)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => updateStatus(order._id, 'Rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => updateStatus(order._id, 'Preparing')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                   <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateStatus(order._id, 'Ready')}
                  >
                    Mark Ready
                  </Button>
                   <Button 
                    variant="outline"
                    onClick={() => updateStatus(order._id, 'Completed')}
                  >
                    Complete
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}