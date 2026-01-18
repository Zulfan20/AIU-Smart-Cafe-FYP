"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, TrendingUp, TrendingDown, Filter, ThumbsUp, ThumbsDown, Award, Utensils } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Feedback {
  _id: string
  userId: {
    _id: string
    name: string
    profilePic?: string
  } | null
  itemId: {
    _id: string
    name: string
  } | null
  orderId: string
  rating: number
  textReview?: string
  sentimentCategory?: string
  sentimentScore?: number
  createdAt: string
}

interface MenuItem {
  _id: string
  name: string
  averageRating: number
  reviewCount: number
  positiveCount: number
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ratingFilter, setRatingFilter] = useState("all")
  const [sentimentFilter, setSentimentFilter] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterFeedbacks()
  }, [feedbacks, ratingFilter, sentimentFilter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}

      // Load feedbacks
      const feedbackResponse = await fetch('/api/feedback', { headers })
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json()
        setFeedbacks(feedbackData)
      }

      // Load menu items with ratings
      const menuResponse = await fetch('/api/menu')
      if (menuResponse.ok) {
        const menuData = await menuResponse.json()
        // Calculate positive sentiment count for each item
        const itemsWithStats = menuData.map((item: any) => ({
          ...item,
          positiveCount: 0 // Will be calculated from feedbacks
        }))
        setMenuItems(itemsWithStats)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterFeedbacks = () => {
    let filtered = [...feedbacks]

    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter)
      filtered = filtered.filter(f => f.rating === rating)
    }

    if (sentimentFilter !== "all") {
      filtered = filtered.filter(f => 
        f.sentimentCategory?.toLowerCase() === sentimentFilter.toLowerCase()
      )
    }

    setFilteredFeedbacks(filtered)
  }

  // Calculate stats from real data
  const stats = {
    totalReviews: feedbacks.length,
    averageRating: feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : '0.0',
    positive: feedbacks.filter(f => f.sentimentCategory === 'Positive').length,
    negative: feedbacks.filter(f => f.sentimentCategory === 'Negative').length,
    neutral: feedbacks.filter(f => f.sentimentCategory === 'Neutral').length,
  }

  const positivePercentage = stats.totalReviews > 0 
    ? Math.round((stats.positive / stats.totalReviews) * 100) 
    : 0

  const negativePercentage = stats.totalReviews > 0 
    ? Math.round((stats.negative / stats.totalReviews) * 100) 
    : 0

  // Calculate sentiment trends (last 4 weeks from feedbacks)
  const getSentimentTrends = () => {
    const now = new Date()
    const weeks = []
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7 + 7))
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() - (i * 7))
      
      const weekFeedbacks = feedbacks.filter(f => {
        const feedbackDate = new Date(f.createdAt)
        return feedbackDate >= weekStart && feedbackDate <= weekEnd
      })
      
      weeks.push({
        name: `Week ${4 - i}`,
        positive: weekFeedbacks.filter(f => f.sentimentCategory === 'Positive').length,
        neutral: weekFeedbacks.filter(f => f.sentimentCategory === 'Neutral').length,
        negative: weekFeedbacks.filter(f => f.sentimentCategory === 'Negative').length,
      })
    }
    
    return weeks
  }

  const sentimentData = getSentimentTrends()

  // Get top rated item from menu items
  const topRatedItem = menuItems.reduce((best, item) => {
    if (!best || (item.averageRating > best.averageRating && item.reviewCount > 0)) {
      return item
    }
    return best
  }, null as MenuItem | null)

  // Calculate positive mentions for top item
  const topItemPositiveMentions = topRatedItem 
    ? feedbacks.filter(f => 
        f.itemId && f.itemId._id === topRatedItem._id && 
        f.sentimentCategory === 'Positive'
      ).length
    : 0

  const getSentimentColor = (sentiment?: string) => {
    switch(sentiment) {
      case 'Positive': return 'bg-emerald-100 text-emerald-700'
      case 'Negative': return 'bg-red-100 text-red-700'
      case 'Neutral': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch(sentiment) {
      case 'Positive': return <TrendingUp className="w-3 h-3" />
      case 'Negative': return <TrendingDown className="w-3 h-3" />
      default: return <MessageSquare className="w-3 h-3" />
    }
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Feedback & Analytics</h2>
        <p className="text-gray-500 mt-1">Monitor customer reviews, ratings, and sentiment trends</p>
      </div>

      {/* Top Stats Grid - Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(parseFloat(stats.averageRating))
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-100 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Positive</CardTitle>
            <ThumbsUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{positivePercentage}%</div>
            <p className="text-xs text-emerald-600">{stats.positive} of {stats.totalReviews} reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-100 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Negative</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{negativePercentage}%</div>
            <p className="text-xs text-red-600">{stats.negative} requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Trends & Top Rated Item */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Sentiment Bar Chart Section */}
        <Card className="col-span-4 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Sentiment Trends</CardTitle>
            <CardDescription>Distribution of customer sentiment over the last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sentimentData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    cursor={{fill: '#f3f4f6'}}
                  />
                  <Bar dataKey="positive" name="Positive" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#9ca3af" />
                  <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Rated Food Section */}
        <Card className="col-span-3 bg-gradient-to-br from-white to-amber-50/50 border-amber-100/50 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-amber-900">Star of the Menu</CardTitle>
            </div>
            <CardDescription>Highest rated item based on customer feedback</CardDescription>
          </CardHeader>
          <CardContent>
            {topRatedItem ? (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <span className="text-4xl">🍽️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{topRatedItem.name}</h3>
                <div className="flex items-center gap-1 mt-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(topRatedItem.averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-1 text-gray-600">
                    ({topRatedItem.averageRating.toFixed(1)})
                  </span>
                </div>
                <p className="text-sm text-gray-600">{topRatedItem.reviewCount} reviews</p>
                <div className="mt-6 w-full pt-4 border-t border-amber-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Positive Mentions</span>
                    <span className="font-bold text-emerald-600">{topItemPositiveMentions}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No reviews yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            <div className="flex gap-3">
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Sentiments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Recent Customer Reviews */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Customer Reviews ({filteredFeedbacks.length})</CardTitle>
          <CardDescription>AI-analyzed feedback from students</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading feedbacks...</p>
          ) : filteredFeedbacks.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No feedback found</p>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => {
                // Handle null userId case (user might have been deleted)
                const userName = feedback.userId?.name || 'Unknown User';
                const userProfilePic = feedback.userId?.profilePic;
                const itemName = feedback.itemId?.name || 'Unknown Item';
                
                return (
                  <div
                    key={feedback._id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {userProfilePic ? (
                          <img
                            src={userProfilePic}
                            alt={userName}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-700 font-semibold text-sm">
                              {userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{userName}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                              <Utensils className="w-3 h-3 mr-1 text-gray-500" />
                              {itemName}
                            </div>
                          </div>
                        <p className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {feedback.sentimentCategory && (
                        <Badge className={getSentimentColor(feedback.sentimentCategory)}>
                          {getSentimentIcon(feedback.sentimentCategory)}
                          <span className="ml-1">{feedback.sentimentCategory}</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="ml-13 space-y-2">
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
                        {feedback.rating} / 5
                      </span>
                    </div>

                    {feedback.textReview && (
                      <p className="text-gray-700 text-sm mt-2 p-3 bg-gray-50 rounded-lg">
                        "{feedback.textReview}"
                      </p>
                    )}

                    {feedback.sentimentScore !== undefined && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Sentiment Score: {feedback.sentimentScore.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
