# AI/ML Service - Complete Documentation

## 🎯 Overview

This service provides two main AI features:
1. **Personalized Recommendations** - Smart food recommendations based on user behavior
2. **Sentiment Analysis** - Automatic analysis of customer feedback text

## 🚀 Quick Start

### Start the Service

```bash
cd ML-models
python ai_service.py
```

Or use the batch file:
```bash
cd ML-models
start_ai_service.bat
```

Service runs on: **http://127.0.0.1:5000**

### Test the Service

```bash
cd ML-models
python test_integration.py
```

## 📡 API Endpoints

### 1. Health Check: `GET /`

```bash
curl http://127.0.0.1:5000/
```

Response:
```json
{
  "status": "Online",
  "recommendation_engine": "Active (Hybrid)",
  "nlp_engine": "Active",
  "database": "Connected"
}
```

### 2. Get Recommendations: `POST /recommend`

```bash
curl -X POST http://127.0.0.1:5000/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_id": "507f1f77bcf86cd799439011"}'
```

Response:
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "recommendations": ["Chicken Burger", "Caesar Salad", "Chocolate Cake"],
  "status": "Personalized (Order History)"
}
```

### 3. Analyze Sentiment: `POST /analyze_feedback`

```bash
curl -X POST http://127.0.0.1:5000/analyze_feedback \
  -H "Content-Type: application/json" \
  -d '{"comment": "The food was amazing!"}'
```

Response:
```json
{
  "comment": "The food was amazing!",
  "sentiment": "Positive",
  "confidence": 0.95
}
```

## 🏗️ Architecture

### Recommendation System (Hybrid Approach)

**Strategy 1: Order History** (Most Accurate)
- Analyzes user's past purchases
- Considers ratings (4-5★ favorites, 1-2★ excluded)
- Recommends from favorite categories
- Suggests new similar items

**Strategy 2: ML Model** (Collaborative Filtering)
- Deep learning neural network
- Trained on user-item interactions
- Predicts ratings for unseen items

**Strategy 3: Popular Items** (Cold Start)
- Top-rated items across all users
- For new users without history

### Sentiment Analysis

- **Model**: Deep learning (trained on customer reviews)
- **Input**: Raw text from user feedback
- **Output**: Sentiment (Positive/Negative/Neutral) + Confidence (0-1)
- **Categories**:
  - **Positive**: Happy, satisfied, complimentary
  - **Negative**: Complaints, dissatisfaction
  - **Neutral**: Factual, mixed feelings

## 📁 Required Files

| File | Purpose |
|------|---------|
| `ai_service.py` | Main service (recommendations + sentiment) |
| `recommender_model.h5` | Recommendation neural network |
| `sentiment_model.h5` | Sentiment analysis model |
| `user_encoder.pkl` | User ID encoder |
| `item_encoder.pkl` | Item encoder |
| `tokenizer.pkl` | Text tokenizer for NLP |

## 🔗 Web App Integration

### Recommendations Integration

File: `app/src/app/api/recommendations/route.js`

```javascript
const mlResponse = await axios.post(`${mlServiceUrl}/recommend`, {
  user_id: String(userId)
});
```

### Sentiment Analysis Integration

File: `app/src/app/api/feedback/route.js`

```javascript
const mlResponse = await axios.post(`${mlServiceUrl}/analyze_feedback`, {
  comment: textReview
});
```

## 🧪 Testing

Run the integration tests:

```bash
python test_integration.py
```

Tests include:
- ✓ Service connectivity
- ✓ Sentiment analysis (5 test cases)
- ✓ Recommendations endpoint

## ⚙️ Configuration

### Environment Variables

```bash
# Optional: MongoDB connection for hybrid recommendations
set MONGODB_URI=mongodb://localhost:27017/aiu-smart-cafe
```

### Web App Configuration

Add to `app/.env.local`:
```env
ML_SERVICE_URL=http://127.0.0.1:5000
```

## 🐛 Troubleshooting

### Service won't start
```bash
# Check Python version (needs 3.8+)
python --version

# Install dependencies
pip install -r requirements.txt

# Verify model files exist
dir *.h5
dir *.pkl
```

### Sentiment always returns null
- Check if `sentiment_model.h5` exists
- Check if `tokenizer.pkl` exists
- Verify textReview is not empty
- Check ML service console for errors

### No recommendations returned
- Verify ML service is running on port 5000
- Check `ML_SERVICE_URL` in web app `.env.local`
- Test endpoint directly with curl
- Check ML service logs

### MongoDB connection errors
- Service works without MongoDB (ML-only mode)
- Hybrid mode requires valid `MONGODB_URI`
- Check connection string format

## 📊 Performance

- **Recommendation latency**: 100-500ms
- **Sentiment analysis**: 50-200ms
- **Memory usage**: ~500MB-1GB
- **Concurrent requests**: Supported via Flask

## 🚀 Production Deployment

1. **Deploy ML service** to cloud (Render, Railway, etc.)
2. **Update web app** `.env.local`:
   ```env
   ML_SERVICE_URL=https://your-ml-service.onrender.com
   ```
3. **Use production WSGI server**:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 ai_service:app
   ```
4. **Monitor** service uptime and errors
5. **Set up** logging and alerting

## 📚 Additional Resources

- `SETUP_GUIDE.md` - Full project setup
- `SENTIMENT_INTEGRATION.md` - Detailed sentiment integration guide
- `test_integration.py` - Test suite

## 🎓 How It Works

### When a user views their dashboard:
1. Frontend requests recommendations
2. API authenticates user
3. API calls ML service with user_id
4. ML service analyzes user history
5. Returns personalized recommendations
6. API fetches item details from database
7. Frontend displays recommendations

### When a user submits feedback:
1. User writes review and submits
2. Feedback saved to database
3. If text exists, call ML service
4. Sentiment analysis runs
5. Results saved to database
6. Frontend shows confirmation

## 👥 Support

For issues or questions about the ML service, check:
- Console logs when starting `ai_service.py`
- Test results from `test_integration.py`
- Web app server logs
- MongoDB connection status
