import { NextResponse } from 'next/server';
import axios from 'axios'; // Used to call the Python ML Service
import dbConnect from '@/lib/dbConnect';
import Feedback from '@/models/feedback.model';
import { verifyAuth } from '@/lib/verifyAuth';

// GET: Fetch all feedbacks (Public - for displaying reviews)
export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    const query = itemId ? { itemId } : {};
    
    const feedbacks = await Feedback.find(query)
      .populate('userId', 'name profilePic')
      .populate('itemId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(feedbacks, { status: 200 });
  } catch (error) {
    console.error('Feedback GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Check if feedback already exists for this user, order, and item
    const existingFeedback = await Feedback.findOne({
      userId: auth.user._id,
      orderId,
      itemId,
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'You have already submitted feedback for this item' },
        { status: 400 }
      );
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

    // 3. Update the order to mark this item as having feedback
    const Order = (await import('@/models/order.model')).default;
    await Order.updateOne(
      { _id: orderId, 'items.itemId': itemId },
      { $set: { 'items.$.feedbackSubmitted': true } }
    );

    // 3. Call Python ML Service (If text exists)
    // Only run sentiment analysis if the user actually typed something.
    if (textReview && textReview.trim().length > 0) {
      try {
        // Get the URL from .env (e.g., https://aiu-cafe-ml.onrender.com)
        // Fallback to localhost for development
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';
        
        console.log(`[SENTIMENT] Calling ML Service at: ${mlServiceUrl}/analyze_feedback`);
        console.log(`[SENTIMENT] Text review: "${textReview}"`);

        const mlResponse = await axios.post(`${mlServiceUrl}/analyze_feedback`, {
          comment: textReview
        }, { timeout: 5000 });

        console.log(`[SENTIMENT] ML Response:`, mlResponse.data);

        // 5. Update the Feedback with ML Results
        if (mlResponse.data) {
          newFeedback.sentimentScore = mlResponse.data.confidence || 0; // Confidence score (0-1)
          newFeedback.sentimentCategory = mlResponse.data.sentiment; // "Positive", "Negative", or "Neutral"
          
          console.log(`[SENTIMENT] Analysis: ${mlResponse.data.sentiment} (${Math.round(mlResponse.data.confidence * 100)}% confidence)`);
          console.log(`[SENTIMENT] Saving to database...`);
          
          await newFeedback.save(); // Save the update
          
          console.log(`[SENTIMENT] ✓ Saved successfully with category: ${newFeedback.sentimentCategory}`);
        }

      } catch (mlError) {
        // CRITICAL: We catch ML errors separately. 
        // If the Python server is sleeping (Render free tier) or down, 
        // we just log it and continue. We DO NOT fail the user's request.
        console.error('[SENTIMENT] ML Service Connection Error:', mlError.message);
        console.error('[SENTIMENT] Error details:', {
          url: mlError.config?.url,
          code: mlError.code,
          response: mlError.response?.data
        });
      }
    } else {
      console.log('[SENTIMENT] Skipping - no text review provided');
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
