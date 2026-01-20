import { NextResponse } from 'next/server';
import axios from 'axios';
import dbConnect from '@/lib/dbConnect';
import MenuItem from '@/models/menuItem.model';
import { verifyAuth } from '@/lib/verifyAuth';
import mongoose from 'mongoose';

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && (String(new mongoose.Types.ObjectId(id)) === id);
}

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  try {
    const userId = auth.user._id;
    const mlServiceUrl = process.env.SENTIMENT_SERVICE_URL || 'http://127.0.0.1:5001';

    console.log('=== Recommendations API Called ===');
    console.log('User ID:', userId);
    console.log('ML Service URL:', mlServiceUrl);

    let recommendedKeys = [];
    let mlStatus = 'not_called';
    try {
      // Updated service on port 5001: POST /recommend with JSON body { user_id } (ai_service1.py)
      console.log('Calling ML service (ai_service1.py on port 5001)...');
      const mlResponse = await axios.post(`${mlServiceUrl}/recommend`, { user_id: String(userId) }, { timeout: 5000 });
      console.log('ML Response received:', JSON.stringify(mlResponse.data));
      mlStatus = mlResponse.data.status || 'success';
      if (mlResponse.data && Array.isArray(mlResponse.data.recommendations)) {
        recommendedKeys = mlResponse.data.recommendations;
        console.log('ML Recommended Keys:', recommendedKeys);
      }
    } catch (mlError) {
      console.error('ML Recommendation Service Error:', mlError.message);
      console.error('Error details:', mlError.code || 'no code');
      mlStatus = 'error';
    }

    let items = [];

    if (recommendedKeys.length > 0) {
      console.log('Attempting to match ML recommendations in database...');
      
      // Check if recommendations are ObjectIds or names
      const firstKey = recommendedKeys[0];
      const areObjectIds = isValidObjectId(firstKey);
      
      console.log('Recommendations are:', areObjectIds ? 'ObjectIDs' : 'Names');

      if (areObjectIds) {
        // Match by MongoDB _id
        items = await MenuItem.find({ _id: { $in: recommendedKeys }, isAvailable: true });
        console.log('Matched by ID:', items.length, 'items');
      } else {
        // Match by unique name (case-insensitive)
        items = await MenuItem.find({ 
          name: { $in: recommendedKeys }, 
          isAvailable: true 
        });
        console.log('Matched by name:', items.length, 'items');
        
        // Preserve the order from ML service
        if (items.length > 0) {
          const itemMap = new Map(items.map(item => [item.name, item]));
          items = recommendedKeys
            .map(name => itemMap.get(name))
            .filter(item => item !== undefined);
          console.log('Reordered items to match ML order:', items.length, 'items');
        }
      }
    } else {
      console.log('No recommendations from ML service, using fallback');
    }

    // Cold start fallback: popular/available items
    if (items.length === 0) {
      console.log('Using top-rated fallback...');
      items = await MenuItem.find({ isAvailable: true })
        .sort({ averageRating: -1, feedbackCount: -1, createdAt: -1 })
        .limit(3);
      console.log('Found', items.length, 'top-rated items');
    }

    // Absolute safety net: if still empty, return the latest 3 items
    if (items.length === 0) {
      console.log('Using latest items fallback...');
      items = await MenuItem.find({}).sort({ createdAt: -1 }).limit(3);
      console.log('Found', items.length, 'latest items');
    }

    console.log('Final recommendations count:', items.length);
    console.log('ML Status:', mlStatus);
    
    // Add ratings and review counts to recommendations (same as menu API)
    const Feedback = (await import('@/models/feedback.model')).default;
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
    
    return NextResponse.json({ 
      recommendations: itemsWithRatings,
      mlStatus: mlStatus,
      debug: {
        mlServiceCalled: mlStatus !== 'not_called',
        mlRecommendations: recommendedKeys.length,
        finalCount: itemsWithRatings.length
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Recommendation API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}