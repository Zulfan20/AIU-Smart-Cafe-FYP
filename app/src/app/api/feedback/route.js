import { NextResponse } from 'next/server';
import axios from 'axios'; // Used to call the Python ML Service
import dbConnect from '@/lib/dbConnect';
import Feedback from '@/models/feedback.model';
import { verifyAuth } from '@/lib/verifyAuth';

// POST: Submit Feedback & Analyze Sentiment (Requires Login)
export async function POST(request) {
  // ---=== 1. SECURITY CHECK ===---
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ---========================---

  await dbConnect();

  try {
    const { itemId, orderId, rating, textReview } = await request.json();

    // Validation
    if (!itemId || !orderId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Save Initial Feedback to MongoDB
    // We save it BEFORE calling the ML service. This ensures that even if the 
    // ML service crashes or is offline, we don't lose the user's rating.
    const newFeedback = new Feedback({
      userId: auth.user._id,
      itemId,
      orderId,
      rating,
      textReview: textReview || '', // Handle empty text
    });

    await newFeedback.save();

    // 3. Call Python ML Service (If text exists)
    // Only run sentiment analysis if the user actually typed something.
    if (textReview && textReview.trim().length > 0) {
      try {
        // Get the URL from .env (e.g., https://aiu-cafe-ml.onrender.com)
        // Fallback to localhost for development
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';
        
        console.log(`Calling ML Service at: ${mlServiceUrl}/predict/sentiment`);

        const mlResponse = await axios.post(`${mlServiceUrl}/predict/sentiment`, {
          text: textReview
        });

        // 4. Update the Feedback with ML Results
        if (mlResponse.data) {
          newFeedback.sentimentScore = mlResponse.data.sentimentScore || 0; // Assuming your API returns this
          newFeedback.sentimentCategory = mlResponse.data.sentiment; // e.g., "Positive"
          
          await newFeedback.save(); // Save the update
        }

      } catch (mlError) {
        // CRITICAL: We catch ML errors separately. 
        // If the Python server is sleeping (Render free tier) or down, 
        // we just log it and continue. We DO NOT fail the user's request.
        console.error('ML Service Connection Error:', mlError.message);
      }
    }

    return NextResponse.json({ 
      message: 'Feedback submitted successfully', 
      feedback: newFeedback 
    }, { status: 201 });

  } catch (error) {
    console.error('Feedback POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
