import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MenuItem from '@/models/menuItem.model';
import Feedback from '@/models/feedback.model';

// GET: Fetch menu items (Public - No Auth Required)
// Supports filtering: /api/menu?category=Drink&search=nasi&maxPrice=10
// Supports showAll parameter for admin/owner to see unavailable items
export async function GET(request) {
  await dbConnect();

  try {
    // 1. Parse Query Parameters from the URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const maxPrice = searchParams.get('maxPrice');
    const showAll = searchParams.get('showAll'); // Admin/Owner can see all items
    
    // 2. Build the MongoDB Query Object
    const query = {};
    
    // Only filter by availability if NOT showing all (i.e., for public/student view)
    if (!showAll || showAll !== 'true') {
      query.isAvailable = true; // Default: Only show items that are currently available
    }

    // Add Category Filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Add Search Filter (Case-insensitive regex)
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Add Price Filter (Less than or equal to)
    if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
    }

    // 3. Fetch Data
    // Sort by category first, then name
    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });

    // 4. Fetch ratings and reviews count for each item
    const itemsWithRatings = await Promise.all(
      items.map(async (item) => {
        const feedbacks = await Feedback.find({ itemId: item._id });
        const avgRating = feedbacks.length > 0
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
          : 0;
        
        return {
          ...item.toObject(),
          averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
          reviewCount: feedbacks.length
        };
      })
    );

    return NextResponse.json(itemsWithRatings, { status: 200 });

  } catch (error) {
    console.error('Public Menu GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
