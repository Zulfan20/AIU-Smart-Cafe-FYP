import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import type { MenuItem } from "@/types/dashboard"

interface RecommendedItemsProps {
  items: MenuItem[]
  onAddToCart: (item: MenuItem) => void
}

export function RecommendedItems({ items, onAddToCart }: RecommendedItemsProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-amber-50">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Recommended for You
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">AI-powered meal suggestions</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Loading recommendations...</p>
            <p className="text-xs text-gray-400 mt-1">Place some orders to get personalized suggestions</p>
          </div>
        ) : (
        <div className="space-y-4">
          {items.slice(0, 3).map((item) => {
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-7 text-xs disabled:opacity-50"
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
