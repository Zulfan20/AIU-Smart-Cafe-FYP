import { NextResponse } from 'next/server';
import axios from 'axios';
import dbConnect from '@/lib/dbConnect';
import MenuItem from '@/models/menuItem.model';
import { verifyAuth } from '@/lib/verifyAuth';

// GET: Fetch Personalized Recommendations (Requires Login)
export async function GET(request) {
  // ---=== 1. SECURITY CHECK ===---
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---========================---

  await dbConnect();

  try {
    const userId = auth.user._id;
    let recommendedItemIds = [];

    // 2. Call Python ML Service to get ID list
    try {
      const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';
      
      // Example call: GET http://127.0.0.1:5000/recommend/654abc...
      const mlResponse = await axios.get(`${mlServiceUrl}/recommend/${userId}`);
      
      // Expecting response format: { recommendations: ["id1", "id2", "id3"] }
      if (mlResponse.data && Array.isArray(mlResponse.data.recommendations)) {
        recommendedItemIds = mlResponse.data.recommendations;
      }
      
    } catch (mlError) {
      console.error('ML Recommendation Service Error:', mlError.message);
      // FAIL-SAFE: If ML is down, we don't crash. We just return an empty list 
      // or we could fetch "Popular Items" as a fallback (optional).
    }

    // 3. "Hydrate" the IDs (Fetch full details from MongoDB)
    // We need the Name, Image, Price, etc. to show cards on the frontend.
    let items = [];

    if (recommendedItemIds.length > 0) {
        // Find all items where the _id is IN the recommended list
        items = await MenuItem.find({
            _id: { $in: recommendedItemIds },
            isAvailable: true // Only show if currently available
        });
    } 

    // Optional: If ML returns nothing (cold start), return top 3 items as fallback
    if (items.length === 0) {
        items = await MenuItem.find({ isAvailable: true }).limit(3);
    }

    return NextResponse.json({ recommendations: items }, { status: 200 });

  } catch (error) {
    console.error('Recommendation API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}