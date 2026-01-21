---
title: AIU Smart Cafe AI Models
emoji: 🍽️
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# AIU Smart Cafe - AI Models API

This API provides three machine learning models for the AIU Smart Cafe system:

## 🤖 Models

### 1. **Sentiment Analysis** 
- Analyzes customer feedback comments
- Classifies: Negative, Neutral, Positive
- Based on fine-tuned DistilBERT

### 2. **Recommendation System**
- Personalized menu recommendations
- Hybrid approach: Order history + ML model + Popular items
- Uses collaborative filtering

### 3. **Visual Search**
- Identifies food categories from images
- Categories: Main Course, Drinks, Desserts, etc.
- Based on Vision Transformer

## 📡 API Endpoints

### Health Check
```bash
GET /
```

### Sentiment Analysis
```bash
POST /analyze_feedback
Content-Type: application/json

{
  "comment": "The food was amazing!"
}
```

### Recommendations
```bash
POST /recommend
Content-Type: application/json

{
  "user_id": "USER_OBJECT_ID"
}
```

### Visual Search
```bash
POST /visual_search
Content-Type: multipart/form-data

image: [file]
```

## 🔧 Environment Variables

- `MONGODB_URI` - MongoDB connection string (optional, enables personalized recommendations)
- `PORT` - Port number (default: 7860)

## 📊 Tech Stack

- Flask + Flask-CORS
- TensorFlow 2.15
- PyTorch 2.1
- Transformers 4.36
- MongoDB (optional)

## 🎓 FYP Project

**AIU Smart Cafe System**  
Final Year Project - AI University

---
Built with ❤️ for AIU Smart Cafe
