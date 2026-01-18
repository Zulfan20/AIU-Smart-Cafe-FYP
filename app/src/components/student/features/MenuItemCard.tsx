import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import type { MenuItem } from "@/types/dashboard"

interface MenuItemCardProps {
  item: MenuItem & { rating?: number; prepTime?: number; image?: string; available?: boolean; reviewCount?: number }
  onAddToCart: (item: MenuItem) => void
  onViewReviews?: (itemId: string, itemName: string) => void
}

export function MenuItemCard({ item, onAddToCart, onViewReviews }: MenuItemCardProps) {
  const displayImage = item.imageUrl || item.image || `/menu/placeholder.png`
  const isAvailable = item.isAvailable ?? item.available ?? true
  const rating = item.rating || 0
  const reviewCount = item.reviewCount || 0
  const prepTime = item.prepTime || 15

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        {/* Mobile View - Vertical Layout */}
        <div className="md:hidden flex flex-col">
          <div className="relative aspect-square">
            <img
              src={displayImage}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/menu/placeholder.png'
              }}
            />
          </div>
          <div className="p-3 flex flex-col gap-2">
            <h4 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{item.name}</h4>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-emerald-600">RM{item.price.toFixed(2)}</span>
              {reviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {reviewCount > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onViewReviews?.(item._id, item.name)
                }}
                className="text-xs text-gray-500 hover:text-emerald-600 hover:underline transition-colors text-left"
              >
                {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </button>
            )}
            <Button
              size="sm"
              onClick={() => onAddToCart(item)}
              disabled={!isAvailable}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-8 text-xs disabled:opacity-50 mt-1"
            >
              {isAvailable ? "Add to Cart" : "Unavailable"}
            </Button>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="relative aspect-square">
            <img
              src={displayImage}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/menu/placeholder.png'
              }}
            />
          </div>
          <div className="p-6">
            <h4 className="font-semibold text-xl text-balance mb-3 line-clamp-2">{item.name}</h4>
            {reviewCount > 0 ? (
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
                <span className="text-base text-gray-600 ml-1">({rating.toFixed(1)})</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewReviews?.(item._id, item.name)
                  }}
                  className="text-sm text-gray-500 hover:text-emerald-600 hover:underline transition-colors"
                >
                  • {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <span className="text-sm text-gray-500">No reviews yet - Be the first!</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-5">
              <span className="text-2xl font-bold text-gray-800">RM{item.price.toFixed(2)}</span>
            </div>
            <Button
              onClick={() => onAddToCart(item)}
              disabled={!isAvailable}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-5 disabled:opacity-50"
            >
              {isAvailable ? "Add to Cart" : "Unavailable"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
