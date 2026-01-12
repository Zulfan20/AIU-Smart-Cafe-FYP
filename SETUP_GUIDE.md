# AIU Smart Cafe - Setup Guide

This guide will help you connect the AI recommendation service with the web application and database.

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud instance)

## Step 1: Database Setup

1. Make sure MongoDB is running on your system
2. Create a database named `aiu-smart-cafe` or use your preferred name
3. Update the `.env.local` file in the `app/` directory with your MongoDB connection string

## Step 2: ML Service Setup (ai_service.py)

1. Navigate to the ML-models directory:
   ```bash
   cd ML-models
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Make sure you have the following files in the ML-models directory:
   - `ai_service.py` (the main AI service with recommendations + sentiment analysis)
   - `recommender_model.h5` (trained recommendation model)
   - `sentiment_model.h5` (trained sentiment analysis model)
   - `user_encoder.pkl` (user ID encoder)
   - `item_encoder.pkl` (item encoder)
   - `tokenizer.pkl` (text tokenizer for sentiment analysis)

4. Start the ML service:
   ```bash
   python ai_service.py
   ```
   
   Or use the batch file:
   ```bash
   start_ai_service.bat
   ```
   
   The service will run on `http://127.0.0.1:5000` by default.

## Step 3: Web Application Setup

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the `app/` directory (or copy from `.env.example`):
   ```env
   MONGODB_URI=mongodb://localhost:27017/aiu-smart-cafe
   ML_SERVICE_URL=http://127.0.0.1:5000
   JWT_SECRET=your_secure_jwt_secret_here
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The web app will run on `http://localhost:3000` by default.

## Step 4: Testing the Integration

1. **Start both services:**
   - ML Service: `python ai_service.py` (in ML-models/)
   - Web App: `npm run dev` (in app/)

2. **Test the recommendation API:**
   - Login as a student user
   - Navigate to the student dashboard
   - The recommendations should appear automatically

3. **Test the sentiment analysis:**
   - Submit feedback with a text review
   - Check the feedback in the database - it should have sentimentCategory and sentimentScore

4. **API endpoint tests:**
   
   Test recommendations:
   ```bash
   curl -X POST http://127.0.0.1:5000/recommend \
     -H "Content-Type: application/json" \
     -d '{"user_id": "USER_ID_HERE"}'
   ```
   
   Test sentiment analysis:
   ```bash
   curl -X POST http://127.0.0.1:5000/analyze_feedback \
     -H "Content-Type: application/json" \
     -d '{"comment": "The food was amazing!"}'
   ```

## How It Works

### Data Flow:

1. **User Request** → Student accesses their dashboard
2. **API Call** → Web app calls `/api/recommendations` endpoint
3. **Authentication** → User is verified via JWT token
4. **ML Service Call** → API calls `ai_service.py` at `/recommend` endpoint
5. **Recommendation** → ML service returns recommended item names
6. **Database Query** → API fetches full item details from MongoDB
7. **Response** → Recommendations are sent back to the frontend

### Sentiment Analysis Flow:

1. **Feedback Submission** → User submits feedback with text review
2. **Save to DB** → Feedback saved to MongoDB immediately
3. **ML Service Call** → Text sent to `ai_service.py` at `/analyze_feedback`
4. **Sentiment Analysis** → Model returns sentiment (Positive/Negative/Neutral) + confidence
5. **Update DB** → Feedback updated with sentimentCategory and sentimentScore
6. **Response** → Confirmation sent to user

### Key Integration Points:

- **API Route**: `app/src/app/api/recommendations/route.js`
  - Handles authentication
  - Calls ML service at `/recommend`
  - Fetches item details from database
  - Returns formatted recommendations

- **API Route**: `app/src/app/api/feedback/route.js`
  - Saves user feedback
  - Calls ML service at `/analyze_feedback` for text reviews
  - Updates feedback with sentiment analysis results

- **ML Service**: `ML-models/ai_service.py`
  - `/recommend`: Accepts user_id, returns personalized recommendations
  - `/analyze_feedback`: Accepts comment text, returns sentiment + confidence

- **Database Models**:
  - `User`: Stores user information and IDs
  - `MenuItem`: Stores menu item details
  - `Feedback`: Stores ratings and reviews
  - `Order`: Stores order history (used for training)

## Troubleshooting

### ML Service Connection Error
- Ensure `ai_service1.py` is running on port 5000
- Check that `ML_SERVICE_URL` in `.env.local` matches the service URL
- Verify firewall settings allow connections to localhost:5000

### No Recommendations Returned
- Check that the model files exist (`recommender_model.h5`, `*.pkl`)
- Verify user IDs in the database match the training data format
- Check ML service logs for errors

### Database Connection Error
- Ensure MongoDB is running
- Verify `MONGODB_URI` in `.env.local` is correct
- Check database permissions

### Item IDs Not Matching
The system handles both ObjectID and name-based recommendations:
- If ML returns MongoDB ObjectIDs → Direct ID matching
- If ML returns item names → Name-based matching (case-insensitive)

## Production Deployment

When deploying to production:

1. Update `ML_SERVICE_URL` to point to your deployed ML service
2. Ensure MongoDB URI points to your production database
3. Use a strong `JWT_SECRET`
4. Consider using environment-specific configurations
5. Set up monitoring for both services

## Additional Notes

- The API includes fallback logic: if ML service is unavailable, it returns top-rated items
- All ML service calls have a 5-second timeout to prevent hanging requests
- User authentication is required for personalized recommendations
