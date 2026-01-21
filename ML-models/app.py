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

# MongoDB Connection
MONGODB_URI = os.getenv('MONGODB_URI', '')
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
    """Hybrid recommendation system"""
    print(f"\n[RECOMMEND] User: {user_id_str}")
    
    # Step 1: Try order-based recommendations
    if mongo_ready:
        purchased_items, item_ratings = get_user_order_history(user_id_str)
        
        if len(purchased_items) > 0:
            print(f"  Using order history ({len(purchased_items)} items)")
            
            item_counter = Counter(purchased_items)
            most_purchased = [item for item, count in item_counter.most_common(3)]
            
            highly_rated = [name for name, rating in item_ratings.items() if rating >= 4]
            low_rated = [name for name, rating in item_ratings.items() if rating <= 2]
            neutral_or_unrated = [item for item in set(purchased_items) 
                                 if item not in item_ratings or 
                                 (item in item_ratings and 3 <= item_ratings[item] < 4)]
            
            favorite_categories = set()
            for item_name in most_purchased + highly_rated:
                menu_item = menu_items_collection.find_one({'name': item_name})
                if menu_item:
                    favorite_categories.add(menu_item.get('category'))
            
            items_to_exclude = low_rated + neutral_or_unrated
            recommendations = []
            already_added_names = []
            
            # Add highly-rated favorites
            if len(highly_rated) > 0:
                favorite_items = list(menu_items_collection.find({
                    'name': {'$in': highly_rated},
                    'isAvailable': True
                }).sort([('averageRating', -1), ('reviewCount', -1)]).limit(2))
                recommendations.extend(favorite_items)
                already_added_names.extend([item['name'] for item in favorite_items])
            
            # Add items from favorite categories
            if len(recommendations) < top_n and len(favorite_categories) > 0:
                current_exclusions = items_to_exclude + already_added_names
                same_category = list(menu_items_collection.find({
                    'category': {'$in': list(favorite_categories)},
                    'name': {'$nin': current_exclusions},
                    'isAvailable': True,
                    'averageRating': {'$gt': 0}
                }).sort([('averageRating', -1), ('reviewCount', -1)]).limit(top_n - len(recommendations)))
                recommendations.extend(same_category)
                already_added_names.extend([item['name'] for item in same_category])
            
            # Fill with other available items
            if len(recommendations) < top_n:
                current_exclusions = items_to_exclude + already_added_names
                other_items = list(menu_items_collection.find({
                    'name': {'$nin': current_exclusions},
                    'isAvailable': True
                }).sort([('averageRating', -1), ('reviewCount', -1)]).limit(top_n - len(recommendations)))
                recommendations.extend(other_items)
            
            if len(recommendations) > 0:
                rec_names = [item['name'] for item in recommendations[:top_n]]
                print(f"  Returning {len(rec_names)} personalized items")
                return rec_names, "Personalized (Order History)"
    
    # Step 2: Try ML model
    if rec_ready and user_id_str in user_encoder.classes_:
        print("  Using ML model")
        user_idx = user_encoder.transform([user_id_str])[0]
        user_input = np.full(num_items, user_idx)
        predictions = rec_model.predict([user_input, all_item_indices], verbose=0).flatten()
        top_indices = np.argsort(predictions)[-top_n:][::-1]
        top_items = item_encoder.inverse_transform(top_indices)
        return top_items.tolist(), "ML Model"
    
    # Step 3: Cold start - popular items
    if mongo_ready:
        print("  Using popular items (cold start)")
        popular = list(menu_items_collection.find({
            'isAvailable': True,
            'averageRating': {'$gt': 0}
        }).sort([('averageRating', -1), ('reviewCount', -1)]).limit(top_n))
        
        if len(popular) < top_n:
            additional = list(menu_items_collection.find({
                'isAvailable': True,
                'averageRating': 0
            }).sort('createdAt', -1).limit(top_n - len(popular)))
            popular.extend(additional)
        
        pop_names = [item['name'] for item in popular]
        return pop_names, "Popular Items (Cold Start)"
    
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
    port = int(os.environ.get('PORT', 7860))
    print(f"\n🚀 Starting AI Service on port {port}")
    print("="*60)
    print("Endpoints:")
    print("  GET  /                   - Health check")
    print("  POST /analyze_feedback   - Sentiment analysis")
    print("  POST /recommend          - Get recommendations")
    print("  POST /visual_search      - Search by image")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=False)
