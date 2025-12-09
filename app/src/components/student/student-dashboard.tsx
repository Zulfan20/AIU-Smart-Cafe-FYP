"use client"

import type * as React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  XCircle,
  CheckCircle,
  History,
  MessageSquare,
  Upload,
  Calendar,
  Mail,
  Phone,
  UserCircle,
  Package,
  ChevronDown,
} from "lucide-react"
import {
  Search,
  ShoppingCart,
  Star,
  Clock,
  User,
  SlidersHorizontal,
  Coffee,
  Utensils,
  Pizza,
  GlassWater,
  MenuIcon,
} from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  prepTime: number
  available: boolean
  isRecommended?: boolean
}

interface Order {
  id: string
  items: { item: MenuItem; quantity: number }[]
  total: number
  status: "pending" | "accepted" | "declined" | "ready" | "completed"
  orderTime: string
  estimatedTime: number
  progress: number
  instructions?: string
  canGiveFeedback?: boolean
  feedback?: {
    rating: number
    comment: string
    submittedAt: string
  }
}

interface StudentProfile {
  name: string
  email: string
  studentId: string
  bio: string
  gender: string
  birthday: string
  phone: string
  profilePic: string
}

// بيانات AIU Café الحقيقية من المينيو
const rawItems: { id: string; name: string; price: number; category: string }[] = [
  { id: "item_1", name: "Teh O (S)", price: 1.0, category: "Drinks" },
  { id: "item_2", name: "Teh O (L)", price: 1.5, category: "Drinks" },
  { id: "item_3", name: "Teh C (S)", price: 2.0, category: "Drinks" },
  { id: "item_4", name: "Teh C (L)", price: 2.5, category: "Drinks" },
  { id: "item_5", name: "Nescafe (S)", price: 2.0, category: "Drinks" },
  { id: "item_6", name: "Nescafe (L)", price: 2.5, category: "Drinks" },
  { id: "item_7", name: "Milo Cold (S)", price: 2.5, category: "Drinks" },
  { id: "item_8", name: "Milo Cold (L)", price: 3.0, category: "Drinks" },
  { id: "item_9", name: "Teh O Ice (S)", price: 2.0, category: "Drinks" },
  { id: "item_10", name: "Teh O Ice (L)", price: 2.5, category: "Drinks" },
  { id: "item_11", name: "Teh C Ice (S)", price: 2.5, category: "Drinks" },
  { id: "item_12", name: "Teh C Ice (L)", price: 3.0, category: "Drinks" },
  { id: "item_13", name: "Nescafe Ice (S)", price: 2.5, category: "Drinks" },
  { id: "item_14", name: "Nescafe Ice (L)", price: 3.0, category: "Drinks" },
  { id: "item_15", name: "Teh O Ice Lemon", price: 2.5, category: "Drinks" },

  { id: "item_16", name: "Teh 'Ais C Special", price: 3.0, category: "Drinks" },
  { id: "item_17", name: "Milo Dinosaur", price: 4.0, category: "Drinks" },
  { id: "item_18", name: "Tea Hot", price: 1.0, category: "Drinks" },
  { id: "item_19", name: "Tea Ice", price: 1.5, category: "Drinks" },
  { id: "item_20", name: "Lemon Tea Ice", price: 2.5, category: "Drinks" },

  { id: "item_21", name: "Corn Flakes", price: 4.0, category: "Breakfast" },
  { id: "item_22", name: "Half Boiled Egg", price: 2.0, category: "Breakfast" },
  { id: "item_23", name: "Roti Canai", price: 1.5, category: "Breakfast" },
  { id: "item_24", name: "Roti Boom", price: 2.0, category: "Breakfast" },
  { id: "item_25", name: "Roti Telur", price: 3.0, category: "Breakfast" },
  { id: "item_26", name: "Roti Sardin", price: 3.0, category: "Breakfast" },
  { id: "item_27", name: "Roti Planta", price: 2.0, category: "Breakfast" },
  { id: "item_28", name: "Paratha", price: 3.0, category: "Breakfast" },
  { id: "item_29", name: "Scramble Egg With Toast", price: 3.0, category: "Breakfast" },
  { id: "item_30", name: "Set Breakfast", price: 5.0, category: "Breakfast" },

  { id: "item_31", name: "Chicken Burger", price: 4.0, category: "Lunch" },
  { id: "item_32", name: "Beef Burger", price: 4.5, category: "Lunch" },
  { id: "item_33", name: "Fish Burger", price: 4.0, category: "Lunch" },
  { id: "item_34", name: "Cheese Burger", price: 4.5, category: "Lunch" },
  { id: "item_35", name: "Chicken Patty", price: 3.0, category: "Lunch" },
  { id: "item_36", name: "Beef Patty", price: 3.5, category: "Lunch" },
  { id: "item_37", name: "Sosej Cheese", price: 3.0, category: "Lunch" },
  { id: "item_38", name: "Egg Sandwich", price: 3.0, category: "Lunch" },
  { id: "item_39", name: "Cheese Sandwich", price: 3.5, category: "Lunch" },
  { id: "item_40", name: "Tuna Sandwich", price: 3.5, category: "Lunch" },
  { id: "item_41", name: "Ayam Kunyit", price: 4.0, category: "Lunch" },
  { id: "item_42", name: "Sambal Sotong", price: 4.0, category: "Lunch" },
  { id: "item_43", name: "Sambal Kerang", price: 4.0, category: "Lunch" },
  { id: "item_44", name: "Kupang Masak Sambal", price: 4.0, category: "Lunch" },
  { id: "item_45", name: "Nasi Goreng Biasa", price: 4.0, category: "Lunch" },

  { id: "item_46", name: "Nasi Goreng Cina", price: 4.0, category: "Lunch" },
  { id: "item_47", name: "Mee Goreng", price: 4.0, category: "Lunch" },
  { id: "item_48", name: "Maggi Goreng", price: 4.0, category: "Lunch" },
  { id: "item_49", name: "Pizza", price: 8.0, category: "Lunch" },
  { id: "item_50", name: "Seafood Pizza", price: 9.0, category: "Lunch" },
  { id: "item_51", name: "Chicken Sausage Pizza", price: 9.0, category: "Lunch" },
  { id: "item_52", name: "Chicken Meatball Pizza", price: 9.0, category: "Lunch" },
  { id: "item_53", name: "Chicken Pepperoni Pizza", price: 9.0, category: "Lunch" },
  { id: "item_54", name: "Double Cheese Pizza", price: 9.0, category: "Lunch" },
  { id: "item_55", name: "Vegetable Pizza", price: 9.0, category: "Lunch" },
  { id: "item_56", name: "Nasi Ayam", price: 6.0, category: "Lunch" },
  { id: "item_57", name: "Nasi Tomato Ayam Merah", price: 6.0, category: "Lunch" },
  { id: "item_58", name: "Nasi Goreng Paprik", price: 6.0, category: "Lunch" },
  { id: "item_59", name: "Nasi Goreng Ayam Kunyit", price: 6.0, category: "Lunch" },
  { id: "item_60", name: "Ikan Keli Goreng", price: 6.0, category: "Lunch" },

  { id: "item_61", name: "Beef", price: 4.0, category: "Lunch" },
  { id: "item_62", name: "Fried Chicken", price: 3.0, category: "Lunch" },
  { id: "item_63", name: "Chicken Curry", price: 3.5, category: "Lunch" },
  { id: "item_64", name: "Boiled Egg", price: 1.0, category: "Lunch" },
  { id: "item_65", name: "Fried Egg", price: 1.0, category: "Lunch" },
  { id: "item_66", name: "Egg Curry", price: 1.5, category: "Lunch" },
  { id: "item_67", name: "Sausage", price: 1.0, category: "Lunch" },
  { id: "item_68", name: "Fried Fish", price: 3.0, category: "Lunch" },
  { id: "item_69", name: "Fried Catfish", price: 4.0, category: "Lunch" },
  { id: "item_70", name: "Fish Head Curry", price: 8.0, category: "Lunch" },
]

