# ML Service Setup and Integration Guide

## Quick Start (Windows)

### Option 1: Use the automated setup script
```bash
cd ML-models
setup_and_run.bat
```

### Option 2: Manual setup
```bash
cd ML-models

# Create virtual environment
python -m venv .venv

# Activate it (Windows CMD)
.venv\Scripts\activate.bat

# OR for PowerShell
.venv\Scripts\Activate.ps1

# Install dependencies
pip install --upgrade pip
pip install flask tensorflow pandas numpy scikit-learn

# Run the service
python ai_service.py
```

The service will start on `http://127.0.0.1:5000`

## Test the Service

After starting the service, open a new terminal and run:
```bash
cd ML-models
.venv\Scripts\activate.bat
python test_ml_service.py
```

## Environment Variables

Add to your Next.js app's `.env.local`:
```
ML_SERVICE_URL=http://127.0.0.1:5000
```

## Troubleshooting

### PowerShell Execution Policy Error
If you get an error running `.ps1` scripts:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Missing ML Model Files
If you see warnings about missing `.h5` or `.pkl` files:
- The service will still run but recommendations will be random
- You need to train the models first or place pre-trained models in the ML-models folder
- Required files:
  - `recommender_model.h5`
  - `user_encoder.pkl`
  - `item_encoder.pkl`
  - `sentiment_model.h5`
  - `tokenizer.pkl`

### Port Already in Use
If port 5000 is already taken, edit `ai_service.py` and change:
```python
app.run(port=5000, debug=True)
```
to a different port (e.g., 5001), and update `ML_SERVICE_URL` in `.env.local`

## API Endpoints

### 1. Health Check
```bash
GET http://127.0.0.1:5000/
```
Returns service status

### 2. Get Recommendations
```bash
POST http://127.0.0.1:5000/recommend
Content-Type: application/json

{
  "user_id": "675f3da3b7e0c957a5e66fe9"
}
```

Returns:
```json
{
  "user_id": "675f3da3b7e0c957a5e66fe9",
  "recommendations": ["item1", "item2", "item3", "item4", "item5"],
  "status": "Success"
}
```

### 3. Analyze Sentiment
```bash
POST http://127.0.0.1:5000/analyze_feedback
Content-Type: application/json

{
  "comment": "The food was amazing!"
}
```

Returns:
```json
{
  "comment": "The food was amazing!",
  "sentiment": "Positive",
  "confidence": 0.95
}
```

## Integration Flow

1. **Student Dashboard** loads → calls `/api/recommendations`
2. **Next.js API** (`/api/recommendations`) → calls Python ML service
3. **Python ML Service** → returns item recommendations (names or IDs)
4. **Next.js API** → matches recommendations to MongoDB items
5. **Frontend** → displays recommended items

## Debugging

Check logs in different terminals:

**Node.js Terminal** (where `npm run dev` runs):
```
=== Recommendations API Called ===
User ID: 675f3da3b7e0c957a5e66fe9
ML Service URL: http://127.0.0.1:5000
Calling ML service...
ML Response received: {...}
```

**Python Terminal** (where `ai_service.py` runs):
```
127.0.0.1 - - [timestamp] "POST /recommend HTTP/1.1" 200 -
```

**Browser Console**:
```
Loading recommendations...
Recommendations API response: {recommendations: [...]}
Received 3 recommendations
```
