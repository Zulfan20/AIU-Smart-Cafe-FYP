"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  ShoppingBag, 
  Users, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  DollarSign
} from "lucide-react"

export default function DashboardPage() {
  // Mock Data
  const [stats] = useState([
    { 
      title: "Total Revenue", 
      value: "RM 1,847", 
      subtext: "+20.1% from last month",
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-emerald-100" 
    },
    { 
      title: "Active Orders", 
      value: "12", 
      subtext: "+2 since last hour",
      icon: ShoppingBag, 
      color: "text-blue-600", 
      bg: "bg-blue-100" 
    },
    { 
      title: "Customers", 
      value: "89", 
      subtext: "+4 new today",
      icon: Users, 
      color: "text-violet-600", 
      bg: "bg-violet-100" 
    },
    { 
      title: "Avg. Prep Time", 
      value: "12m", 
      subtext: "-2m improvement",
      icon: Clock, 
      color: "text-amber-600", 
      bg: "bg-amber-100" 
    },
  ])

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 mt-1">Welcome back, Admin. Here is what is happening today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-600">System Online</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                {stat.subtext.includes('+') ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                )}
                <span className={stat.subtext.includes('+') ? "text-emerald-600 font-medium" : "text-gray-500"}>
                  {stat.subtext}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Placeholder for a Chart */}
            <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Revenue Chart Component</p>
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <p className="text-sm text-gray-500">You made 12 sales this hour.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                            AS
                        </div>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">Ali Student</p>
                            <p className="text-xs text-muted-foreground">ali@student.aiu.edu.my</p>
                        </div>
                        <div className="ml-auto font-medium text-sm">+RM 12.00</div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}