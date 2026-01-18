"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Feedback {
  _id: string
  userId: {
    _id: string
    name: string
    profilePic?: string
  }
  itemId: {
    _id: string
    name: string
  }
  rating: number
  textReview: string
  sentimentScore: number
  sentimentCategory: string
  createdAt: string
}

interface ReviewsDialogProps {
  isOpen: boolean
  itemId: string | null
  itemName: string
  onClose: () => void
}

export function ReviewsDialog({ isOpen, itemId, itemName, onClose }: ReviewsDialogProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && itemId) {
      loadFeedbacks()
    }
  }, [isOpen, itemId])

  const loadFeedbacks = async () => {
    if (!itemId) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Fetching feedbacks for itemId:', itemId)
      const response = await fetch(`/api/feedback?itemId=${itemId}`)
      if (!response.ok) throw new Error('Failed to load reviews')
      
      const data = await response.json()
      console.log('Feedbacks response:', data)
      // API returns array directly, not wrapped in object
      setFeedbacks(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Error loading feedbacks:', err)
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getSentimentBadgeColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      case 'neutral':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Reviews for {itemName}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && feedbacks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this item!
          </div>
        )}

        {!loading && !error && feedbacks.length > 0 && (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={feedback.userId.profilePic} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-600">
                        {feedback.userId.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {feedback.userId.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(feedback.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= feedback.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({feedback.rating}/5)
                  </span>
                </div>

                {feedback.textReview && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {feedback.textReview}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
