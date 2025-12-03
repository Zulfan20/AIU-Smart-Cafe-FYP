"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  LogOut,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"

const routes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/owner-dashboard",
    color: "text-teal-100", // Lighter text for contrast on green
  },
  {
    label: "Live Orders",
    icon: ShoppingBag,
    href: "/owner-dashboard/orders",
    color: "text-teal-100",
  },
  {
    label: "Menu Management",
    icon: UtensilsCrossed,
    href: "/owner-dashboard/menu",
    color: "text-teal-100",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/owner-dashboard/analytics",
    color: "text-teal-100",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/owner-dashboard/settings",
    color: "text-teal-100",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    // Changed bg-[#111827] to bg-teal-900 to match the Green theme
    <div className="space-y-4 py-4 flex flex-col h-full bg-teal-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/owner-dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                {/* Logo text is now Teal to match */}
                <span className="font-bold text-teal-700">A</span>
             </div>
          </div>
          <h1 className="text-2xl font-bold">
            AIU Café
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-teal-800 rounded-lg transition",
                // Active state uses a slightly lighter teal
                pathname === route.href ? "text-white bg-teal-800" : "text-teal-100/70"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
          <Button variant="ghost" className="w-full justify-start text-teal-100 hover:text-white hover:bg-teal-800">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
      </div>
    </div>
  )
}