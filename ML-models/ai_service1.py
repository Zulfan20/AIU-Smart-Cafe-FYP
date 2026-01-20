# Sentiment Analysis & Recommendation & Visual Search API for AIU Smart Cafe
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoImageProcessor, AutoModelForImageClassification
import torch
import numpy as np
import pickle
import tensorflow as tf
from PIL import Image
import io

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js

# ==========================================
# SENTIMENT ANALYSIS MODEL
# ==========================================
SENTIMENT_MODEL_PATH = "./newml"

print("="*50)
print("Loading Sentiment Analysis Model...")
print(f"Model Path: {SENTIMENT_MODEL_PATH}")
print("="*50)

try:
    tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL_PATH)
    sentiment_model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL_PATH)
    sentiment_model.eval()  # Set to evaluation mode
    print("[OK] Sentiment Model loaded successfully!")
    sentiment_ready = True
except Exception as e:
    print(f"[ERROR] Error loading sentiment model: {e}")
    sentiment_ready = False

print("="*50)
print("Loading Recommendation Models...")
print("="*50)

# Load NEW recommendation model (recommender_model.h5 or recommender_mode.h5 + recommender_data.pkl)
try:
    print("Attempting to load new recommender model...")
    # Try both possible filenames
    model_file = None
    for filename in ['recommender_model.h5', 'recommender_mode.h5']:
        try:
            rec_model = tf.keras.models.load_model(filename, compile=False)
            model_file = filename
            print(f"   Loaded model from: {filename}")
            break
        except:
            continue
    
    if model_file is None:
        raise FileNotFoundError("Neither recommender_model.h5 nor recommender_mode.h5 found")
    
    with open('recommender_data.pkl', 'rb') as f:
        recommender_data = pickle.load(f)
    
    # Extract encoders from pickle file
    # Check what keys are available in the pickle
    if isinstance(recommender_data, dict):
        # Try common key names
        user_encoder = (recommender_data.get('user_encoder') or 
                       recommender_data.get('user_le') or 
                       recommender_data.get('user'))
        item_encoder = (recommender_data.get('item_encoder') or 
                       recommender_data.get('item_le') or 
                       recommender_data.get('item'))
    else:
        # If it's a tuple or list
        user_encoder = recommender_data[0] if len(recommender_data) > 0 else None
        item_encoder = recommender_data[1] if len(recommender_data) > 1 else None
    
    if user_encoder is None or item_encoder is None:
        raise ValueError("Could not extract encoders from recommender_data.pkl")
    
    num_items = len(item_encoder.classes_)
    all_item_indices = np.arange(num_items)
    
    print("[OK] NEW Recommendation Model loaded successfully!")
    print(f"   - Users in encoder: {len(user_encoder.classes_)}")
    print(f"   - Items in encoder: {num_items}")
    rec_ready = True
    
except FileNotFoundError:
    print("[WARNING] New model files not found, trying old model as fallback...")
    try:
        # Fallback to old model
        rec_model = tf.keras.models.load_model('recommendation_model.h5', compile=False)
        with open('user_encoder.pkl', 'rb') as f:
            user_encoder = pickle.load(f)
        with open('item_encoder.pkl', 'rb') as f:
            item_encoder = pickle.load(f)
        with open('user_history.pkl', 'rb') as f:
            user_history = pickle.load(f)
        
        num_items = len(item_encoder.classes_)
        all_item_indices = np.arange(num_items)
        print("[OK] OLD Recommendation Model loaded successfully (fallback)")
        rec_ready = True
    except Exception as e:
        print(f"[ERROR] Error loading old recommendation models: {e}")
        rec_ready = False
        
except Exception as e:
    print(f"[ERROR] Error loading new recommendation model: {e}")
    print(f"   Error type: {type(e).__name__}")
    print(f"   Trying old model as fallback...")
    try:
        # Fallback to old model
        rec_model = tf.keras.models.load_model('recommendation_model.h5', compile=False)
        with open('user_encoder.pkl', 'rb') as f:
            user_encoder = pickle.load(f)
        with open('item_encoder.pkl', 'rb') as f:
            item_encoder = pickle.load(f)
        with open('user_history.pkl', 'rb') as f:
            user_history = pickle.load(f)
        
        num_items = len(item_encoder.classes_)
        all_item_indices = np.arange(num_items)
        print("[OK] OLD Recommendation Model loaded successfully (fallback)")
        rec_ready = True
    except Exception as fallback_error:
        print(f"[ERROR] Error loading old recommendation models: {fallback_error}")
        rec_ready = False

print("="*50)
print("Loading Visual Search Model...")
print("="*50)

# Load visual search model
VISUAL_MODEL_PATH = "./my_category_model"
try:
    image_processor = AutoImageProcessor.from_pretrained(VISUAL_MODEL_PATH)
    visual_model = AutoModelForImageClassification.from_pretrained(VISUAL_MODEL_PATH)
    visual_model.eval()
    print("[OK] Visual Search Model loaded successfully!")
    visual_ready = True
except Exception as e:
    print(f"[ERROR] Error loading visual search model: {e}")
    visual_ready = False

print("="*50)

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "Online",
        "service": "Sentiment Analysis, Recommendations & Visual Search",
        "sentiment_model": "Ready" if sentiment_ready else "Error",
        "recommendation_model": "Ready" if rec_ready else "Error",
        "visual_search_model": "Ready" if visual_ready else "Error",
        "sentiment_model_path": SENTIMENT_MODEL_PATH
    })


@app.route('/analyze_feedback', methods=['POST'])
def analyze_feedback():
    """
    Analyze sentiment of feedback text
    
    Request body:
    {
        "comment": "The food was amazing!"
    }
    
    Response:
    {
        "comment": "The food was amazing!",
        "sentiment": "Positive",
        "confidence": 0.95
    }
    """
    if not sentiment_ready:
        return jsonify({
            "error": "Sentiment Model not loaded. Please check server logs."
        }), 503
    
    try:
        data = request.get_json()
        comment = data.get('comment', '').strip()
        
        if not comment:
            return jsonify({"error": "No comment provided"}), 400
        
        # Tokenize input
        encoded_input = tokenizer(comment, return_tensors='pt', 
                                 truncation=True, padding=True, max_length=512)
        
        # Predict
        with torch.no_grad():
            outputs = sentiment_model(**encoded_input)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            predicted_class = torch.argmax(predictions, dim=-1).item()
            confidence = predictions[0][predicted_class].item()
        
        # Map class to sentiment label
        sentiment_map = {
            0: "Negative",
            1: "Neutral",
            2: "Positive"
        }
        
        sentiment = sentiment_map.get(predicted_class, "Unknown")
        
        print(f"[ANALYSIS] '{comment[:50]}...' -> {sentiment} ({confidence:.2f})")
        
        return jsonify({
            "comment": comment,
            "sentiment": sentiment,
            "confidence": round(confidence, 4)
        })
    
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/batch_analyze', methods=['POST'])
def batch_analyze():
    """
    Analyze multiple feedback comments at once
    
    Request body:
    {
        "comments": ["Great food!", "Bad service", "Average meal"]
    }
    """
    if not model_ready:
        return jsonify({"error": "Model not loaded"}), 503
    
    try:
        data = request.get_json()
        comments = data.get('comments', [])
        
        if not comments or not isinstance(comments, list):
            return jsonify({"error": "Please provide a list of comments"}), 400
        
        results = []
        
        for comment in comments:
            if not comment or not comment.strip():
                results.append({
                    "comment": comment,
                    "sentiment": "Unknown",
                    "confidence": 0,
                    "error": "Empty comment"
                })
                continue
            
            # Tokenize and predict
            encoded_input = tokenizer(comment, return_tensors='pt',
                                    truncation=True, padding=True, max_length=512)
            
            with torch.no_grad():
                outputs = sentiment_model(**encoded_input)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                predicted_class = torch.argmax(predictions, dim=-1).item()
                confidence = predictions[0][predicted_class].item()
            
            sentiment_map = {0: "Negative", 1: "Neutral", 2: "Positive"}
            sentiment = sentiment_map.get(predicted_class, "Unknown")
            
            results.append({
                "comment": comment,
                "sentiment": sentiment,
                "confidence": round(confidence, 4)
            })
        
        return jsonify({"results": results})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# RECOMMENDATION ENDPOINTS
# ==========================================

@app.route('/recommend', methods=['POST'])
def recommend():
    """
    Get personalized item recommendations for a user
    
    Request body:
    {
        "user_id": "675f3da3b7e0c957a5e66fe9"
    }
    
    Response:
    {
        "user_id": "675f3da3b7e0c957a5e66fe9",
        "recommendations": ["Item1", "Item2", "Item3", "Item4", "Item5"],
        "status": "Success"
    }
    """
    if not rec_ready:
        return jsonify({
            "error": "Recommendation model not loaded. Please check server logs."
        }), 503
    
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        
        # Check if user exists in encoder
        if user_id not in user_encoder.classes_:
            print(f"[RECOMMEND] User {user_id} not in training data - returning popular items")
            # Return empty for unknown users (frontend will handle fallback)
            return jsonify({
                "user_id": user_id,
                "recommendations": [],
                "status": "User not found - returning empty list"
            })
        
        # Get user index
        user_idx = user_encoder.transform([user_id])[0]
        
        # Create input: user index repeated for all items
        user_input = np.full(num_items, user_idx)
        
        # Make predictions
        predictions = rec_model.predict([user_input, all_item_indices], verbose=0).flatten()
        
        # Get top 5 recommendations
        top_indices = np.argsort(predictions)[-5:][::-1]
        top_items = item_encoder.inverse_transform(top_indices)
        
        print(f"[RECOMMEND] User {user_id} -> {list(top_items)}")
        
        return jsonify({
            "user_id": user_id,
            "recommendations": list(top_items),
            "status": "Success"
        })
    
    except Exception as e:
        print(f"[ERROR] Recommendation error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ==========================================
# VISUAL SEARCH ENDPOINT
# ==========================================

@app.route('/visual_search', methods=['POST'])
def visual_search():
    """
    Search for menu items by uploading an image
    
    Request: multipart/form-data with 'image' file
    
    Response:
    {
        "predicted_category": "Main Course",
        "confidence": 0.95,
        "all_predictions": {
            "Main Course": 0.95,
            "Drinks": 0.03,
            "Desserts": 0.02
        }
    }
    """
    if not visual_ready:
        return jsonify({
            "error": "Visual Search model not loaded. Please check server logs."
        }), 503
    
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "No image file selected"}), 400
        
        # Read and process image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Preprocess image
        inputs = image_processor(images=image, return_tensors="pt")
        
        # Make prediction
        with torch.no_grad():
            outputs = visual_model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
        
        # Get predicted class
        predicted_idx = torch.argmax(predictions).item()
        confidence = predictions[predicted_idx].item()
        
        # Get all predictions (sorted by confidence)
        all_predictions = {}
        for idx, score in enumerate(predictions.tolist()):
            label = visual_model.config.id2label.get(idx, f"Class {idx}")
            all_predictions[label] = round(score, 4)
        
        # Sort by confidence
        all_predictions = dict(sorted(all_predictions.items(), key=lambda x: x[1], reverse=True))
        
        predicted_category = visual_model.config.id2label.get(predicted_idx, "Unknown")
        
        print(f"[VISUAL SEARCH] Image analyzed -> {predicted_category} ({confidence:.2f})")
        
        return jsonify({
            "predicted_category": predicted_category,
            "confidence": round(confidence, 4),
            "all_predictions": all_predictions
        })
    
    except Exception as e:
        print(f"[ERROR] Visual search error: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("\n" + "="*50)
    print("AI Service: Sentiment, Recommendations & Visual Search")
    print("Port: 5001")
    print("="*50)
    print("Sentiment Endpoints:")
    print("  POST /analyze_feedback  - Single feedback analysis")
    print("  POST /batch_analyze     - Batch sentiment analysis")
    print("\nRecommendation Endpoints:")
    print("  POST /recommend         - Get personalized recommendations")
    print("\nVisual Search Endpoints:")
    print("  POST /visual_search     - Search menu items by image")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)