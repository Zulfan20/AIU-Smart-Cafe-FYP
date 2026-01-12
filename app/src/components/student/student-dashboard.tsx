"use client"

import type * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, User, SlidersHorizontal, MenuIcon, ChevronDown, History, Clock } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { toast } from "sonner"

// Import types
import type { MenuItem, Order, StudentProfile, CartItem, Feedback } from "@/types/dashboard"

// Import data utilities
import { categories, transformMenuItem } from "@/data/menu-data"

// Import utilities
import { getPriceRangeLabel } from "@/lib/dashboard-utils"

// Import API client
import { menuAPI, ordersAPI, feedbackAPI, recommendationsAPI, authAPI } from "@/lib/api-client"

// Import feature components
import { MenuItemCard } from "@/components/student/features/MenuItemCard"
import { CategoryFilter } from "@/components/student/features/CategoryFilter"
import { OrderStatusCard } from "@/components/student/features/OrderStatusCard"
import { RecommendedItems } from "@/components/student/features/RecommendedItems"
import { BestSellerItems } from "@/components/student/features/BestSellerItems"
import { CartDialog } from "@/components/student/features/CartDialog"
import { ProfileDialog } from "@/components/student/features/ProfileDialog"
import { OrderHistoryDialog } from "@/components/student/features/OrderHistoryDialog"
import { FeedbackDialog } from "@/components/student/features/FeedbackDialog"
import { ReviewsDialog } from "@/components/student/features/ReviewsDialog"

