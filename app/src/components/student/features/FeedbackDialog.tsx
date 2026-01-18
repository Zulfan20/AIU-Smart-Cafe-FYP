"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"

interface OrderItem {
  itemId: string
  name: string
  quantity: number
  price: number
  feedbackSubmitted?: boolean
}

interface Order {
  _id: string
  items: OrderItem[]
}

interface ItemFeedback {
  itemId: string
  rating: number
  comment: string
}

interface FeedbackDialogProps {
  isOpen: boolean
  order: Order | null
  onSubmit: (feedbacks: ItemFeedback[]) => void
  onCancel: () => void
}

export function FeedbackDialog({
  isOpen,
  order,
  onSubmit,
  onCancel,
}: FeedbackDialogProps) {
  const [itemFeedbacks, setItemFeedbacks] = useState<Map<string, ItemFeedback>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when dialog opens with new order
  useEffect(() => {
    if (isOpen && order) {
      const initialFeedbacks = new Map<string, ItemFeedback>()
      order.items.forEach((item) => {
        if (!item.feedbackSubmitted) {
          initialFeedbacks.set(item.itemId, {
            itemId: item.itemId,
            rating: 0,
            comment: "",
          })
        }
      })
      setItemFeedbacks(initialFeedbacks)
    }
  }, [isOpen, order])

  const updateItemRating = (itemId: string, rating: number) => {
    setItemFeedbacks((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(itemId) || { itemId, rating: 0, comment: "" }
      newMap.set(itemId, { ...current, rating })
      return newMap
    })
  }

  const updateItemComment = (itemId: string, comment: string) => {
    setItemFeedbacks((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(itemId) || { itemId, rating: 0, comment: "" }
      newMap.set(itemId, { ...current, comment })
      return newMap
    })
  }

  const handleSubmit = async () => {
    if (!order) return

    const feedbacksToSubmit = Array.from(itemFeedbacks.values()).filter(
      (feedback) => feedback.rating > 0
    )

    if (feedbacksToSubmit.length === 0) {
      alert("Please rate at least one item before submitting")
      return
    }

    setIsSubmitting(true)
    await onSubmit(feedbacksToSubmit)
    setIsSubmitting(false)
  }

  const itemsNeedingFeedback = order?.items.filter((item) => !item.feedbackSubmitted) || []
  const totalRated = Array.from(itemFeedbacks.values()).filter((f) => f.rating > 0).length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Give Feedback for Your Order</DialogTitle>
        </DialogHeader>

        {itemsNeedingFeedback.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            All items in this order have already been reviewed. Thank you!
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <p className="text-sm text-gray-600">
              Rate each item to help us improve our service ({totalRated} of{" "}
              {itemsNeedingFeedback.length} rated)
            </p>

            {itemsNeedingFeedback.map((item) => {
              const feedback = itemFeedbacks.get(item.itemId) || {
                itemId: item.itemId,
                rating: 0,
                comment: "",
              }

              return (
                <div
                  key={item.itemId}
                  className="border rounded-lg p-4 space-y-4 bg-gray-50"
                >
                  {/* Item Info */}
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Rating *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateItemRating(item.itemId, star)}
                          className="transition-colors"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= feedback.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Comment (Optional)
                    </label>
                    <Textarea
                      placeholder="Share your experience with this item..."
                      value={feedback.comment}
                      onChange={(e) =>
                        updateItemComment(item.itemId, e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </div>
              )
            })}

            {/* Submit / Cancel */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={totalRated === 0 || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? "Submitting..." : `Submit ${totalRated} Review${totalRated !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
