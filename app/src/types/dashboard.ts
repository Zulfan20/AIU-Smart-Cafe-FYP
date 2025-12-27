// Database models aligned with backend
export interface MenuItem {
  _id: string
  name: string
  description?: string
  price: number
  category: string
  imageUrl?: string
  isAvailable: boolean
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem {
  itemId: string
  name: string
  quantity: number
  price: number
  feedbackSubmitted?: boolean
  feedback?: Feedback | null
}

export interface Order {
  _id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: "Pending" | "Rejected" | "Preparing" | "Ready" | "Completed"
  staffId?: string
  createdAt: string
  updatedAt: string
  // Client-side only fields
  canGiveFeedback?: boolean
  feedback?: Feedback
}

export interface Feedback {
  _id?: string
  userId: string
  itemId: string
  orderId: string
  rating: number
  textReview?: string
  sentimentScore?: number
  sentimentCategory?: "Positive" | "Negative" | "Neutral" | null
  createdAt?: string
  updatedAt?: string
}

export interface StudentProfile {
  _id?: string
  name: string
  email: string
  role: "student" | "staff" | "admin"
  createdAt?: string
  updatedAt?: string
  // Additional profile fields (can be extended)
  studentId?: string
  bio?: string
  gender?: string
  birthday?: string
  phone?: string
  profilePic?: string
}

export interface CartItem {
  item: MenuItem
  quantity: number
}