export function StudentDashboard() {
  const router = useRouter()
  
  // Hydration state - prevent SSR/client mismatches
  const [mounted, setMounted] = useState(false)

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Handle token expiration
  const handleTokenExpiration = () => {
    // Clear all auth-related data
    localStorage.removeItem('studentToken')
    localStorage.removeItem('studentRole')
    localStorage.removeItem('studentUser')
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    
    // Show user-friendly message
    toast.error('Your session has expired. Please log in again.', {
      duration: 5000,
    })
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  }

  // State management
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    name: "Guest",
    email: "",
    role: "student",
  })

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [showAllItems, setShowAllItems] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]) // Store all items for client-side filtering
  const [recommendedItems, setRecommendedItems] = useState<MenuItem[]>([])
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Derive min and max price from priceRange
  const { minPrice, maxPrice } = useMemo(() => {
    switch (priceRange) {
      case "0-5": return { minPrice: 0, maxPrice: 5 }
      case "5-10": return { minPrice: 5, maxPrice: 10 }
      case "10-15": return { minPrice: 10, maxPrice: 15 }
      case "15+": return { minPrice: 15, maxPrice: 999 }
      default: return { minPrice: 0, maxPrice: 999 }
    }
  }, [priceRange])
  
  // Cafe status state
  const [cafeStatus, setCafeStatus] = useState({
    isCafeOpen: true,
    operatingHours: { start: "08:00", end: "22:00" },
    isWithinHours: true,
  })
  
  // Dialog states
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [orderInstructions, setOrderInstructions] = useState("")
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [feedbackDialogOrder, setFeedbackDialogOrder] = useState<Order | null>(null)
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [reviewsDialogState, setReviewsDialogState] = useState<{
    isOpen: boolean
    itemId: string | null
    itemName: string
  }>({ isOpen: false, itemId: null, itemName: "" })

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (!mounted) return
    
    // Check if user is authenticated with student token
    const token = typeof window !== 'undefined' ? localStorage.getItem('studentToken') : null
    setIsAuthenticated(!!token)

    // Load cart from localStorage
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (error) {
          console.error('Failed to parse saved cart:', error)
        }
      }
    }

    // Load public data
    loadMenuItems()
    loadCafeStatus()
    
    // Load user-specific data only if authenticated
    if (token) {
      loadRecommendations()
      loadOrders()
      loadProfile()
    }
  }, [mounted])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart])

  // Periodically check cafe status (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      loadCafeStatus()
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [])

  // Reload menu when filters change
  useEffect(() => {
    if (allMenuItems.length > 0) {
      // Filter locally instead of fetching from API
      filterMenuItems()
    } else {
      loadMenuItems()
    }
  }, [selectedCategory, searchQuery, minPrice, maxPrice])

  const filterMenuItems = () => {
    let filtered = [...allMenuItems]
    
    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      )
    }
    
    // Price filter
    if (minPrice > 0 || maxPrice < 50) {
      filtered = filtered.filter(item => 
        item.price >= minPrice && item.price <= maxPrice
      )
    }
    
    setMenuItems(filtered)
  }

  const loadMenuItems = async () => {
    try {
      setIsLoading(true)
      
      const items = await menuAPI.getAll({})
      const transformedItems = items.map(transformMenuItem)
      setAllMenuItems(transformedItems) // Store all items
      
      // Cache in localStorage for offline access
      if (typeof window !== 'undefined') {
        localStorage.setItem('cachedMenuItems', JSON.stringify(transformedItems))
      }
      
      // Apply filters
      let filtered = transformedItems
      if (selectedCategory !== "All") {
        filtered = filtered.filter((item: MenuItem) => item.category === selectedCategory)
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter((item: MenuItem) => 
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
        )
      }
      if (minPrice > 0 || maxPrice < 999) {
        filtered = filtered.filter((item: MenuItem) => 
          item.price >= minPrice && item.price <= maxPrice
        )
      }
      setMenuItems(filtered)
      
      // Load best sellers
      if (selectedCategory === "All" && !searchQuery) {
        const sortedByPopularity = [...items]
          .filter((item: any) => item.averageRating > 0)
          .sort((a: any, b: any) => {
            if (b.averageRating !== a.averageRating) {
              return b.averageRating - a.averageRating
            }
            return (b.feedbackCount || 0) - (a.feedbackCount || 0)
          })
          .slice(0, 4)
          .map(transformMenuItem)
        setBestSellers(sortedByPopularity)
      }
    } catch (error) {
      console.error("Failed to load menu items:", error)
      
      // Try to load from localStorage if offline
      if (typeof window !== 'undefined') {
        const cachedItems = localStorage.getItem('cachedMenuItems')
        if (cachedItems) {
          try {
            const parsedItems = JSON.parse(cachedItems)
            setAllMenuItems(parsedItems)
            filterMenuItems()
            toast.info("Showing offline menu")
            return
          } catch (e) {
            console.error("Failed to parse cached menu:", e)
          }
        }
      }
      
      toast.error("Failed to load menu items. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCafeStatus = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const settings = await response.json()
        
        // Check if current time is within operating hours
        const now = new Date()
        const currentTime = now.toTimeString().slice(0, 5) // "HH:MM"
        const { start, end } = settings.operatingHours
        
        let isWithinHours = false
        if (start > end) {
          // Overnight hours (e.g., 22:00 to 02:00)
          isWithinHours = currentTime >= start || currentTime <= end
        } else {
          isWithinHours = currentTime >= start && currentTime <= end
        }
        
        setCafeStatus({
          isCafeOpen: settings.isCafeOpen,
          operatingHours: settings.operatingHours,
          isWithinHours,
        })
      }
    } catch (error) {
      console.error('Failed to load cafe status:', error)
    }
  }

  const loadRecommendations = async () => {
    try {
      console.log('Loading recommendations...')
      const response = await recommendationsAPI.get()
      console.log('Recommendations API response:', response)
      const { recommendations } = response
      console.log('Received', recommendations?.length || 0, 'recommendations')
      if (recommendations && recommendations.length > 0) {
        const transformed = recommendations.map(transformMenuItem)
        console.log('Transformed recommendations:', transformed)
        setRecommendedItems(transformed)
      } else {
        console.warn('No recommendations received from API')
        setRecommendedItems([])
      }
    } catch (error) {
      console.error("Failed to load recommendations:", error)
      // Silent fail - recommendations are optional
      setRecommendedItems([])
    }
  }

  const loadOrders = async () => {
    try {
      // Check token before making request
      const token = typeof window !== 'undefined' ? localStorage.getItem('studentToken') : null
      if (!token) {
        console.warn("No authentication token found for loading orders")
        return
      }
      
      const orderData = await ordersAPI.getMyOrders()
      // Orders now have feedbackSubmitted flag per item from API
      const ordersWithFeedback = orderData.map((order: Order) => ({
        ...order,
        // Can give feedback if order is Ready and at least one item hasn't been reviewed
        canGiveFeedback: order.status === "Ready" && 
          order.items.some(item => !item.feedbackSubmitted),
      }))
      setOrders(ordersWithFeedback)
    } catch (error: any) {
      console.error("Failed to load orders:", error)
      // Check if it's a token expiration error
      if (error.message?.includes('Token expired') || error.message?.includes('expired')) {
        handleTokenExpiration()
      } else if (error.message?.includes('401') || error.message?.includes('Authorization')) {
        console.warn("Authentication failed - token may be invalid")
        handleTokenExpiration()
      } else {
        toast.error("Failed to load order history")
      }
    }
  }

  const loadProfile = async () => {
    try {
      // Check token before making request
      const token = typeof window !== 'undefined' ? localStorage.getItem('studentToken') : null
      if (!token) {
        console.warn("No authentication token found for loading profile")
        setIsAuthenticated(false)
        return
      }
      
      const profile = await authAPI.getProfile()
      setStudentProfile(profile)
      setIsAuthenticated(true)
    } catch (error: any) {
      console.error("Failed to load profile:", error)
      // Check if it's a token expiration error
      if (error.message?.includes('Token expired') || error.message?.includes('expired')) {
        handleTokenExpiration()
      } else if (error.message?.includes('401') || error.message?.includes('Authorization')) {
        console.warn("Authentication failed - token may be invalid")
        handleTokenExpiration()
      } else {
        // If profile fails, user might not be authenticated
        setIsAuthenticated(false)
      }
    }
  }

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "under-5" && item.price < 5) ||
        (priceRange === "5-10" && item.price >= 5 && item.price <= 10) ||
        (priceRange === "10-15" && item.price >= 10 && item.price <= 15) ||
        (priceRange === "above-15" && item.price > 15)

      return matchesPrice
    })
  }, [menuItems, priceRange])

  const addToCart = (item: MenuItem) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart")
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return
    }

    // Check if cafe is open
    if (!cafeStatus.isCafeOpen) {
      toast.error("The café is currently closed")
      return
    }

    // Check if within operating hours
    if (!cafeStatus.isWithinHours) {
      const { start, end } = cafeStatus.operatingHours
      toast.error(`The café is outside operating hours. We're open from ${start} to ${end}`)
      return
    }

    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.item._id === item._id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.item._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
    toast.success(`${item.name} added to cart`)
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((cartItem) => cartItem.item._id !== itemId))
  }

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId)
      return
    }
    setCart((prev) => prev.map((cartItem) => (cartItem.item._id === itemId ? { ...cartItem, quantity } : cartItem)))
  }

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    // Double-check cafe status before placing order
    if (!cafeStatus.isCafeOpen || !cafeStatus.isWithinHours) {
      toast.error("The café is currently closed. Cannot place order.")
      await loadCafeStatus() // Refresh status
      return
    }

    try {
      const orderItems = cart.map(({ item, quantity }) => ({
        itemId: item._id,
        quantity,
      }))

      const { order } = await ordersAPI.create(orderItems)
      
      toast.success("Order placed successfully!")
      setCart([])
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart')
      }
      setOrderInstructions("")
      setIsOrderDialogOpen(false)
      
      // Reload orders
      await loadOrders()
    } catch (error: any) {
      console.error("Failed to place order:", error)
      toast.error(error.message || "Failed to place order")
    }
  }

  const submitFeedback = async (feedbacks: { itemId: string; rating: number; comment: string }[]) => {
    if (!feedbackDialogOrder) return

    try {
      // Submit feedback for each item
      const results = await Promise.allSettled(
        feedbacks.map(feedback =>
          feedbackAPI.create({
            orderId: feedbackDialogOrder._id,
            itemId: feedback.itemId,
            rating: feedback.rating,
            textReview: feedback.comment || undefined,
          })
        )
      )

      // Check results
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.filter(r => r.status === 'rejected').length

      if (successCount > 0) {
        toast.success(
          failCount === 0
            ? `Successfully submitted ${successCount} review${successCount !== 1 ? 's' : ''}!`
            : `Submitted ${successCount} review${successCount !== 1 ? 's' : ''}, ${failCount} failed`
        )
      } else {
        toast.error("Failed to submit feedback")
      }

      setFeedbackDialogOrder(null)
      
      // Reload orders to update feedback status
      await loadOrders()
    } catch (error: any) {
      console.error("Failed to submit feedback:", error)
      toast.error(error.message || "Failed to submit feedback")
    }
  }

  const markAsPickedUp = async (orderId: string) => {
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token')
      console.log('Marking order as picked up:', orderId)
      console.log('Using token:', token ? 'Token exists' : 'No token found')
      
      // Call student API to update order status to Completed
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Completed' })
      })

      const data = await response.json()
      console.log('Mark as picked up response:', response.status, data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status')
      }

      toast.success("Order marked as picked up!")
      
      // Reload orders to update the status
      await loadOrders()
    } catch (error: any) {
      console.error("Failed to mark order as picked up:", error)
      toast.error(error.message || "Failed to update order status")
    }
  }

  const saveProfile = async (profile: Partial<StudentProfile>) => {
    try {
      await authAPI.updateProfile(profile)
      setStudentProfile((prev) => ({ ...prev, ...profile }))
      setIsProfileDialogOpen(false)
      toast.success("Profile updated successfully!")
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      toast.error(error.message || "Failed to update profile")
    }
  }

  const handleViewReviews = (itemId: string, itemName: string) => {
    setReviewsDialogState({ isOpen: true, itemId, itemName })
  }

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setStudentProfile((prev) => ({ ...prev, profilePic: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    // Clear student-specific tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('studentToken')
      localStorage.removeItem('studentRole')
      localStorage.removeItem('studentUser')
      localStorage.removeItem('cart')
      // Also clear legacy token if exists
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
    }
    setIsAuthenticated(false)
    setStudentProfile({
      name: "Guest",
      email: "",
      role: "student",
    })
    setCart([])
    setOrders([])
    setRecommendedItems([])
    toast.success("Logged out successfully")
  }

  const cartTotal = cart.reduce((total, { item, quantity }) => total + item.price * quantity, 0)
  const cartItemCount = cart.reduce((total, { quantity }) => total + quantity, 0)
  
  // Filter active orders: exclude Completed and Rejected orders older than 5 minutes
  const activeOrders = orders.filter((order) => {
    if (order.status === "Completed") {
      return false
    }
    
    // If rejected, only show for 5 minutes
    if (order.status === "Rejected") {
      const orderTime = new Date(order.updatedAt || order.createdAt).getTime()
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
      return (now - orderTime) < fiveMinutes
    }
    
    return true
  })

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50" suppressHydrationWarning>
      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-80 p-0 lg:hidden">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="p-6 border-b bg-emerald-600">
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold text-white">AIU Smart Café</span>
            </div>
          </div>

          <nav className="flex flex-col p-4 space-y-2">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.href = '/login'
                } else {
                  setIsProfileDialogOpen(true)
                  setIsMobileMenuOpen(false)
                }
              }}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">{isAuthenticated ? "Profile" : "Login"}</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <span className="font-medium">Logout</span>
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsOrderHistoryOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
              >
                <History className="w-5 h-5" />
                <span className="font-medium">Order History</span>
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                className="flex items-center justify-between w-full gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="font-medium">Price Filter</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isPriceFilterOpen ? "rotate-180" : ""}`} />
              </button>

              {isPriceFilterOpen && (
                <div className="ml-4 mt-1 space-y-1 pl-8">
                  {["all", "under-5", "5-10", "10-15", "above-15"].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setPriceRange(range)
                        setIsMobileMenuOpen(false)
                        setIsPriceFilterOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        priceRange === range
                          ? "bg-emerald-50 text-emerald-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {getPriceRangeLabel(range)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Navbar */}
      <nav className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-lg sticky top-0 z-50">
        <div className="px-4 md:pl-4 md:pr-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <img src="/aiu-logo.png" alt="AIU Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
              <h1 className="hidden md:block text-base md:text-xl lg:text-2xl font-bold text-white whitespace-nowrap">
                AIU Smart Café
              </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end max-w-3xl">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <Input
                  placeholder="What do you want to eat today"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10 h-10 md:h-11 bg-white border-none shadow-sm text-sm md:text-base"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="hidden lg:flex gap-1.5 bg-white hover:bg-gray-100 shadow-sm text-sm h-11 whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>{getPriceRangeLabel(priceRange)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {["all", "under-5", "5-10", "10-15", "above-15"].map((range) => (
                    <DropdownMenuItem key={range} onClick={() => setPriceRange(range)} className="cursor-pointer">
                      {getPriceRangeLabel(range)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {isAuthenticated && (
                <CartDialog
                  isOpen={isOrderDialogOpen}
                  onOpenChange={setIsOrderDialogOpen}
                  cart={cart}
                  cartTotal={cartTotal}
                  cartItemCount={cartItemCount}
                  orderInstructions={orderInstructions}
                  onOrderInstructionsChange={setOrderInstructions}
                  onUpdateQuantity={updateCartQuantity}
                  onPlaceOrder={placeOrder}
                />
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.href = '/login'
                  } else {
                    setIsProfileDialogOpen(true)
                  }
                }}
                className="hidden lg:flex gap-1.5 bg-white hover:bg-gray-100 shadow-sm text-sm h-11 whitespace-nowrap"
              >
                <User className="w-4 h-4" />
                <span>{isAuthenticated ? "Profile" : "Login"}</span>
              </Button>

              {isAuthenticated && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden lg:flex gap-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 shadow-sm text-sm h-11 whitespace-nowrap"
                >
                  <span>Logout</span>
                </Button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
              >
                <MenuIcon className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 md:pl-4 md:pr-4 py-2 md:py-3">
        <div className={`grid gap-4 md:gap-6 mb-6 md:mb-8 ${isAuthenticated ? 'lg:grid-cols-3' : ''}`}>
          <div className={isAuthenticated ? 'lg:col-span-2' : ''}>
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-xl p-6 md:p-8 mb-6 text-white shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-balance">
                Welcome{isAuthenticated ? ` back, ${studentProfile.name}` : ' to AIU Smart Café'}!
              </h2>
              <p className="text-emerald-50 text-base md:text-lg text-pretty">
                Discover fresh, sustainable meals tailored for you
              </p>
            </div>

            {/* Cafe Status Banner */}
            {(!cafeStatus.isCafeOpen || !cafeStatus.isWithinHours) && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 md:p-6 mb-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-1">
                      {!cafeStatus.isCafeOpen ? "Café is Closed" : "Outside Operating Hours"}
                    </h3>
                    <p className="text-red-700 text-sm mb-2">
                      {!cafeStatus.isCafeOpen 
                        ? "The café is temporarily closed by management. Please check back later."
                        : `We're currently closed. Operating hours: ${cafeStatus.operatingHours.start} - ${cafeStatus.operatingHours.end}`
                      }
                    </p>
                    <p className="text-red-600 text-xs">
                      You can browse the menu but ordering is disabled.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {cafeStatus.isCafeOpen && cafeStatus.isWithinHours && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-900 font-medium text-sm">
                      We're Open! Operating hours: {cafeStatus.operatingHours.start} - {cafeStatus.operatingHours.end}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile: Order Status */}
            <div className="lg:hidden space-y-4 mb-6">
              {isAuthenticated && (
                <OrderStatusCard 
                  activeOrders={activeOrders} 
                  onGiveFeedback={(orderId) => {
                    const order = orders.find(o => o._id === orderId)
                    if (order) setFeedbackDialogOrder(order)
                  }}
                  onViewOrderHistory={() => setIsOrderHistoryOpen(true)}
                  onMarkAsPickedUp={markAsPickedUp}
                />
              )}
            </div>

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Menu Items */}
            <div className="mb-6 md:mb-8">
              <div className="mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">Menu Items</h3>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading menu items...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    {(showAllItems ? filteredItems : filteredItems.slice(0, 6)).map((item) => (
                      <MenuItemCard key={item._id} item={item} onAddToCart={addToCart} onViewReviews={handleViewReviews} />
                    ))}
                  </div>
                  
                  {/* See More button - shows when there are more than 6 items */}
                  {filteredItems.length > 6 && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllItems(!showAllItems)}
                        className="w-full md:w-auto max-w-xs border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        {showAllItems ? "Show Less" : `See More (${filteredItems.length - 6} more items)`}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile: Best Sellers and Recommended (after menu items when logged in) */}
            <div className="lg:hidden space-y-4 mb-6">
              {isAuthenticated ? (
                <>
                  {/* Best Sellers */}
                  {bestSellers.length > 0 && (
                    <BestSellerItems items={bestSellers} onAddToCart={addToCart} onViewReviews={handleViewReviews} />
                  )}
                  
                  {/* Recommended Items */}
                  <RecommendedItems items={recommendedItems} onAddToCart={addToCart} />
                </>
              ) : (
                /* Best Sellers for non-logged in users */
                bestSellers.length > 0 && (
                  <BestSellerItems items={bestSellers} onAddToCart={addToCart} onViewReviews={handleViewReviews} />
                )
              )}
            </div>


          </div>

          {/* Desktop: Order Status and Recommended */}
          <div className="hidden lg:block space-y-4 md:space-y-6">
            {isAuthenticated && (
              <>
                <OrderStatusCard 
                  activeOrders={activeOrders} 
                  onGiveFeedback={(orderId) => {
                    const order = orders.find(o => o._id === orderId)
                    if (order) setFeedbackDialogOrder(order)
                  }}
                  onViewOrderHistory={() => setIsOrderHistoryOpen(true)}
                  onMarkAsPickedUp={markAsPickedUp}
                />
                
                {/* Recommended Items */}
                <RecommendedItems items={recommendedItems} onAddToCart={addToCart} />
              </>
            )}
          </div>
        </div>
        
        {/* Desktop: Best Sellers - Full Width Below Menu Items */}
        {bestSellers.length > 0 && (
          <div className="hidden lg:block mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  Best Sellers
                </h3>
                <p className="text-sm text-gray-500 mt-1">Most loved by our customers</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {bestSellers.map((item) => (
                <MenuItemCard key={item._id} item={item} onAddToCart={addToCart} onViewReviews={handleViewReviews} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onOpenChange={(open) => {
          setIsProfileDialogOpen(open)
          if (!open) setIsEditingProfile(false)
        }}
        profile={studentProfile}
        onProfileChange={setStudentProfile}
        onSaveProfile={saveProfile}
        onProfilePicUpload={handleProfilePicUpload}
        isAuthenticated={isAuthenticated}
        isEditing={isEditingProfile}
        onEditToggle={() => setIsEditingProfile(!isEditingProfile)}
      />

      <OrderHistoryDialog isOpen={isOrderHistoryOpen} onOpenChange={setIsOrderHistoryOpen} orders={orders} />

      <FeedbackDialog
        isOpen={feedbackDialogOrder !== null}
        order={feedbackDialogOrder}
        onSubmit={submitFeedback}
        onCancel={() => setFeedbackDialogOrder(null)}
      />

      <ReviewsDialog
        isOpen={reviewsDialogState.isOpen}
        itemId={reviewsDialogState.itemId}
        itemName={reviewsDialogState.itemName}
        onClose={() => setReviewsDialogState({ isOpen: false, itemId: null, itemName: "" })}
      />
    </div>
  )
}

export default StudentDashboard
