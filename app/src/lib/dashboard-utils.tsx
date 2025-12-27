import { CheckCircle, XCircle, Clock, Coffee, Utensils, Pizza, GlassWater } from "lucide-react"
import type { Order } from "@/types/dashboard"

export function getOrderStatusIcon(status: Order["status"]) {
  switch (status) {
    case "Pending":
      return <Clock className="w-5 h-5 text-yellow-600" />
    case "Preparing":
      return <CheckCircle className="w-5 h-5 text-blue-600" />
    case "Rejected":
      return <XCircle className="w-5 h-5 text-red-600" />
    case "Ready":
      return <CheckCircle className="w-5 h-5 text-emerald-600" />
    case "Completed":
      return <CheckCircle className="w-5 h-5 text-gray-600" />
    default:
      return <Clock className="w-5 h-5" />
  }
}

export function getOrderStatusText(status: Order["status"]) {
  switch (status) {
    case "Pending":
      return "Waiting for Approval"
    case "Preparing":
      return "Being Prepared"
    case "Rejected":
      return "Order Rejected"
    case "Ready":
      return "Ready for Pickup"
    case "Completed":
      return "Order Completed"
    default:
      return "Unknown"
  }
}

export function getOrderStatusColor(status: Order["status"]) {
  switch (status) {
    case "Pending":
      return "bg-yellow-50 border-yellow-300"
    case "Preparing":
      return "bg-blue-50 border-blue-300"
    case "Rejected":
      return "bg-red-50 border-red-300"
    case "Ready":
      return "bg-emerald-50 border-emerald-300"
    case "Completed":
      return "bg-gray-50 border-gray-300"
    default:
      return "bg-gray-50 border-gray-300"
  }
}

export const categoryIcons: Record<string, any> = {
  "Main Course": Utensils,
  Drink: Coffee,
  Snack: Pizza,
  Side: GlassWater,
}

export function getPriceRangeLabel(priceRange: string) {
  switch (priceRange) {
    case "under-5":
      return "Under RM5"
    case "5-10":
      return "RM5 - RM10"
    case "10-15":
      return "RM10 - RM15"
    case "above-15":
      return "Above RM15"
    default:
      return "All Prices"
  }
}
