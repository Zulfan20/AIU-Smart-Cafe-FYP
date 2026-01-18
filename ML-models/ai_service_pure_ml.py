"""
Pure ML-Based Recommendation System
For FYP demonstration - Uses ONLY machine learning predictions
Compare with ai_service.py (logic-based approach)
"""

from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import pickle
import os
from pymongo import MongoClient
from bson import ObjectId

# Initialize Flask App
app = Flask(__name__)

# MongoDB Connection (only for fetching item details, not for logic)
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://zulfanisious20_db_user:RgxMh7QEGqmiBsaD@aiu-cafe.khakonf.mongodb.net/test?retryWrites=true&w=majority&appName=db-aiu-cafe')
try:
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    mongo_client.admin.command('ping')
    db = mongo_client.get_database()
    orders_collection = db['orders']
    menu_items_collection = db['menuitems']
    feedback_collection = db['feedbacks']
    print("   [SUCCESS] MongoDB Connected!")
    print(f"   [INFO] Database: {db.name}")
    mongo_ready = True
except Exception as e:
    print(f"   [WARNING] MongoDB connection failed: {e}")
    mongo_ready = False

print("-----------------------------------")
print("PURE ML RECOMMENDATION SYSTEM")
print("-----------------------------------")

# ==========================================
# LOAD ML MODELS
# ==========================================
try:
    rec_model = tf.keras.models.load_model('recommender_model.h5', compile=False)
    with open('user_encoder.pkl', 'rb') as f:
        user_enc = pickle.load(f)
    with open('item_encoder.pkl', 'rb') as f:
        item_enc = pickle.load(f)
    
    num_users = len(user_enc.classes_)
    num_items = len(item_enc.classes_)
    all_food_idxs = np.arange(num_items)
    
    print(f"   [SUCCESS] ML Model Loaded!")
    print(f"   [INFO] Known Users: {num_users}")
    print(f"   [INFO] Known Items: {num_items}")
    print(f"   [INFO] Sample Users: {list(user_enc.classes_)[:5]}")
    print(f"   [INFO] Sample Items: {list(item_enc.classes_)[:5]}")
    ml_ready = True
except Exception as e:
    print(f"   [ERROR] Failed to load ML models: {e}")
    ml_ready = False

print("-----------------------------------")


@app.route('/')
def home():
    return jsonify({
        "service": "Pure ML Recommendation System",
        "status": "running",
        "ml_model": "ready" if ml_ready else "not loaded",
        "database": "connected" if mongo_ready else "disconnected",
        "approach": "Pure Machine Learning (Neural Network Predictions)",
        "difference": "Uses ONLY ML model predictions, no business logic"
    })


def get_user_order_history(user_id_str):
    """Fetch real user's order history from MongoDB"""
    try:
        user_oid = ObjectId(user_id_str)
    except:
        print(f"  [WARNING] Invalid ObjectId format: {user_id_str}")
        return [], {}
    
    # Get completed orders
    orders = list(orders_collection.find({
        'userId': user_oid,
        'status': 'Completed'
    }))
    
    if not orders:
        return [], {}
    
    # Extract purchased items and ratings
    purchased_items = []
    item_ratings = {}
    
    for order in orders:
        for item in order.get('items', []):
            item_name = item.get('name')
            if item_name:
                purchased_items.append(item_name)
    
    # Get ratings from feedback
    feedbacks = list(feedback_collection.find({'userId': user_oid}))
    for feedback in feedbacks:
        item_name = feedback.get('itemName')
        rating = feedback.get('rating')
        if item_name and rating:
            item_ratings[item_name] = rating
    
    return purchased_items, item_ratings


def get_ml_recommendations_with_real_data(user_id_str, top_n=5):
    """
    Enhanced ML approach that works with REAL MongoDB users
    
    Strategy:
    1. If user in training data → Pure ML predictions
    2. If user NOT in training → Use their order history + ML item embeddings
    3. Analyze what they bought, predict similar items using ML model
    """
    
    print(f"\n{'='*60}")
    print(f"PURE ML RECOMMENDATION (Real Data Integration)")
    print(f"User: {user_id_str}")
    print(f"{'='*60}")
    
    if not ml_ready:
        return [], "ML Model Not Ready"
    
    # Get real order history from MongoDB
    purchased_items, item_ratings = get_user_order_history(user_id_str)
    
    if purchased_items:
        print(f"[MONGODB] Found {len(purchased_items)} purchases from database")
        print(f"  → Items: {purchased_items[:5]}")
        print(f"  → Ratings: {item_ratings}")
    
    # CASE 1: User exists in training data → Pure ML
    if user_id_str in user_enc.classes_:
        print(f"[ML] User found in training data → Using pure neural network")
        return predict_for_known_user(user_id_str, top_n, purchased_items)
    
    # CASE 2: User NOT in training data but has orders → Item-based ML
    elif purchased_items:
        print(f"[ML] User NOT in training data → Using item-based ML approach")
        return predict_for_new_user_with_history(purchased_items, item_ratings, top_n)
    
    # CASE 3: New user, no history → Popular items
    else:
        print(f"[ML] New user, no history → Using popular items")
        return get_popular_items(top_n)


