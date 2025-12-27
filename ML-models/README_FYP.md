# AIU Smart Café - Recommendation System
## FYP: Two-Approach Comparison

This project implements **TWO recommendation approaches** for comparison and demonstration purposes.

---

## 📁 File Structure

```
ML-models/
├── ai_service.py              # Logic-Based System (Port 5000)
├── ai_service_pure_ml.py      # Pure ML System (Port 5001)
├── compare_approaches.py      # Comparison test script
├── recommender_model.h5       # Trained neural network
├── sentiment_model.h5         # Sentiment analysis model
├── user_encoder.pkl           # User ID encoder
├── item_encoder.pkl           # Item name encoder
└── tokenizer.pkl             # Text tokenizer
```

---

## 🔧 System 1: Logic-Based Recommendations (Port 5000)

**File:** `ai_service.py`

### Approach
Rule-based system using:
- Purchase history analysis
- Category matching
- Rating-based filtering (4-5★ favorites)
- Exclusion logic (1-2★ disliked items)

### How It Works
```
1. Analyze user's order history
2. Find favorite categories (Main Course, Drinks, etc.)
3. Include 4-5★ rated items (favorites)
4. Exclude 1-2★ rated items (disliked)
5. Recommend similar category items
6. Fill with popular items if needed
```

### Start Service
```bash
cd ML-models
python ai_service.py
```

### Strengths
✅ **Transparent** - Clear why items are recommended
✅ **Real-time** - Updates immediately on new orders
✅ **Explainable** - Can show reasoning to users
✅ **No training** - Works with new items instantly

### Weaknesses
❌ Requires explicit user actions (orders, ratings)
❌ Can't discover hidden patterns
❌ Limited to predefined rules

---

## 🤖 System 2: Pure ML Recommendations (Port 5001)

**File:** `ai_service_pure_ml.py`

### Approach
Neural network collaborative filtering:
- Uses TensorFlow/Keras model
- Trained on historical order data
- Predicts ratings for unseen items
- Pure machine learning predictions

### How It Works
```
1. Encode user ID → neural network input
2. Get predictions for ALL menu items
3. Rank by predicted rating score
4. Return top N items
5. (Optional) Filter by availability
```

### Start Service
```bash
cd ML-models
python ai_service_pure_ml.py
```

### Strengths
✅ **Pattern discovery** - Finds hidden user preferences
✅ **Collaborative** - Learns from ALL users
✅ **Predictive** - Can suggest unexpected items
✅ **Scalable** - Gets better with more data

### Weaknesses
❌ "Black box" - Hard to explain WHY
❌ Cold start problem for new users
❌ Needs retraining for new menu items
❌ Requires sufficient training data

---

## 🧪 Testing & Comparison

### Run Comparison Test
```bash
# Terminal 1: Start logic-based service
python ai_service.py

# Terminal 2: Start ML service
python ai_service_pure_ml.py

# Terminal 3: Run comparison
python compare_approaches.py
```

### Test Individual Services

**Logic-Based (Port 5000):**
```bash
curl -X POST http://127.0.0.1:5000/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_id": "6937d6737ade80a94df9a322"}'
```

**Pure ML (Port 5001):**
```bash
curl -X POST http://127.0.0.1:5001/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_id": "6937d6737ade80a94df9a322"}'
```

---

## 📊 Integration with Next.js App

### Current Setup (Logic-Based)
```typescript
// app/.env.local
ML_SERVICE_URL=http://127.0.0.1:5000
```

### Switch to Pure ML
```typescript
// app/.env.local
ML_SERVICE_URL=http://127.0.0.1:5001
```

### Or Use Both (Hybrid)
```typescript
// Create dual integration in API route
const logicRecs = await axios.post('http://127.0.0.1:5000/recommend', {user_id});
const mlRecs = await axios.post('http://127.0.0.1:5001/recommend', {user_id});

// Combine scores and rank
const hybrid = combineRecommendations(logicRecs, mlRecs);
```

---

## 📈 FYP Presentation Guide

### Demo Flow

**1. Show Logic-Based System**
- User orders "Nasi Lemak" (Main Course)
- System recommends other Main Course items
- Explain: "Based on category matching"

**2. Show Pure ML System**
- Same user, different recommendations
- Items may cross categories
- Explain: "Based on what similar users ordered"

**3. Compare Results**
```bash
python compare_approaches.py
```
- Show side-by-side differences
- Discuss strengths/weaknesses

**4. Demonstrate Cold Start**
- Test with new user ID
- Logic: Returns popular items
- ML: May fail or return generic items

### Key Points for Presentation

**Research Question:**
> "Which recommendation approach provides better user satisfaction in a café setting?"

**Hypothesis:**
- Logic-based: Better for transparent, category-aware recommendations
- ML-based: Better for discovering unexpected user preferences
- Hybrid: Best of both worlds

**Evaluation Metrics:**
- Click-through rate (CTR)
- Order conversion rate
- User satisfaction (surveys)
- Diversity of recommendations
- Explainability score

---

## 🔄 Model Training (For Reference)

The ML model was trained using:
```python
# Collaborative Filtering Neural Network
Input: [User ID, Item ID]
Embedding: 50 dimensions each
Dense Layers: [128, 64, 32]
Output: Predicted rating (0-5)
Loss: Mean Squared Error
```

**Training Data:**
- Historical orders from MongoDB
- User-Item interaction matrix
- Ratings from feedback collection

**To Retrain:**
```bash
# (Add your training script here)
python train_recommender.py
```

---

## 🚀 Production Deployment

### For FYP Demo
Run both services on different ports:
```bash
# Logic-Based
gunicorn -w 2 -b 0.0.0.0:5000 ai_service:app

# Pure ML
gunicorn -w 2 -b 0.0.0.0:5001 ai_service_pure_ml:app
```

### For Production (Choose One)
- **Option A:** Deploy logic-based only (transparent, reliable)
- **Option B:** Deploy pure ML only (innovative, learning)
- **Option C:** Deploy both + hybrid ranking (recommended)

---

## 📝 Known Users in Training Data

Check which users are in the ML model:
```bash
python -c "import pickle; print(pickle.load(open('user_encoder.pkl', 'rb')).classes_)"
```

Your current user:
- `6937d6737ade80a94df9a322` ← Test with this

---

## 🎓 FYP Documentation Tips

### Include in Report:
1. **System Architecture Diagram** showing both approaches
2. **Flowcharts** for each recommendation logic
3. **Comparison Table** (accuracy, speed, explainability)
4. **User Study Results** (which do users prefer?)
5. **Performance Metrics** (response time, throughput)
6. **Code Snippets** from both systems

### Conclusion Recommendation:
> "For AIU Smart Café, a **hybrid approach** combining logic-based transparency with ML pattern discovery provides the best user experience, balancing explainability with personalization."

---

## 📞 Support

For questions during FYP:
- Check logs: Both services print detailed debug info
- Test endpoints: Use `compare_approaches.py`
- Monitor MongoDB: Check actual data vs predictions

Good luck with your Final Year Project! 🎓
