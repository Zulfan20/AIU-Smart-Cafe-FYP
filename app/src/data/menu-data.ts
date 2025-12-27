import type { MenuItem } from "@/types/dashboard"

// Categories available in the system (matching backend)
export const categories = ["All", "Main Course", "Drink", "Snack", "Side"]

// Helper function to transform DB MenuItem to display format
export function transformMenuItem(dbItem: any): MenuItem & { 
  rating?: number; 
  prepTime?: number; 
  isRecommended?: boolean;
  image?: string;
  description?: string;
  available?: boolean;
  reviewCount?: number;
} {
  return {
    _id: dbItem._id,
    name: dbItem.name,
    description: dbItem.description || `${dbItem.name} from the AIU Smart Café menu.`,
    price: dbItem.price,
    category: dbItem.category,
    imageUrl: dbItem.imageUrl,
    isAvailable: dbItem.isAvailable,
    // Display helpers (computed client-side or from API)
    image: dbItem.imageUrl || `/menu/${dbItem._id}.png`,
    available: dbItem.isAvailable,
    rating: dbItem.averageRating || 0, // From API feedback aggregation
    reviewCount: dbItem.reviewCount || 0, // From API feedback count
    prepTime: 15, // Can be estimated or added to DB later
    createdAt: dbItem.createdAt,
    updatedAt: dbItem.updatedAt,
  }
}
