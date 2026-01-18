import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingCart } from "lucide-react"
import type { CartItem } from "@/types/dashboard"

interface CartDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  cartTotal: number
  cartItemCount: number
  orderInstructions: string
  onOrderInstructionsChange: (value: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onPlaceOrder: () => void
}

export function CartDialog({
  isOpen,
  onOpenChange,
  cart,
  cartTotal,
  cartItemCount,
  orderInstructions,
  onOrderInstructionsChange,
  onUpdateQuantity,
  onPlaceOrder,
}: CartDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                <div key={item._id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-balance">{item.name}</h4>
                    <p className="text-sm text-gray-600">RM{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item._id, quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item._id, quantity + 1)}
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
                  onChange={(e) => onOrderInstructionsChange(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <Separator />
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total</span>
                <span className="text-emerald-600">RM{cartTotal.toFixed(2)}</span>
              </div>
              <Button onClick={onPlaceOrder} className="w-full bg-emerald-600 hover:bg-emerald-700">
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
  )
}