def predict_for_known_user(user_id_str, top_n, exclude_items):
    """User exists in training data - use pure ML predictions"""
    user_idx = user_enc.transform([user_id_str])[0]
    print(f"  → User encoded as index: {user_idx}")
    
    # Prepare input
    user_input = np.array([user_idx] * num_items).reshape(-1, 1)
    item_input = all_food_idxs.reshape(-1, 1)
    
    # Get ML predictions
    predictions = rec_model.predict([user_input, item_input], verbose=0).flatten()
    print(f"  → ML predictions range: {predictions.min():.4f} to {predictions.max():.4f}")
    
    # Get top items (excluding already purchased)
    top_indices = np.argsort(predictions)[::-1]
    
    recommended_items = []
    for idx in top_indices:
        item_name = item_enc.inverse_transform([idx])[0]
        
        # Skip already purchased
        if item_name in exclude_items:
            continue
        
        # Check availability
        if mongo_ready:
            item_doc = menu_items_collection.find_one({'name': item_name, 'isAvailable': True})
            if not item_doc:
                continue
        
        recommended_items.append(item_name)
        if len(recommended_items) >= top_n:
            break
    
    print(f"  → Returning {len(recommended_items)} ML predictions")
    return recommended_items, "Pure ML (Known User)"


def predict_for_new_user_with_history(purchased_items, item_ratings, top_n):
    """
    User NOT in training but has purchase history
    Strategy: Find items similar to what they bought using ML embeddings
    """
    print(f"  → Analyzing purchased items using ML model...")
    
    # Find which purchased items are in training data
    known_items = [item for item in purchased_items if item in item_enc.classes_]
    
    if not known_items:
        print(f"  → None of purchased items in training data")
        return get_popular_items(top_n)
    
    print(f"  → Found {len(known_items)} known items: {known_items}")
    
    # Get item indices
    item_indices = item_enc.transform(known_items)
    
    # Use a "virtual user" approach: create average user profile
    # We'll use predictions for these items to find similar items
    all_scores = np.zeros(num_items)
    
    # For each purchased item, get what users who liked THIS item also liked
    for item_idx in item_indices:
        # Create input for all users with this item
        user_input = np.arange(num_users).reshape(-1, 1)
        item_input = np.full((num_users, 1), item_idx)
        
        # Get predictions: which users would rate this item highly?
        predictions = rec_model.predict([user_input, item_input], verbose=0).flatten()
        
        # Find top users who would like this item
        top_user_indices = np.argsort(predictions)[-10:]  # Top 10 similar users
        
        # Now get what THOSE users would like
        for user_idx in top_user_indices:
            user_input_single = np.full((num_items, 1), user_idx)
            item_input_all = all_food_idxs.reshape(-1, 1)
            
            user_predictions = rec_model.predict([user_input_single, item_input_all], verbose=0).flatten()
            all_scores += user_predictions
    
    # Normalize scores
    all_scores = all_scores / len(item_indices)
    
    print(f"  → Calculated similarity scores for all items")
    
    # Get top recommendations
    top_indices = np.argsort(all_scores)[::-1]
    
    recommended_items = []
    for idx in top_indices:
        item_name = item_enc.inverse_transform([idx])[0]
        
        # Skip already purchased
        if item_name in purchased_items:
            continue
        
        # Check availability
        if mongo_ready:
            item_doc = menu_items_collection.find_one({'name': item_name, 'isAvailable': True})
            if not item_doc:
                continue
        
        recommended_items.append(item_name)
        if len(recommended_items) >= top_n:
            break
    
    print(f"  → Returning {len(recommended_items)} item-based ML recommendations")
    return recommended_items, "ML Item-Based (Real Data)"


def get_popular_items(top_n):
    """Fallback: Return popular items from database"""
    if not mongo_ready:
        return [], "No Data Available"
    
    popular = list(menu_items_collection.find({
        'isAvailable': True
    }).sort([('averageRating', -1), ('reviewCount', -1)]).limit(top_n))
    
    return [item['name'] for item in popular], "Popular Items"


def get_ml_recommendations(user_id_str, top_n=5, filter_available=True):
    """Legacy function - redirects to enhanced version"""
    return get_ml_recommendations_with_real_data(user_id_str, top_n)
def get_ml_recommendations(user_id_str, top_n=5, filter_available=True):
    """Legacy function - redirects to enhanced version"""
    return get_ml_recommendations_with_real_data(user_id_str, top_n)


# ==========================================
# ENDPOINT: ML RECOMMENDATIONS
# ==========================================
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        top_n = data.get('top_n', 5)
        
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        
        recommendations, status = get_ml_recommendations(user_id, top_n)
        
        return jsonify({
            "user_id": user_id,
            "recommendations": recommendations,
            "status": status,
            "count": len(recommendations),
            "approach": "Pure ML (Neural Network)"
        })
    
    except Exception as e:
        print(f"[ERROR] Recommendation failed: {e}")
        return jsonify({"error": str(e)}), 500


# ==========================================
# ENDPOINT: Compare with Logic-Based
# ==========================================
@app.route('/compare', methods=['POST'])
def compare():
    """
    Compare Pure ML vs Logic-Based recommendations
    For FYP demonstration
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        
        # Get ML recommendations
        ml_recs, ml_status = get_ml_recommendations(user_id, top_n=5)
        
        return jsonify({
            "user_id": user_id,
            "pure_ml": {
                "recommendations": ml_recs,
                "status": ml_status,
                "approach": "Neural Network Predictions",
                "description": "Uses collaborative filtering model trained on historical orders"
            },
            "logic_based": {
                "endpoint": "Use ai_service.py on port 5000",
                "approach": "Rule-Based + Category Matching",
                "description": "Uses purchase history, ratings, and category preferences"
            },
            "comparison": {
                "ml_advantages": [
                    "Discovers hidden patterns in user behavior",
                    "Can predict preferences even without explicit categories",
                    "Learns from all users (collaborative filtering)"
                ],
                "logic_advantages": [
                    "Transparent and explainable",
                    "Works immediately with new items",
                    "Respects explicit user preferences (ratings)"
                ]
            }
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)  # Different port from logic-based
