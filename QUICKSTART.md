# 🚀 Quick Start Guide - AI Features

## One-Command Setup

### Windows Users
```bash
# Terminal 1: Start ML Service
cd ML-models && python ai_service.py

# Terminal 2: Start Web App  
cd app && npm run dev
```

### Test Everything Works
```bash
# Terminal 3: Run tests
cd ML-models && python test_integration.py
```

## ✅ What's Working Now

### 1. 🎯 Smart Recommendations
- Personalized food suggestions for each user
- Based on order history + ratings
- Fallback to popular items for new users

### 2. 😊 Sentiment Analysis  
- Automatic analysis of customer reviews
- Categories: Positive, Negative, Neutral
- Confidence scoring (0-1)

## 🔗 Quick Test Commands

### Test Sentiment
```bash
curl -X POST http://127.0.0.1:5000/analyze_feedback \
  -H "Content-Type: application/json" \
  -d "{\"comment\": \"The food was amazing!\"}"
```

### Test Recommendations
```bash
curl -X POST http://127.0.0.1:5000/recommend \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"507f1f77bcf86cd799439011\"}"
```

### Check Service Status
```bash
curl http://127.0.0.1:5000/
```

## 📁 Required Files Checklist

In `ML-models/` directory:
- [x] `ai_service.py`
- [x] `sentiment_model.h5`
- [x] `tokenizer.pkl`
- [x] `recommender_model.h5`
- [x] `user_encoder.pkl`
- [x] `item_encoder.pkl`

## ⚙️ Environment Setup

Create `app/.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/aiu-smart-cafe
ML_SERVICE_URL=http://127.0.0.1:5000
JWT_SECRET=your_secret_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🐛 Common Issues

### ML Service Error?
```bash
cd ML-models
pip install -r requirements.txt
python ai_service.py
```

### Can't Connect?
- Check ML service is running on port 5000
- Verify `.env.local` has correct `ML_SERVICE_URL`
- Test with curl commands above

### Sentiment Always Null?
- Ensure text review is not empty
- Check `sentiment_model.h5` exists
- Look at ML service console for errors

## 📚 Full Documentation

- `INTEGRATION_COMPLETE.md` - What was done
- `SENTIMENT_INTEGRATION.md` - Sentiment feature details
- `SETUP_GUIDE.md` - Complete setup instructions
- `ML-models/AI_SERVICE_DOCS.md` - API documentation

## 🎓 How to Use

### For Students (Frontend)
1. Login to student dashboard
2. View personalized recommendations
3. Submit feedback with text reviews
4. Sentiment is analyzed automatically!

### For Admins (Analytics)
1. View all feedback with sentiment
2. Filter by Positive/Negative/Neutral
3. Track sentiment trends
4. Identify problematic items

## 💡 Pro Tips

1. **Always start ML service first** before web app
2. **Check ML service logs** for detailed info
3. **Run test_integration.py** to verify setup
4. **Keep services running** in separate terminals

## 🎉 You're Ready!

Both AI models are connected and working:
- ✅ Recommendation engine
- ✅ Sentiment analysis

Start building awesome features! 🚀
