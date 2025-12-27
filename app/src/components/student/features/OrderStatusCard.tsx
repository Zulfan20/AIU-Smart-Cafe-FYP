import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Coffee, Package, MessageSquare, Star, ChevronLeft, ChevronRight, History } from "lucide-react"
import { getOrderStatusIcon, getOrderStatusText, getOrderStatusColor } from "@/lib/dashboard-utils"
import type { Order } from "@/types/dashboard"
import { useState } from "react"

interface OrderStatusCardProps {
  activeOrders: Order[]
  onGiveFeedback: (orderId: string) => void
  onViewOrderHistory: () => void
  onMarkAsPickedUp?: (orderId: string) => void
}

export function OrderStatusCard({ activeOrders, onGiveFeedback, onViewOrderHistory, onMarkAsPickedUp }: OrderStatusCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const nextOrder = () => {
    if (currentIndex < activeOrders.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }
  
  const prevOrder = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }
  
  const activeOrder = activeOrders[currentIndex]
  return (
    <Card className="border-2 shadow-md">
      <CardHeader className="bg-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Coffee className="w-5 h-5 text-emerald-600" />
              Order Status
            </CardTitle>
            <CardDescription>Track your current orders</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewOrderHistory}
            className="gap-2"
          >
            <History className="w-4 h-4" />
            History
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {activeOrders.length > 0 ? (
          <div className="space-y-4">
            {/* Carousel controls */}
            {activeOrders.length > 1 && (
              <div className="flex items-center justify-between mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevOrder}
                  disabled={currentIndex === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Order {currentIndex + 1} of {activeOrders.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextOrder}
                  disabled={currentIndex === activeOrders.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className={`p-4 rounded-lg border-0 ${getOrderStatusColor(activeOrder.status)}`}>
              <div className="flex items-start gap-3 mb-3">
                {getOrderStatusIcon(activeOrder.status)}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{getOrderStatusText(activeOrder.status)}</p>
                  <p className="text-xs text-gray-600 mt-1 truncate">Order ID: {activeOrder._id.slice(-8)}</p>
                  <p className="text-xs text-gray-600">Time: {new Date(activeOrder.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                {activeOrder.items.slice(0, 2).map((orderItem, idx) => (
                  <p key={idx} className="text-xs text-gray-700 truncate">
                    {orderItem.quantity}x {orderItem.name}
                  </p>
                ))}
                {activeOrder.items.length > 2 && (
                  <p className="text-xs text-gray-500">+{activeOrder.items.length - 2} more items</p>
                )}
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Total:</span>
                <span className="text-sm font-bold text-emerald-600">RM{activeOrder.totalAmount.toFixed(2)}</span>
              </div>

              {/* Feedback Section */}
              {activeOrder.status === "Ready" && (
                <>
                  {/* Show feedback progress */}
                  {(() => {
                    const totalItems = activeOrder.items.length
                    const reviewedItems = activeOrder.items.filter(item => item.feedbackSubmitted).length
                    const hasUnreviewedItems = reviewedItems < totalItems
                    
                    return (
                      <div className="space-y-2 mt-4">
                        {/* Mark as Picked Up button */}
                        {onMarkAsPickedUp && (
                          <Button
                            onClick={() => onMarkAsPickedUp(activeOrder._id)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            Mark as Picked Up
                          </Button>
                        )}
                        
                        {/* Feedback progress and button */}
                        {hasUnreviewedItems ? (
                          <>
                            {reviewedItems > 0 && (
                              <p className="text-xs text-gray-600 text-center">
                                {reviewedItems} of {totalItems} items reviewed
                              </p>
                            )}
                            <Button
                              onClick={() => onGiveFeedback(activeOrder._id)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                              size="sm"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {reviewedItems > 0 ? "Review More Items" : "Give Feedback"}
                            </Button>
                          </>
                        ) : (
                          <div className="p-3 bg-white rounded-lg border text-center">
                            <p className="text-xs font-medium text-emerald-600 mb-1">
                              All items reviewed
                            </p>
                            <div className="flex justify-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600">Thank you!</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No active orders</p>
            <p className="text-xs text-gray-400 mt-1">Place an order to see it here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
