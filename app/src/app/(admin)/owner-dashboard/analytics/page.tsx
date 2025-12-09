"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, Star, Award, Utensils } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnalyticsPage() {
  
  // Mock Data for Sentiment Trends
  const sentimentData = [
    { name: 'Week 1', positive: 40, neutral: 20, negative: 5 },
    { name: 'Week 2', positive: 55, neutral: 15, negative: 8 },
    { name: 'Week 3', positive: 48, neutral: 25, negative: 4 },
    { name: 'Week 4', positive: 65, neutral: 10, negative: 3 },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h2>
        <p className="text-gray-500 mt-1">Deep dive into customer sentiment and feedback trends.</p>
      </div>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">Feedback & Sentiment</TabsTrigger>
        </TabsList>
        
        {/* --- FEEDBACK & SENTIMENT TAB --- */}
        <TabsContent value="feedback" className="space-y-4">
            {/* Top Level Sentiment Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Positive Sentiment Card */}
                <Card className="bg-emerald-50 border-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700">Positive Feedback</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">85%</div>
                        <p className="text-xs text-emerald-600">Based on 120 reviews</p>
                    </CardContent>
                </Card>

                {/* Negative Sentiment Card */}
                <Card className="bg-red-50 border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">Negative Feedback</CardTitle>
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">5%</div>
                        <p className="text-xs text-red-600">Requires attention</p>
                    </CardContent>
                </Card>

                {/* Total Reviews Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground">+12 this week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Sentiment Bar Chart Section */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sentiment Trends</CardTitle>
                        <CardDescription>Distribution of customer sentiment over the last month.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {/* Recharts Implementation */}
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={sentimentData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 0,
                                        bottom: 5,
                                    }}
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
                <Card className="col-span-3 bg-gradient-to-br from-white to-amber-50/50 border-amber-100/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-amber-900">Star of the Menu</CardTitle>
                        </div>
                        <CardDescription>Highest rated item this week based on sentiment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <span className="text-4xl">🍗</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Nasi Lemak Special</h3>
                            <div className="flex items-center gap-1 mt-2 mb-4">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium ml-1 text-gray-600">(4.9)</span>
                            </div>
                            <p className="text-sm text-gray-600 italic">"The sambal is perfect!"</p>
                            <div className="mt-6 w-full pt-4 border-t border-amber-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Positive Mentions</span>
                                    <span className="font-bold text-emerald-600">42</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Reviews List (NOW WITH ITEM NAMES) */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Customer Reviews</CardTitle>
                    <CardDescription>AI-analyzed feedback from students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { 
                                user: "Ali", 
                                item: "Nasi Lemak Special", // NEW FIELD
                                text: "The Nasi Lemak was amazing! Best on campus.", 
                                sentiment: "Positive" 
                            },
                            { 
                                user: "Sarah", 
                                item: "Iced Latte", // NEW FIELD
                                text: "Coffee was a bit cold today.", 
                                sentiment: "Negative" 
                            },
                            { 
                                user: "John", 
                                item: "Chicken Rice", // NEW FIELD
                                text: "Good portion size for the price.", 
                                sentiment: "Positive" 
                            },
                        ].map((review, i) => (
                            <div key={i} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-sm text-gray-900">{review.user}</p>
                                        <span className="text-xs text-gray-400">•</span>
                                        <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                            <Utensils className="w-3 h-3 mr-1 text-gray-500" />
                                            {review.item}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">"{review.text}"</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    review.sentiment === "Positive" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                }`}>
                                    {review.sentiment}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}