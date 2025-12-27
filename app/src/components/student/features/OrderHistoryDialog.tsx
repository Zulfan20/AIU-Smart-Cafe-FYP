import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { History, Star } from "lucide-react"
import { getOrderStatusIcon, getOrderStatusText, getOrderStatusColor } from "@/lib/dashboard-utils"
import type { Order } from "@/types/dashboard"

interface OrderHistoryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  orders: Order[]
}

export function OrderHistoryDialog({ isOpen, onOpenChange, orders }: OrderHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order History</DialogTitle>
          <DialogDescription>View all your past orders</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className={`p-4 rounded-lg border-2 ${getOrderStatusColor(order.status)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm">Order #{order._id.slice(-8)}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getOrderStatusIcon(order.status)}
                    <Badge variant="outline" className="text-xs">
                      {getOrderStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1">
                  {order.items.map((orderItem, idx) => (
                    <p key={idx} className="text-sm text-gray-700">
                      {orderItem.quantity}x {orderItem.name} - RM{(orderItem.price * orderItem.quantity).toFixed(2)}
                    </p>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Total:</span>
                  <span className="font-bold text-emerald-600">RM{order.totalAmount.toFixed(2)}</span>
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
                    {order.feedback.textReview && (
                      <p className="text-xs text-gray-600">{order.feedback.textReview}</p>
                    )}
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
  )
}
