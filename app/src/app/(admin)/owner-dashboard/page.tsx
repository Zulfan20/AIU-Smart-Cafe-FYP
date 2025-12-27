"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  ShoppingBag, 
  Users, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  DollarSign,
  Trophy,
  Calendar
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TopSellingItem {
  name: string
  totalSold: number
  revenue: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalCustomers: 0,
  })
  const [cafeStatus, setCafeStatus] = useState({
    isCafeOpen: true,
    operatingHours: { start: "08:00", end: "22:00" }
  })
  const [revenueData, setRevenueData] = useState<{date: string, revenue: number}[]>([])
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter states for revenue chart
  const [revenueTimeRange, setRevenueTimeRange] = useState<'week' | 'month'>('week')
  const [revenueSelectedMonth, setRevenueSelectedMonth] = useState(new Date().getMonth().toString())
  const [revenueSelectedYear, setRevenueSelectedYear] = useState(new Date().getFullYear().toString())
  
  // Filter states for top selling items
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    loadDashboardData()
    loadCafeStatus()
    
    // Refresh cafe status every 5 seconds to catch changes from settings page
    const interval = setInterval(() => {
      loadCafeStatus()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  // Reload revenue data when filters change
  useEffect(() => {
    loadRevenueData()
  }, [revenueTimeRange, revenueSelectedMonth, revenueSelectedYear])

  // Reload top selling items when filters change
  useEffect(() => {
    loadTopSellingItems()
  }, [timeRange, selectedMonth, selectedYear])

  const loadCafeStatus = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const settings = await response.json()
        setCafeStatus({
          isCafeOpen: settings.isCafeOpen,
          operatingHours: settings.operatingHours
        })
      }
    } catch (error) {
      console.error('Failed to load cafe status:', error)
    }
  }

  const loadTopSellingItems = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}

      const ordersRes = await fetch('/api/admin/orders', { headers })
      if (ordersRes.ok) {
        const orders: any[] = await ordersRes.json()
        
        // Filter orders based on time range and selected date
        const now = new Date()
        let startDate: Date
        
        if (timeRange === 'week') {
          // Last 7 days from today
          startDate = new Date()
          startDate.setDate(now.getDate() - 7)
        } else {
          // Specific month and year
          startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1)
          const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0)
          
          // Only include completed orders from the selected month
          const filteredOrders = orders.filter((order: any) => {
            if (order.status !== 'Completed') return false
            const orderDate = new Date(order.createdAt)
            return orderDate >= startDate && orderDate <= endDate
          })
          
          calculateTopItems(filteredOrders)
          return
        }
        
        // For week view
        const filteredOrders = orders.filter((order: any) => {
          if (order.status !== 'Completed') return false
          const orderDate = new Date(order.createdAt)
          return orderDate >= startDate
        })
        
        calculateTopItems(filteredOrders)
      }
    } catch (error) {
      console.error('Failed to load top selling items:', error)
    }
  }

  const calculateTopItems = (orders: any[]) => {
    // Count items sold and revenue
    const itemStats = new Map<string, { totalSold: number, revenue: number }>()
    
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const existing = itemStats.get(item.name) || { totalSold: 0, revenue: 0 }
        itemStats.set(item.name, {
          totalSold: existing.totalSold + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity)
        })
      })
    })
    
    // Convert to array and sort by total sold
    const topItems = Array.from(itemStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 3) // Top 3 items
    
    setTopSellingItems(topItems)
  }

  const loadRevenueData = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}

      const ordersRes = await fetch('/api/admin/orders', { headers })
      if (ordersRes.ok) {
        const orders: any[] = await ordersRes.json()
        const completedOrders = orders.filter((o: any) => o.status === 'Completed')
        
        // Filter and calculate based on time range
        const now = new Date()
        let startDate: Date
        let dateArray: string[] = []
        
        if (revenueTimeRange === 'week') {
          // Last 7 days
          startDate = new Date()
          startDate.setDate(now.getDate() - 6)
          
          dateArray = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(now.getDate() - (6 - i))
            return date.toISOString().split('T')[0]
          })
        } else {
          // Specific month
          const year = parseInt(revenueSelectedYear)
          const month = parseInt(revenueSelectedMonth)
          startDate = new Date(year, month, 1)
          const endDate = new Date(year, month + 1, 0)
          
          // Generate all dates in the month
          const daysInMonth = endDate.getDate()
          dateArray = Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month, i + 1)
            return date.toISOString().split('T')[0]
          })
        }
        
        // Initialize all dates with 0
        const revenueByDate = new Map<string, number>()
        dateArray.forEach(date => revenueByDate.set(date, 0))
        
        // Sum revenue for each date
        completedOrders.forEach((order: any) => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
          if (revenueByDate.has(orderDate)) {
            revenueByDate.set(orderDate, (revenueByDate.get(orderDate) || 0) + order.totalAmount)
          }
        })
        
        // Convert to chart data
        const chartData = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
          date: revenueTimeRange === 'week' 
            ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : new Date(date).getDate().toString(),
          revenue
        }))
        
        setRevenueData(chartData)
      }
    } catch (error) {
      console.error('Failed to load revenue data:', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}

      // Fetch all orders
      const ordersRes = await fetch('/api/admin/orders', { headers })
      if (ordersRes.ok) {
        const orders: any[] = await ordersRes.json()
        
        // Calculate total revenue from completed orders
        const completedOrders = orders.filter((o: any) => o.status === 'Completed')
        const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
        
        // Count active orders (Pending or Preparing)
        const activeOrders = orders.filter((o: any) => 
          o.status === 'Pending' || o.status === 'Preparing'
        ).length

        // Get unique customers
        const uniqueCustomers = new Set(orders.map((o: any) => o.userId)).size

        setStats({
          totalRevenue,
          activeOrders,
          totalCustomers: uniqueCustomers,
        })
        
        // Load top selling items initially
        calculateTopItems(completedOrders)
        
        // Load revenue data with current filters
        loadRevenueData()
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate month options
  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ]

  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => (currentYear - i).toString())

  const chartColors = ['#10b981', '#3b82f6', '#f59e0b']

  const statsDisplay = [
    { 
      title: "Total Revenue", 
      value: isLoading ? "..." : `RM ${stats.totalRevenue.toFixed(2)}`, 
      subtext: "From all orders",
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-emerald-100" 
    },
    { 
      title: "Active Orders", 
      value: isLoading ? "..." : stats.activeOrders.toString(), 
      subtext: "Pending or In Progress",
      icon: ShoppingBag, 
      color: "text-blue-600", 
      bg: "bg-blue-100" 
    },
    { 
      title: "Total Customers", 
      value: isLoading ? "..." : stats.totalCustomers.toString(), 
      subtext: "Unique users",
      icon: Users, 
      color: "text-violet-600", 
      bg: "bg-violet-100" 
    },
  ]

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 mt-1">Welcome back, Admin. Here is what is happening today.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm ${
          cafeStatus.isCafeOpen ? 'bg-white' : 'bg-red-50 border-red-200'
        }`}>
          <span className="relative flex h-3 w-3">
            {cafeStatus.isCafeOpen ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            )}
          </span>
          <span className={`text-sm font-medium ${
            cafeStatus.isCafeOpen ? 'text-gray-600' : 'text-red-700'
          }`}>
            System {cafeStatus.isCafeOpen ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsDisplay.map((stat, index) => (
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <p className="text-sm text-gray-500">
                  {revenueTimeRange === 'week' 
                    ? 'Last 7 days revenue performance'
                    : `${months[parseInt(revenueSelectedMonth)].label} ${revenueSelectedYear} revenue`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={revenueTimeRange} onValueChange={(value: 'week' | 'month') => setRevenueTimeRange(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
                {revenueTimeRange === 'month' && (
                  <>
                    <Select value={revenueSelectedMonth} onValueChange={setRevenueSelectedMonth}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={revenueSelectedYear} onValueChange={setRevenueSelectedYear}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-sm text-gray-500">Loading chart data...</p>
              </div>
            ) : revenueData.length === 0 || revenueData.every(d => d.revenue === 0) ? (
              <div className="h-[250px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No revenue data yet</p>
                </div>
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `RM${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: number) => [`RM${value.toFixed(2)}`, 'Revenue']}
                      cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#10b981" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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

      {/* Top Selling Items Chart */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>Top 3 Best Selling Items</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={(value: 'week' | 'month') => setTimeRange(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">By Month</SelectItem>
                </SelectContent>
              </Select>
              
              {timeRange === 'month' && (
                <>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {timeRange === 'week' 
              ? 'Items with the highest sales in the last 7 days' 
              : `Best sellers in ${months[parseInt(selectedMonth)].label} ${selectedYear}`
            }
          </p>
        </CardHeader>
        <CardContent>
          {topSellingItems.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center">
                <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No sales data for this period</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bar Chart */}
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellingItems} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: '#374151', fontSize: 13 }}
                      width={90}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'totalSold') return [`${value} sold`, 'Quantity']
                        return [value, name]
                      }}
                    />
                    <Bar dataKey="totalSold" radius={[0, 8, 8, 0]}>
                      {topSellingItems.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Detailed Stats Cards */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {topSellingItems.map((item, index) => (
                  <Card key={index} className={`border-0 ${
                    index === 0 ? 'bg-gradient-to-br from-amber-50 to-amber-100/50' :
                    index === 1 ? 'bg-gradient-to-br from-blue-50 to-blue-100/50' :
                    'bg-gradient-to-br from-orange-50 to-orange-100/50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-amber-500' :
                          index === 1 ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {index === 0 ? '🥇 Top Seller' : index === 1 ? '🥈 Runner Up' : '🥉 Third Place'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Quantity Sold</span>
                          <span className="text-sm font-bold text-gray-900">{item.totalSold}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Revenue</span>
                          <span className="text-sm font-bold text-emerald-600">RM {item.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}