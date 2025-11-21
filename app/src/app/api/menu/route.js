import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MenuItem from '@/models/menuItem.model';

// GET: Fetch menu items (Public - No Auth Required)
// Supports filtering: /api/menu?category=Drink&search=nasi&maxPrice=10
export async function GET(request) {
  await dbConnect();

  try {
    // 1. Parse Query Parameters from the URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const maxPrice = searchParams.get('maxPrice');
    
    // 2. Build the MongoDB Query Object
    const query = {
      isAvailable: true, // Default: Only show items that are currently available
    };

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

    return NextResponse.json(items, { status: 200 });

  } catch (error) {
    console.error('Public Menu GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