// تحويلها إلى الشكل اللي بيستخدمه الـ Student Dashboard
const mockMenuItems: MenuItem[] = rawItems.map((row, index) => ({
  id: row.id,
  name: row.name,
  description: `${row.name} from the AIU Smart Café menu.`,
  price: row.price,
  // IMPORTANT: حطي الصور في مجلد public/menu بأسماء item_1.jpg ... item_70.jpg
  image: `/menu/${row.id}.png`,
  category: row.category,
  rating: 4 + (index % 5) * 0.2, // 4.0 – 4.8 شكل تجريبي حلو
  prepTime: 5 + (index % 4) * 5, // 5,10,15,20 دقيقة
  available: true,
  isRecommended: index < 6, // أول 6 items كـ "Recommended"
}))



export function StudentDashboard() {
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    name: "Student",
    email: "",
    studentId: "",
    bio: "",
    gender: "",
    birthday: "",
    phone: "",
    profilePic: "",
  })

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number }>>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [orderInstructions, setOrderInstructions] = useState("")
  const [showAllItems, setShowAllItems] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState<string | null>(null)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false)

  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        setIsSidebarOpen(false)
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSidebarOpen])

  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Drinks"]

  const filteredItems = useMemo(() => {
    return mockMenuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "under-5" && item.price < 5) ||
        (priceRange === "5-10" && item.price >= 5 && item.price <= 10) ||
        (priceRange === "10-15" && item.price >= 10 && item.price <= 15) ||
        (priceRange === "above-15" && item.price > 15) // Added condition for "above-15"

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [searchQuery, selectedCategory, priceRange])

  const recommendedItems = mockMenuItems.filter((item) => item.isRecommended)

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.item.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((cartItem) => cartItem.item.id !== itemId))
  }

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId)
      return
    }
    setCart((prev) => prev.map((cartItem) => (cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem)))
  }

  const placeOrder = () => {
    if (cart.length === 0) return

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total: cartTotal,
      status: "pending",
      orderTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      estimatedTime: Math.max(...cart.map(({ item }) => item.prepTime)),
      progress: 0,
      instructions: orderInstructions,
      canGiveFeedback: false,
    }

    setOrders((prev) => [newOrder, ...prev])
    setCart([])
    setOrderInstructions("")
    setIsOrderDialogOpen(false)

    // Simulate owner receiving order and responding
    setTimeout(() => {
      const isAccepted = Math.random() > 0.2

      if (isAccepted) {
        setOrders((prev) => prev.map((order) => (order.id === newOrder.id ? { ...order, status: "accepted" } : order)))

        setTimeout(() => {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === newOrder.id ? { ...order, status: "ready", canGiveFeedback: true } : order,
            ),
          )
        }, 10000)
      } else {
        setOrders((prev) => prev.map((order) => (order.id === newOrder.id ? { ...order, status: "declined" } : order)))
      }
    }, 3000)
  }

  const submitFeedback = (orderId: string) => {
    if (feedbackRating === 0) return

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              feedback: {
                rating: feedbackRating,
                comment: feedbackComment,
                submittedAt: new Date().toISOString(),
              },
              canGiveFeedback: false,
            }
          : order,
      ),
    )

    setFeedbackDialogOpen(null)
    setFeedbackRating(0)
    setFeedbackComment("")
  }

  const saveProfile = (profile: Partial<StudentProfile>) => {
    setStudentProfile((prev) => ({ ...prev, ...profile }))
    setIsProfileDialogOpen(false)
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

  const cartTotal = cart.reduce((total, { item, quantity }) => total + item.price * quantity, 0)
  const cartItemCount = cart.reduce((total, { quantity }) => total + quantity, 0)

  const getOrderStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "declined":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "ready":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-gray-500" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getOrderStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Waiting for Approval"
      case "accepted":
        return "Order Approved - Being Prepared"
      case "declined":
        return "Order Declined"
      case "ready":
        return "Ready for Pickup"
      case "completed":
        return "Completed"
      default:
        return "Unknown"
    }
  }

  const getOrderStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-300"
      case "accepted":
        return "bg-blue-50 border-blue-300"
      case "declined":
        return "bg-red-50 border-red-300"
      case "ready":
        return "bg-emerald-50 border-emerald-300"
      case "completed":
        return "bg-gray-50 border-gray-300"
      default:
        return "bg-gray-50 border-gray-300"
    }
  }

  const categoryIcons: Record<string, any> = {
    Breakfast: Coffee,
    Lunch: Utensils,
    Dinner: Pizza,
    Drinks: GlassWater,
  }

  const getPriceRangeLabel = () => {
    switch (priceRange) {
      case "under-5":
        return "Under RM5"
      case "5-10":
        return "RM5 - RM10"
      case "10-15":
        return "RM10 - RM15"
      case "above-15":
        return "Above RM15" // Added label for "above-15"
      default:
        return "All Prices"
    }
  }

  const activeOrder = orders.find((order) => order.status !== "completed")

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" />}

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-80 p-0 lg:hidden">
          <div className="p-6 border-b bg-emerald-600">
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold text-white">AIU Smart Café</span>
            </div>
          </div>

          <nav className="flex flex-col p-4 space-y-2">
            <button
              onClick={() => {
                setIsProfileDialogOpen(true)
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>

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
                  <button
                    onClick={() => {
                      setPriceRange("all")
                      setIsMobileMenuOpen(false)
                      setIsPriceFilterOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      priceRange === "all"
                        ? "bg-emerald-50 text-emerald-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    All Prices
                  </button>
                  <button
                    onClick={() => {
                      setPriceRange("under-5")
                      setIsMobileMenuOpen(false)
                      setIsPriceFilterOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      priceRange === "under-5"
                        ? "bg-emerald-50 text-emerald-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Under RM5
                  </button>
                  <button
                    onClick={() => {
                      setPriceRange("5-10")
                      setIsMobileMenuOpen(false)
                      setIsPriceFilterOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      priceRange === "5-10"
                        ? "bg-emerald-50 text-emerald-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    RM5 - RM10
                  </button>
                  <button
                    onClick={() => {
                      setPriceRange("10-15")
                      setIsMobileMenuOpen(false)
                      setIsPriceFilterOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      priceRange === "10-15"
                        ? "bg-emerald-50 text-emerald-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    RM10 - RM15
                  </button>
                  <button
                    onClick={() => {
                      setPriceRange("above-15") // Added for the new price range
                      setIsMobileMenuOpen(false)
                      setIsPriceFilterOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      priceRange === "above-15"
                        ? "bg-emerald-50 text-emerald-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Above RM15
                  </button>
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
              <h1 className="text-base md:text-xl lg:text-2xl font-bold text-white whitespace-nowrap">
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
                    <span>{getPriceRangeLabel()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setPriceRange("all")} className="cursor-pointer">
                    All Prices
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriceRange("under-5")} className="cursor-pointer">
                    Under RM5
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriceRange("5-10")} className="cursor-pointer">
                    RM5 - RM10
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriceRange("10-15")} className="cursor-pointer">
                    RM10 - RM15
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriceRange("above-15")} className="cursor-pointer">
                    {" "}
                    {/* Added */}
                    Above RM15
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="relative bg-white hover:bg-gray-100 shadow-sm text-xs md:text-sm h-10 md:h-11 gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">Cart</span>
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Your Order</DialogTitle>
                    <DialogDescription>Review your items before placing the order</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {cart.length > 0 ? (
                      <>
                        {cart.map(({ item, quantity }) => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-balance">{item.name}</h4>
                              <p className="text-sm text-gray-600">RM{item.price.toFixed(2)} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.id, quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center font-medium">{quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.id, quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Separator />

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Special Instructions (Optional)</label>
                          <Textarea
                            placeholder="Any special requests or dietary requirements?"
                            value={orderInstructions}
                            onChange={(e) => setOrderInstructions(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>

                        <Separator />
                        <div className="flex justify-between items-center font-semibold text-lg">
                          <span>Total</span>
                          <span className="text-emerald-600">RM{cartTotal.toFixed(2)}</span>
                        </div>
                        <Button onClick={placeOrder} className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Place Order
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Your cart is empty</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsProfileDialogOpen(true)}
                className="hidden lg:flex gap-1.5 bg-white hover:bg-gray-100 shadow-sm text-sm h-11 whitespace-nowrap"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Button>

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
        {/* Mobile Layout: Order Status and Recommended at Top */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-xl p-6 md:p-8 mb-6 text-white shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-balance">Welcome back, {studentProfile.name}!</h2>
              <p className="text-emerald-50 text-base md:text-lg text-pretty">
                Discover fresh, sustainable meals tailored for you
              </p>
            </div>

            <div className="lg:hidden space-y-4 mb-6">
              <Card className="shadow-md border-0">
                <CardHeader className="bg-emerald-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-emerald-600" />
                    Order Status
                  </CardTitle>
                  <CardDescription>Track your current order</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {activeOrder ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border-0 ${getOrderStatusColor(activeOrder.status)}`}>
                        <div className="flex items-start gap-3 mb-3">
                          {getOrderStatusIcon(activeOrder.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{getOrderStatusText(activeOrder.status)}</p>
                            <p className="text-xs text-gray-600 mt-1 truncate">Order ID: {activeOrder.id}</p>
                            <p className="text-xs text-gray-600">Time: {activeOrder.orderTime}</p>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-2">
                          {activeOrder.items.slice(0, 2).map(({ item, quantity }) => (
                            <p key={item.id} className="text-xs text-gray-700 truncate">
                              {quantity}x {item.name}
                            </p>
                          ))}
                          {activeOrder.items.length > 2 && (
                            <p className="text-xs text-gray-500">+{activeOrder.items.length - 2} more items</p>
                          )}
                        </div>

                        <Separator className="my-3" />

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Total:</span>
                          <span className="text-sm font-bold text-emerald-600">RM{activeOrder.total.toFixed(2)}</span>
                        </div>

                        {activeOrder.canGiveFeedback && !activeOrder.feedback && (
                          <Button
                            onClick={() => setFeedbackDialogOpen(activeOrder.id)}
                            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                            size="sm"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Give Feedback
                          </Button>
                        )}

                        {activeOrder.feedback && (
                          <div className="mt-4 p-3 bg-white rounded-lg border">
                            <p className="text-xs font-medium text-emerald-600 mb-1">Feedback Submitted</p>
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < activeOrder.feedback!.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">No active orders</p>
                      <p className="text-gray-400 text-xs mt-1">Place an order to see it here</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 shadow-md">
                <CardHeader className="bg-yellow-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Recommended for You
                  </CardTitle>
                  <CardDescription className="text-xs">AI-powered meal suggestions</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {recommendedItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 rounded-lg border-0 hover:shadow-md transition">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-balance line-clamp-2">{item.name}</h4>
                          <div className="flex items-center gap-2 my-1">
                            <span className="text-sm font-bold text-emerald-600">RM{item.price.toFixed(2)}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600">{item.rating}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Category</h3>
              <div className="flex flex-wrap gap-3 md:gap-4 justify-start">
                {categories
                  .filter((cat) => cat !== "All")
                  .map((category) => {
                    const Icon = categoryIcons[category] || Coffee
                    return (
                      <div key={category} className={`flex flex-col items-center gap-2`}>
                        <div
                          onClick={() => setSelectedCategory(category)}
                          className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                            selectedCategory === category
                              ? "bg-white border-emerald-500"
                              : "bg-white border-emerald-500 hover:bg-emerald-50"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 md:w-7 md:h-7 ${selectedCategory === category ? "text-emerald-600" : "text-emerald-600"}`}
                          />
                        </div>
                        <span
                          className={`text-xs md:text-sm font-medium ${selectedCategory === category ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {category}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">Menu Items</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowAllItems(!showAllItems)}
                  className="text-gray-900 hover:text-gray-900 hover:bg-gray-100 md:text-emerald-600 md:hover:text-emerald-700 md:hover:bg-emerald-50 text-sm md:text-base font-medium"
                >
                  {showAllItems ? "Show Less" : "See All"}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {(showAllItems ? filteredItems : filteredItems.slice(0, 8)).map((item) => (
                  <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative aspect-square md:block hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="md:hidden flex gap-3 p-3">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-balance line-clamp-2">{item.name}</h4>
                          <div className="flex items-center gap-1 my-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{item.rating}</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">RM{item.price.toFixed(2)}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          disabled={!item.available}
                          className="self-end bg-emerald-600 hover:bg-emerald-700 h-8 w-16 text-xs"
                        >
                          {item.available ? "Add" : "Unavailable"}
                        </Button>
                      </div>

                      <div className="hidden md:block p-4">
                        <h4 className="font-semibold text-lg text-balance mb-2 line-clamp-2">{item.name}</h4>
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.floor(item.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">({item.rating})</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-bold text-gray-800">RM{item.price.toFixed(2)}</span>
                          <span className="text-sm text-gray-500">{item.prepTime} min</span>
                        </div>
                        <Button
                          onClick={() => addToCart(item)}
                          disabled={!item.available}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
                        >
                          {item.available ? "Add to Cart" : "Unavailable"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:block space-y-4 md:space-y-6">
            <Card className="border-2 shadow-md">
              <CardHeader className="bg-emerald-50">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-emerald-600" />
                  Order Status
                </CardTitle>
                <CardDescription>Track your current order</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {activeOrder ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-0 ${getOrderStatusColor(activeOrder.status)}`}>
                      <div className="flex items-start gap-3 mb-3">
                        {getOrderStatusIcon(activeOrder.status)}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{getOrderStatusText(activeOrder.status)}</p>
                          <p className="text-xs text-gray-600 mt-1 truncate">Order ID: {activeOrder.id}</p>
                          <p className="text-xs text-gray-600">Time: {activeOrder.orderTime}</p>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        {activeOrder.items.slice(0, 2).map(({ item, quantity }) => (
                          <p key={item.id} className="text-xs text-gray-700 truncate">
                            {quantity}x {item.name}
                          </p>
                        ))}
                        {activeOrder.items.length > 2 && (
                          <p className="text-xs text-gray-500">+{activeOrder.items.length - 2} more items</p>
                        )}
                      </div>

                      <Separator className="my-3" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Total:</span>
                        <span className="text-sm font-bold text-emerald-600">RM{activeOrder.total.toFixed(2)}</span>
                      </div>

                      {activeOrder.canGiveFeedback && !activeOrder.feedback && (
                        <Button
                          onClick={() => setFeedbackDialogOpen(activeOrder.id)}
                          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                          size="sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Give Feedback
                        </Button>
                      )}

                      {activeOrder.feedback && (
                        <div className="mt-4 p-3 bg-white rounded-lg border">
                          <p className="text-xs font-medium text-emerald-600 mb-1">Feedback Submitted</p>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < activeOrder.feedback!.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {activeOrder.instructions && (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-xs font-medium text-gray-600 mb-1">Your Instructions:</p>
                        <p className="text-xs text-gray-700">{activeOrder.instructions}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No active orders</p>
                    <p className="text-xs text-gray-400 mt-1">Place an order to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Recommended for You
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">AI-powered meal suggestions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recommendedItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-lg border-0 hover:shadow-md transition">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-balance line-clamp-2">{item.name}</h4>
                        <div className="flex items-center gap-2 my-1">
                          <span className="text-sm font-bold text-emerald-600">RM{item.price.toFixed(2)}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{item.rating}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>Manage your account information and preferences</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {studentProfile.profilePic ? (
                  <img
                    src={studentProfile.profilePic || "/placeholder.svg"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-200">
                    <UserCircle className="w-16 h-16 text-emerald-600" />
                  </div>
                )}
                <label
                  htmlFor="profile-pic-upload"
                  className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full cursor-pointer shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Name
                </Label>
                <Input
                  id="name"
                  value={studentProfile.name}
                  onChange={(e) => setStudentProfile((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId" className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  value={studentProfile.studentId}
                  onChange={(e) => setStudentProfile((prev) => ({ ...prev, studentId: e.target.value }))}
                  placeholder="Enter your student ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={studentProfile.email}
                  onChange={(e) => setStudentProfile((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@aiu.edu.my"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={studentProfile.phone}
                  onChange={(e) => setStudentProfile((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+60 12-345 6789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={studentProfile.gender}
                  onValueChange={(value) => setStudentProfile((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Birthday
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={studentProfile.birthday}
                  onChange={(e) => setStudentProfile((prev) => ({ ...prev, birthday: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={studentProfile.bio}
                onChange={(e) => setStudentProfile((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Quick Actions</h3>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
                onClick={() => {
                  setIsProfileDialogOpen(false)
                  setIsOrderHistoryOpen(true)
                }}
              >
                <History className="w-4 h-4" />
                View Order History
              </Button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => saveProfile(studentProfile)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderHistoryOpen} onOpenChange={setIsOrderHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order History</DialogTitle>
            <DialogDescription>View all your past orders</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className={`p-4 rounded-lg border-2 ${getOrderStatusColor(order.status)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.orderTime}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getOrderStatusIcon(order.status)}
                      <Badge variant="outline">{getOrderStatusText(order.status)}</Badge>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-1">
                    {order.items.map(({ item, quantity }) => (
                      <p key={item.id} className="text-sm text-gray-700">
                        {quantity}x {item.name} - RM{(item.price * quantity).toFixed(2)}
                      </p>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-emerald-600">RM{order.total.toFixed(2)}</span>
                  </div>
                  {order.feedback && (
                    <div className="mt-3 p-2 bg-white rounded border">
                      <p className="text-xs font-medium mb-1">Your Feedback:</p>
                      <div className="flex gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < order.feedback!.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {order.feedback.comment && <p className="text-xs text-gray-600">{order.feedback.comment}</p>}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No order history yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackDialogOpen !== null} onOpenChange={(open) => !open && setFeedbackDialogOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Give Feedback</DialogTitle>
            <DialogDescription>Rate your order and share your experience</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Rating</Label>
              <div className="flex gap-2 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFeedbackRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${i < feedbackRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="feedback-comment" className="text-sm font-medium mb-2 block">
                Comment (Optional)
              </Label>
              <Textarea
                id="feedback-comment"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Tell us about your experience..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setFeedbackDialogOpen(null)
                setFeedbackRating(0)
                setFeedbackComment("")
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => feedbackDialogOpen && submitFeedback(feedbackDialogOpen)}
              disabled={feedbackRating === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentDashboard
