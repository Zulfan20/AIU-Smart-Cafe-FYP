# AIU Smart Cafe - All AI Models API
# Deploys: Recommendation System, Sentiment Analysis, Visual Search
# For Hugging Face Spaces Deployment

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoImageProcessor, AutoModelForImageClassification
import torch
import numpy as np
import pickle
import tensorflow as tf
from PIL import Image
import io
from pymongo import MongoClient
from bson import ObjectId
from collections import Counter
import os

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for Vercel app

# MongoDB Connection - Use your MongoDB URI as default for local dev
DEFAULT_MONGODB_URI = 'mongodb+srv://zulfanisious20_db_user:RgxMh7QEGqmiBsaD@aiu-cafe.khakonf.mongodb.net/test?retryWrites=true&w=majority&appName=db-aiu-cafe'
MONGODB_URI = os.getenv('MONGODB_URI', DEFAULT_MONGODB_URI)

mongo_ready = False
if MONGODB_URI:
    try:
        mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        mongo_client.admin.command('ping')
        db = mongo_client.get_database()
        orders_collection = db['orders']
        menu_items_collection = db['menuitems']
        feedback_collection = db['feedbacks']
        print("✓ MongoDB Connected!")
        print(f"  Database: {db.name}")
        mongo_ready = True
    except Exception as e:
        print(f"⚠ MongoDB connection failed: {e}")
        print("  Will use ML-only recommendations")
else:
    print("⚠ No MONGODB_URI provided")
    print("  Will use ML-only recommendations")

print("\n" + "="*60)
print("🚀 LOADING AI MODELS FOR AIU SMART CAFE")
print("="*60)

# ==========================================
# 1. SENTIMENT ANALYSIS MODEL
# ==========================================
SENTIMENT_MODEL_PATH = "./newml"
print("\n📊 [1/3] Loading Sentiment Analysis Model...")
try:
    tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL_PATH)
    sentiment_model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL_PATH)
    sentiment_model.eval()
    print("✓ Sentiment Model Ready!")
    sentiment_ready = True
except Exception as e:
    print(f"✗ Error: {e}")
    sentiment_ready = False

# ==========================================
# 2. RECOMMENDATION MODEL
# ==========================================
print("\n🎯 [2/3] Loading Recommendation Model...")
try:
    # Try both possible filenames
    model_file = None
    for filename in ['recommender_model.h5', 'recommender_mode.h5']:
        try:
            rec_model = tf.keras.models.load_model(filename, compile=False)
            model_file = filename
            print(f"  Found model: {filename}")
            break
        except:
            continue
    
    if model_file is None:
        raise FileNotFoundError("Recommendation model not found")
    
    # Load encoders
    with open('recommender_data.pkl', 'rb') as f:
        recommender_data = pickle.load(f)
    
    if isinstance(recommender_data, dict):
        user_encoder = (recommender_data.get('user_encoder') or 
                       recommender_data.get('user_le') or 
                       recommender_data.get('user'))
        item_encoder = (recommender_data.get('item_encoder') or 
                       recommender_data.get('item_le') or 
                       recommender_data.get('item'))
    else:
        user_encoder = recommender_data[0]
        item_encoder = recommender_data[1]
    
    num_items = len(item_encoder.classes_)
    all_item_indices = np.arange(num_items)
    
    print(f"✓ Recommendation Model Ready!")
    print(f"  Users: {len(user_encoder.classes_)}, Items: {num_items}")
    rec_ready = True
except Exception as e:
    print(f"✗ Error: {e}")
    rec_ready = False

# ==========================================
# 3. VISUAL SEARCH MODEL
# ==========================================
print("\n📸 [3/3] Loading Visual Search Model...")
VISUAL_MODEL_PATH = "./my_category_model"
try:
    image_processor = AutoImageProcessor.from_pretrained(VISUAL_MODEL_PATH)
    visual_model = AutoModelForImageClassification.from_pretrained(VISUAL_MODEL_PATH)
    visual_model.eval()
    print("✓ Visual Search Model Ready!")
    visual_ready = True
except Exception as e:
    print(f"✗ Error: {e}")
    visual_ready = False

print("\n" + "="*60)
print("✅ ALL MODELS LOADED SUCCESSFULLY!")
print("="*60 + "\n")

# ==========================================
# ENDPOINTS
# ==========================================

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "Online",
        "service": "AIU Smart Cafe AI Models API",
        "models": {
            "sentiment_analysis": "Ready" if sentiment_ready else "Error",
            "recommendation_system": "Ready" if rec_ready else "Error",
            "visual_search": "Ready" if visual_ready else "Error"
        },
        "database": "Connected" if mongo_ready else "Disconnected",
        "endpoints": {
            "sentiment": "/analyze_feedback",
            "recommendations": "/recommend",
            "visual_search": "/visual_search"
        }
    })


@app.route('/analyze_feedback', methods=['POST'])
def analyze_feedback():
    """Analyze sentiment of feedback text"""
    if not sentiment_ready:
        return jsonify({"error": "Sentiment model not loaded"}), 503
    
    try:
        data = request.get_json()
        comment = data.get('comment', '').strip()
        
        if not comment:
            return jsonify({"error": "No comment provided"}), 400
        
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
        
        print(f"[SENTIMENT] '{comment[:50]}...' -> {sentiment} ({confidence:.2f})")
        
        return jsonify({
            "comment": comment,
            "sentiment": sentiment,
            "confidence": round(confidence, 4)
        })
    
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({"error": str(e)}), 500


def get_user_order_history(user_id_str):
    """Fetch user's order history from MongoDB"""
    try:
        user_oid = ObjectId(user_id_str)
        orders = list(orders_collection.find({
            'userId': user_oid,
            'status': {'$in': ['Completed', 'Ready']}
        }))
        
        item_names = []
        item_ratings = {}
        
        for order in orders:
            for item in order.get('items', []):
                item_name = item.get('name')
                if item_name:
                    item_names.append(item_name)
        
        feedbacks = list(feedback_collection.find({'userId': user_oid}))
        for fb in feedbacks:
            item_id = fb.get('itemId')
            rating = fb.get('rating', 0)
            if item_id:
                menu_item = menu_items_collection.find_one({'_id': item_id})
                if menu_item:
                    item_ratings[menu_item['name']] = rating
        
        return item_names, item_ratings
    except Exception as e:
        print(f"[ERROR] Order history: {e}")
        return [], {}


def get_personalized_recommendations(user_id_str, top_n=5):
    """
    AI-Powered Personalized Recommendation System
    
    Strategy:
    1. If user HAS purchase history → Use AI Model for personalized recommendations
    2. If user has NO purchase history → Return empty (hide feature)
    """
    print(f"\n[RECOMMEND] User: {user_id_str}")
    
    # Check if user has purchase history
    has_purchase_history = False
    if mongo_ready:
        purchased_items, item_ratings = get_user_order_history(user_id_str)
        has_purchase_history = len(purchased_items) > 0
        print(f"  Purchase history: {len(purchased_items)} items")
    
    # If NO purchase history → Return empty (don't show feature)
    if not has_purchase_history:
        print("  ✓ New user (no purchase history) - Hiding recommendation feature")
        return [], "No recommendations (new user)"
    
    # User HAS purchase history → Use AI Model for personalized recommendations
    if rec_ready:
        print("  ✓ User has purchase history - Using AI Model for personalized recommendations")
        
        # Check if user exists in ML model training data
        if user_id_str in user_encoder.classes_:
            try:
                # Get user index
                user_idx = user_encoder.transform([user_id_str])[0]
                
                # Create input vectors for all items
                user_vector = np.full(num_items, user_idx)
                item_vector = all_item_indices
                
                # Get AI predictions for this specific user
                predictions = rec_model.predict([user_vector, item_vector], verbose=0).flatten()
                
                # Get items user already purchased to exclude them
                purchased_item_names = set(purchased_items)
                
                # Filter out already purchased items and get top recommendations
                available_items = []
                for idx in range(num_items):
                    item_name = item_encoder.inverse_transform([idx])[0]
                    if item_name not in purchased_item_names:
                        available_items.append((idx, predictions[idx], item_name))
                
                # Sort by prediction score (highest first)
                available_items.sort(key=lambda x: x[1], reverse=True)
                
                # Get top N items
                top_items = [item[2] for item in available_items[:top_n]]
                
                print(f"  → AI Model returned {len(top_items)} personalized recommendations")
                print(f"  → Items: {top_items}")
                return top_items, "AI Personalized (ML Model)"
                
            except Exception as e:
                print(f"  [WARNING] AI Model error: {e}")
                print("  → Falling back to best sellers")
        else:
            print(f"  [INFO] User not in training data")
            print("  → Using best sellers with user preference hints")
            
            # Get user's favorite categories from purchase history
            favorite_categories = set()
            for item_name in purchased_items:
                menu_item = menu_items_collection.find_one({'name': item_name})
                if menu_item:
                    favorite_categories.add(menu_item.get('category'))
            
            if favorite_categories and mongo_ready:
                # Show best sellers from user's favorite categories
                recommendations = list(menu_items_collection.find({
                    'category': {'$in': list(favorite_categories)},
                    'isAvailable': True,
                    'name': {'$nin': list(purchased_items)}
                }).sort([('averageRating', -1), ('reviewCount', -1)]).limit(top_n))
                
                if len(recommendations) > 0:
                    rec_names = [item['name'] for item in recommendations]
                    print(f"  → Returning {len(rec_names)} items from favorite categories")
                    return rec_names, "Category-Based Recommendations"
    
    # Fallback: Model not ready or user not in training data
    print("  [WARNING] Cannot generate AI recommendations - Model not ready or user not in training data")
    return [], "No recommendations available"


@app.route('/recommend', methods=['POST'])
def recommend():
    """Get personalized recommendations"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        
        recommendations, status = get_personalized_recommendations(user_id, top_n=5)
        
        return jsonify({
            "user_id": user_id,
            "recommendations": recommendations,
            "status": status
        })
    
    except Exception as e:
        print(f"[ERROR] Recommendation: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/visual_search', methods=['POST'])
def visual_search():
    """Search menu items by image"""
    if not visual_ready:
        return jsonify({"error": "Visual search model not loaded"}), 503
    
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "No image file selected"}), 400
        
        # Process image with better error handling
        image_bytes = file.read()
        
        if not image_bytes:
            return jsonify({"error": "Empty image file"}), 400
        
        # Create BytesIO and seek to start
        image_io = io.BytesIO(image_bytes)
        image_io.seek(0)
        
        # Try to open image
        try:
            image = Image.open(image_io)
            image = image.convert('RGB')
        except Exception as img_error:
            print(f"[ERROR] Invalid image: {str(img_error)}")
            return jsonify({"error": f"Invalid image file: {str(img_error)}"}), 400
        
        inputs = image_processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = visual_model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
        
        predicted_idx = torch.argmax(predictions).item()
        confidence = predictions[predicted_idx].item()
        
        # Get all predictions
        all_predictions = {}
        for idx, score in enumerate(predictions.tolist()):
            label = visual_model.config.id2label.get(idx, f"Class {idx}")
            all_predictions[label] = round(score, 4)
        
        all_predictions = dict(sorted(all_predictions.items(), key=lambda x: x[1], reverse=True))
        predicted_category = visual_model.config.id2label.get(predicted_idx, "Unknown")
        
        print(f"[VISUAL] {predicted_category} ({confidence:.2f})")
        
        return jsonify({
            "predicted_category": predicted_category,
            "confidence": round(confidence, 4),
            "all_predictions": all_predictions
        })
    
    except Exception as e:
        print(f"[ERROR] Visual search: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Use PORT environment variable
    # For local dev: export PORT=5001 (or just run normally, defaults to 5001)
    # For Hugging Face: PORT=7860 (set automatically)
    port = int(os.environ.get('PORT', 5001))  # Changed default from 7860 to 5001
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'  # Enable debug for local
    
    print(f"\n🚀 Starting AI Service on port {port}")
    print("="*60)
    print("Endpoints:")
    print("  GET  /                   - Health check")
    print("  POST /analyze_feedback   - Sentiment analysis")
    print("  POST /recommend          - Get recommendations")
    print("  POST /visual_search      - Search by image")
    print("="*60)
    print(f"🌐 Running on: http://127.0.0.1:{port}")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
