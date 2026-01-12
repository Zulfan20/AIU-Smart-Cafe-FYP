import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, TrendingUp } from "lucide-react"
import type { MenuItem } from "@/types/dashboard"

interface BestSellerItemsProps {
  items: (MenuItem & { rating?: number; reviewCount?: number })[]
  onAddToCart: (item: MenuItem) => void
  onViewReviews?: (itemId: string, itemName: string) => void
}

export function BestSellerItems({ items, onAddToCart, onViewReviews }: BestSellerItemsProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-yellow-50">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          Best Sellers
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">Most loved by our customers</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No best sellers yet</p>
            <p className="text-xs text-gray-400 mt-1">Check back soon for popular items</p>
          </div>
        ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const displayImage = item.imageUrl || `/menu/${item._id}.png`
            return (
              <div key={item._id} className="flex gap-3 p-3 rounded-lg border-0 hover:shadow-md transition">
                <img
                  src={displayImage}
                  alt={item.name}
                  className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/menu/placeholder.png'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-balance line-clamp-2">{item.name}</h4>
                  <div className="flex items-center gap-2 my-1">
                    <span className="text-sm font-bold text-emerald-600">RM{item.price.toFixed(2)}</span>
                    {item.rating && item.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{item.rating.toFixed(1)}</span>
                        {item.reviewCount && item.reviewCount > 0 && (
                          <span className="text-xs text-gray-400">({item.reviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(item)}
                    disabled={!item.isAvailable}
                    className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs px-4 disabled:opacity-50"
                  >
                    {item.isAvailable ? "Add" : "N/A"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </CardContent>
    </Card>
  )
}
