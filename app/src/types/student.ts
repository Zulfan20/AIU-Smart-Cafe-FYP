export interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
  isAvailable: boolean
  rating?: number // Optional for now
  prepTime?: number // Optional for now
}

export interface CartItem {
  item: MenuItem
  quantity: number
}

export interface StudentProfile {
  name: string
  email: string
  role: string
}