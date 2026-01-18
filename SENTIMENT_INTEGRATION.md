# Sentiment Analysis Integration Guide

## Overview
The sentiment analysis model (`sentiment_model.h5`) analyzes user feedback text reviews and classifies them as Positive, Negative, or Neutral.

## How It Works

### 1. Data Flow
```
User submits feedback with text review
    ↓
Feedback saved to MongoDB
    ↓
Text sent to ML service: POST /analyze_feedback
    ↓
Sentiment model analyzes the text
    ↓
Returns: sentiment (Positive/Negative/Neutral) + confidence (0-1)
    ↓
Feedback updated with sentimentCategory and sentimentScore
```

### 2. ML Service Endpoint

**URL:** `http://127.0.0.1:5000/analyze_feedback`

**Method:** POST

**Request Body:**
```json
{
  "comment": "The food was absolutely delicious!"
}
```

**Response:**
```json
{
  "comment": "The food was absolutely delicious!",
  "sentiment": "Positive",
  "confidence": 0.95
}
```

### 3. Database Schema

The Feedback model stores sentiment analysis results:

```javascript
{
  userId: ObjectId,
  itemId: ObjectId,
  orderId: ObjectId,
  rating: Number (1-5),
  textReview: String (optional),
  sentimentScore: Number,      // ML confidence (0-1)
  sentimentCategory: String,   // "Positive", "Negative", or "Neutral"
  timestamps: true
}
```

## Setup Instructions

### 1. Start the ML Service

```bash
cd ML-models
python ai_service.py
```

Or use the batch file:
```bash
cd ML-models
start_ai_service.bat
```

The service needs these files:
- `sentiment_model.h5` - The trained sentiment model
- `tokenizer.pkl` - Text tokenizer for preprocessing
- `recommender_model.h5` - Recommendation model (optional)
- `user_encoder.pkl` - User encoder (optional)
- `item_encoder.pkl` - Item encoder (optional)

### 2. Configure Environment Variables

In your `app/.env.local`:
```env
ML_SERVICE_URL=http://127.0.0.1:5000
```

### 3. Test the Integration

**Submit feedback with text review:**
```javascript
// From frontend
const response = await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    itemId: '507f1f77bcf86cd799439011',
    orderId: '507f1f77bcf86cd799439012',
    rating: 5,
    textReview: 'Amazing food! Really enjoyed it.'
  })
});
```

**Check the feedback in database:**
```javascript
// The saved feedback will include:
{
  rating: 5,
  textReview: "Amazing food! Really enjoyed it.",
  sentimentScore: 0.98,          // High confidence
  sentimentCategory: "Positive"  // Detected sentiment
}
```

## Features

### 1. Automatic Sentiment Analysis
- When users submit text reviews, sentiment is automatically analyzed
- Works with any length of text
- No impact on user experience (runs in background)

### 2. Graceful Degradation
- If ML service is down, feedback is still saved
- Only the sentiment fields will be null
- User never sees an error

### 3. Sentiment Categories
- **Positive**: Happy, satisfied, complimentary reviews
- **Negative**: Complaints, dissatisfaction, criticism
- **Neutral**: Factual statements, mixed feelings

### 4. Confidence Score
- Range: 0 to 1
- Higher = more confident prediction
- Useful for filtering unreliable predictions

## Using Sentiment Data

### 1. Display Sentiment Badges
```javascript
// In your feedback display component
{feedback.sentimentCategory && (
  <Badge variant={
    feedback.sentimentCategory === 'Positive' ? 'success' :
    feedback.sentimentCategory === 'Negative' ? 'destructive' : 'secondary'
  }>
    {feedback.sentimentCategory}
  </Badge>
)}
```

### 2. Filter by Sentiment
```javascript
// Get only positive reviews
const positiveReviews = await Feedback.find({
  itemId: itemId,
  sentimentCategory: 'Positive'
});
```

### 3. Analytics Dashboard
```javascript
// Calculate sentiment distribution
const sentimentStats = await Feedback.aggregate([
  { $match: { itemId: itemId } },
  { $group: {
    _id: '$sentimentCategory',
    count: { $sum: 1 },
    avgRating: { $avg: '$rating' }
  }}
]);
```

### 4. Identify Issues Early
```javascript
// Find items with many negative reviews
const problematicItems = await Feedback.aggregate([
  { $match: { sentimentCategory: 'Negative' } },
  { $group: {
    _id: '$itemId',
    negativeCount: { $sum: 1 }
  }},
  { $sort: { negativeCount: -1 } }
]);
```

## Testing the Sentiment Model

### Test from Terminal
```bash
curl -X POST http://127.0.0.1:5000/analyze_feedback \
  -H "Content-Type: application/json" \
  -d '{"comment": "The food was amazing and fresh!"}'
```

Expected response:
```json
{
  "comment": "The food was amazing and fresh!",
  "sentiment": "Positive",
  "confidence": 0.92
}
```

### Test with Different Sentiments
```bash
# Positive
curl -X POST http://127.0.0.1:5000/analyze_feedback \
  -H "Content-Type: application/json" \
  -d '{"comment": "Excellent service and delicious food!"}'

# Negative
curl -X POST http://127.0.0.1:5000/analyze_feedback \
  -H "Content-Type: application/json" \
  -d '{"comment": "Food was cold and service was slow"}'

# Neutral
curl -X POST http://127.0.0.1:5000/analyze_feedback \
  -H "Content-Type: application/json" \
  -d '{"comment": "The portion size was standard"}'
```

## Troubleshooting

### ML Service Not Responding
- Ensure `ai_service.py` is running: `python ai_service.py`
- Check port 5000 is not in use
- Verify `sentiment_model.h5` and `tokenizer.pkl` exist

### Sentiment Always Null
- Check ML service logs for errors
- Verify `ML_SERVICE_URL` in `.env.local`
- Ensure textReview is not empty

### Wrong Sentiment Detected
- Model accuracy depends on training data
- Check confidence score (low confidence = uncertain)
- Consider retraining with more diverse data

## Production Deployment

1. Deploy ML service to a cloud platform (Render, Railway, etc.)
2. Update `ML_SERVICE_URL` to production URL
3. Consider adding caching for frequently analyzed phrases
4. Monitor ML service uptime and response times
5. Set up alerts for sentiment analysis failures

## Benefits

✅ **Better Customer Insights** - Understand customer satisfaction beyond ratings  
✅ **Early Problem Detection** - Identify negative trends before they escalate  
✅ **Improved Menu Management** - Know which items customers truly love  
✅ **Enhanced Analytics** - Rich data for business intelligence  
✅ **Automated Moderation** - Flag potentially inappropriate reviews
