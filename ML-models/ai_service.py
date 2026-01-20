import numpy as np
import pandas as pd
import tensorflow as tf
import pickle   
from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing.sequence import pad_sequences
from pymongo import MongoClient
from bson import ObjectId
from collections import Counter
import os

# Initialize Flask App
app = Flask(__name__)

# MongoDB Connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://zulfanisious20_db_user:RgxMh7QEGqmiBsaD@aiu-cafe.khakonf.mongodb.net/test?retryWrites=true&w=majority&appName=db-aiu-cafe')
try:
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    # Test the connection
    mongo_client.admin.command('ping')
    # Get the database (it should auto-detect from URI, or use 'test' as default)
    db = mongo_client.get_database()
    orders_collection = db['orders']
    menu_items_collection = db['menuitems']
    feedback_collection = db['feedbacks']
    print("   [SUCCESS] MongoDB Connected!")
    print(f"   [INFO] Database: {db.name}")
    mongo_ready = True
except Exception as e:
    print(f"   [WARNING] MongoDB connection failed: {e}")
    print(f"   [INFO] Will use ML-only recommendations")
    mongo_ready = False

print("-----------------------------------")
print("1. Loading AI Models...")

# ==========================================
# A. LOAD RECOMMENDATION ENGINE (Optional)
# ==========================================
try:
    rec_model = tf.keras.models.load_model('recommender_model.h5', compile=False)
    with open('user_encoder.pkl', 'rb') as f:
        user_enc = pickle.load(f)
    with open('item_encoder.pkl', 'rb') as f:
        item_enc = pickle.load(f)
    num_items = len(item_enc.classes_)
    all_food_idxs = np.arange(num_items)
    print("   [SUCCESS] Recommendation Model Loaded!")
    rec_ready = True
except Exception as e:
    print(f"   [WARNING] Recommendation files missing: {e}")
    print("   [INFO] Will use order-based recommendations instead")
    rec_ready = False

# ==========================================
# B. LOAD NLP SENTIMENT ENGINE
# ==========================================
try:
    sentiment_model = tf.keras.models.load_model('sentiment_model.h5', compile=False)
    with open('tokenizer.pkl', 'rb') as f:
        tokenizer = pickle.load(f)
    print("   [SUCCESS] NLP Sentiment Model Loaded!")
    nlp_ready = True
except Exception as e:
    print(f"   [WARNING] NLP files missing. Feature disabled.")
    nlp_ready = False

print("-----------------------------------")


@app.route('/')
def home():
    nlp_status = "Active (Hybrid: ML + Rule-based)" if nlp_ready else "Active (Rule-based only)"
    return jsonify({
        "status": "Online",
        "recommendation_engine": "Active (Hybrid)" if mongo_ready else ("Active (ML Only)" if rec_ready else "Inactive"),
        "nlp_engine": nlp_status,
        "database": "Connected" if mongo_ready else "Disconnected"
    })


# ==========================================
# HELPER: Get User's Order History
# ==========================================
def get_user_order_history(user_id_str):
    """Fetch user's purchased items from MongoDB"""
    try:
        user_oid = ObjectId(user_id_str)
        orders = list(orders_collection.find({
            'userId': user_oid,
            'status': {'$in': ['Completed', 'Ready']}  # Only completed orders
        }))
        
        # Extract all item names and their frequencies
        item_names = []
        item_ratings = {}
        
        for order in orders:
            for item in order.get('items', []):
                item_name = item.get('name')
                if item_name:
                    item_names.append(item_name)
        
        # Get feedback ratings for this user
        feedbacks = list(feedback_collection.find({'userId': user_oid}))
        for fb in feedbacks:
            item_id = fb.get('itemId')
            rating = fb.get('rating', 0)
            if item_id:
                # Find item name from menu
                menu_item = menu_items_collection.find_one({'_id': item_id})
                if menu_item:
                    item_ratings[menu_item['name']] = rating
        
        return item_names, item_ratings
    except Exception as e:
        print(f"Error fetching order history: {e}")
        return [], {}


# ==========================================
# HELPER: Get Personalized Recommendations
# ==========================================
def get_personalized_recommendations(user_id_str, top_n=5):
    """
    Hybrid recommendation system:
    1. Use order history if available
    2. Fallback to ML model if user is in training data
    3. Return popular items for cold start
    """
    
    print(f"\n{'='*50}")
    print(f"RECOMMENDATION REQUEST for User: {user_id_str}")
    print(f"{'='*50}")
    
    # Step 1: Try order-based recommendations (most reliable)
    if mongo_ready:
        print("[STEP 1] Checking order history...")
        purchased_items, item_ratings = get_user_order_history(user_id_str)
        print(f"  → Found {len(purchased_items)} purchases")
        print(f"  → Purchased items: {list(set(purchased_items))}")
        print(f"  → Ratings: {item_ratings}")
        
        if len(purchased_items) > 0:
            print(f"\n[STEP 1: SUCCESS] Using personalized recommendations based on purchase history")
            
            # SMART RECOMMENDATION STRATEGY (Option B):
            # 1. Include items rated 4-5★ (favorites to re-order)
            # 2. Exclude items rated 1-2★ (didn't like)
            # 3. Exclude items rated 3★ or not rated yet if already purchased
            # 4. Include new items from same categories
            
            # Get user's favorite categories
            item_counter = Counter(purchased_items)
            most_purchased = [item for item, count in item_counter.most_common(3)]
            
            # Classify items by rating
            highly_rated = [name for name, rating in item_ratings.items() if rating >= 4]  # 4-5★ favorites
            low_rated = [name for name, rating in item_ratings.items() if rating <= 2]     # 1-2★ disliked
            neutral_or_unrated = [item for item in set(purchased_items) if item not in item_ratings or (item in item_ratings and 3 <= item_ratings[item] < 4)]
            
            print(f"  → Favorites (4-5★): {highly_rated}")
            print(f"  → Disliked (1-2★): {low_rated}")
            print(f"  → Neutral/Unrated: {neutral_or_unrated[:3]}...")
            
            # Find categories of favorite items
            favorite_categories = set()
            for item_name in most_purchased + highly_rated:
                menu_item = menu_items_collection.find_one({'name': item_name})
                if menu_item:
                    favorite_categories.add(menu_item.get('category'))
            
            print(f"[INFO] Favorite categories: {favorite_categories}")
            
            # DEBUG: Check what items exist in database
            total_available = menu_items_collection.count_documents({'isAvailable': True})
            main_course_count = menu_items_collection.count_documents({'category': 'Main Course', 'isAvailable': True})
            print(f"  → DEBUG: Total available items in DB: {total_available}")
            print(f"  → DEBUG: Main Course items: {main_course_count}")
            
            # Items to exclude: low-rated + neutral/unrated purchased items
            items_to_exclude = low_rated + neutral_or_unrated
            print(f"  → Excluding {len(items_to_exclude)} items from recommendations")
            
            # RECOMMENDATION STRATEGY:
            # 1. Include 4-5★ favorites (re-order what you loved!)
            # 2. Add new items from favorite categories
            # 3. Add highly-rated items from other categories
            # This ensures: favorites first, then category relevance, then quality
            
            recommendations = []
            already_added_names = []  # Track added items to avoid duplicates
            
            # Step 0: Add highly-rated favorites first (you loved these!)
            if len(highly_rated) > 0:
                favorite_items = list(menu_items_collection.find({
                    'name': {'$in': highly_rated},
                    'isAvailable': True
                }).sort([('averageRating', -1), ('reviewCount', -1)]).limit(2))  # Max 2 favorites
                recommendations.extend(favorite_items)
                already_added_names.extend([item['name'] for item in favorite_items])
                print(f"  → Added {len(favorite_items)} favorites you rated 4-5★")
            
            # Update exclusion list to include already added items
            current_exclusions = items_to_exclude + already_added_names
            
            # Step 1a: Get reviewed NEW items from favorite categories
            if len(recommendations) < top_n and len(favorite_categories) > 0:
                query = {
                    'category': {'$in': list(favorite_categories)},
                    'name': {'$nin': current_exclusions},
                    'isAvailable': True,
                    'averageRating': {'$gt': 0}
                }
                print(f"  → DEBUG: Query for reviewed items: {query}")
                reviewed_same_category = list(menu_items_collection.find(query).sort([('averageRating', -1), ('reviewCount', -1)]).limit(top_n - len(recommendations)))
                recommendations.extend(reviewed_same_category)
                already_added_names.extend([item['name'] for item in reviewed_same_category])
                print(f"  → Found {len(reviewed_same_category)} reviewed NEW items from favorite categories")
            
            # Update exclusion list again
            current_exclusions = items_to_exclude + already_added_names
            
            # Step 1b: If still need more, get ANY items from favorite categories (no rating filter!)
            if len(recommendations) < top_n and len(favorite_categories) > 0:
                query = {
                    'category': {'$in': list(favorite_categories)},
                    'name': {'$nin': current_exclusions},
                    'isAvailable': True
                    # NO averageRating filter - include ALL items from favorite category
                }
                print(f"  → DEBUG: Query for ANY items from favorite category: {query}")
                any_same_category = list(menu_items_collection.find(query).sort('createdAt', -1).limit(top_n - len(recommendations)))
                recommendations.extend(any_same_category)
                already_added_names.extend([item['name'] for item in any_same_category])
                print(f"  → Added {len(any_same_category)} items (any rating) from favorite categories")
            
            # Step 2: If still need more, add ANY items from other categories
            if len(recommendations) < top_n:
                print(f"  → Need {top_n - len(recommendations)} more items, checking other categories...")
                current_exclusions = items_to_exclude + already_added_names  # Update again
                query = {
                    'name': {'$nin': current_exclusions},
                    'isAvailable': True
                    # NO averageRating filter - show any available items
                }
                print(f"  → DEBUG: Query for other categories: {query}")
                other_items = list(menu_items_collection.find(query).sort([('averageRating', -1), ('reviewCount', -1)]).limit(top_n - len(recommendations)))
                recommendations.extend(other_items)
                print(f"  → Added {len(other_items)} items from other categories")
            
            if len(recommendations) > 0:
                rec_names = [item['name'] for item in recommendations[:top_n]]
                print(f"  → Returning {len(rec_names)} personalized recommendations: {rec_names}")
                return rec_names, "Personalized (Order History)"
        else:
            print(f"\n[STEP 1: SKIP] User has no purchase history")
    
    # Step 2: Try ML model if user is known
    print(f"\n[STEP 2] Checking ML model...")
    if rec_ready and user_id_str in user_enc.classes_:
        print(f"[STEP 2: SUCCESS] User found in ML training data")
        user_idx = user_enc.transform([user_id_str])[0]
        user_input_array = np.full(num_items, user_idx)
        predictions = rec_model.predict([user_input_array, all_food_idxs], verbose=0).flatten()
        top_indices = predictions.argsort()[-top_n:][::-1]
        top_foods = item_enc.inverse_transform(top_indices)
        print(f"  → ML recommendations: {top_foods.tolist()}")
        return top_foods.tolist(), "ML Model"
    else:
        print(f"[STEP 2: SKIP] User not in ML training data")
    
    # Step 3: Cold start - return popular items with reviews first
    print(f"\n[STEP 3] Cold start fallback...")
    if mongo_ready:
        print(f"  → Fetching popular items from database")
        # Try to get items with reviews first
        popular = list(menu_items_collection.find({
            'isAvailable': True,
            'averageRating': {'$gt': 0}  # Prioritize items with reviews
        }).sort([('averageRating', -1), ('reviewCount', -1)]).limit(top_n))
        
        # If not enough items with reviews, fill with any available items
        if len(popular) < top_n:
            print(f"  → Only {len(popular)} items with reviews, adding items without reviews...")
            additional = list(menu_items_collection.find({
                'isAvailable': True,
                'averageRating': 0  # Items without reviews
            }).sort('createdAt', -1).limit(top_n - len(popular)))
            popular.extend(additional)
        
        pop_names = [item['name'] for item in popular]
        print(f"  → Returning {len(pop_names)} popular items: {pop_names}")
        print(f"\n[RESULT] Using popular items for new user\n{'='*50}\n")
        return pop_names, "Popular Items (Cold Start)"
    
    # Last resort: random from ML encoder
    print(f"\n[STEP 4] Last resort - random items...")
    if rec_ready:
        random_items = np.random.choice(item_enc.classes_, top_n, replace=False)
        print(f"  → Random items: {random_items.tolist()}")
        print(f"\n[RESULT] Using random items\n{'='*50}\n")
        return random_items.tolist(), "Random"
    
    print(f"\n[RESULT] No recommendations available\n{'='*50}\n")
    return [], "No recommendations available"


# ==========================================
# ENDPOINT 1: RECOMMENDATIONS
# ==========================================
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        user_id_str = data.get('user_id')
        
        if not user_id_str:
            return jsonify({"error": "user_id is required"}), 400
        
        recommendations, status = get_personalized_recommendations(user_id_str, top_n=5)
        
        return jsonify({
            "user_id": user_id_str,
            "recommendations": recommendations,
            "status": status
        })

    except Exception as e:
        print(f"Error in /recommend: {e}")
        return jsonify({"error": str(e)}), 500


# ==========================================
# ENDPOINT 2: SENTIMENT ANALYSIS
# ==========================================
def rule_based_sentiment_analysis(comment):
    """
    Fallback rule-based sentiment analysis for low-confidence ML predictions.
    Uses keyword matching with negation handling for accurate basic sentiment detection.
    """
    comment_lower = comment.lower()
    
    # Define sentiment keywords
    positive_keywords = [
        'good', 'great', 'excellent', 'amazing', 'love', 'best', 'delicious', 
        'tasty', 'taste', 'perfect', 'wonderful', 'fantastic', 'awesome', 'nice', 
        'recommend', 'fresh', 'quality', 'enjoyed', 'satisfied', 'pleased',
        'yummy', 'lovely', 'brilliant', 'superb', 'outstanding', 'exceptional',
        'favorite', 'favourite', 'incredible', 'flavorful', 'flavourful',
        'crispy', 'juicy', 'tender', 'moist', 'rich', 'savory', 'savoury', 'like'
    ]
    
    negative_keywords = [
        'bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'disgusting',
        'horrible', 'nasty', 'disappointing', 'disappointed', 'unacceptable',
        'cold', 'stale', 'bland', 'overpriced', 'slow', 'rude', 'dirty',
        'gross', 'sucks', 'horrible', 'soggy', 'burnt', 'raw', 'undercooked',
        'overcooked', 'tasteless', 'flavorless', 'flavourless', 'dislike'
    ]
    
    # Negation words that flip sentiment
    negation_words = ['not', "don't", "dont", "doesn't", "doesnt", "didn't", 
                      "didnt", "no", "never", "nothing", "neither", "nobody", 
                      "nowhere", "hardly", "barely", "scarcely"]
    
    # Split into words for context-aware analysis
    words = comment_lower.split()
    
    positive_count = 0
    negative_count = 0
    
    # Check each word with negation context (look 1-2 words back)
    for i, word in enumerate(words):
        # Check if previous 1-2 words contain negation
        has_negation = False
        if i > 0 and any(neg in words[i-1] for neg in negation_words):
            has_negation = True
        if i > 1 and any(neg in words[i-2] for neg in negation_words):
            has_negation = True
        
        # Check if current word is positive
        if any(pos in word for pos in positive_keywords):
            if has_negation:
                negative_count += 1  # Negated positive = negative
            else:
                positive_count += 1
        
        # Check if current word is negative
        elif any(neg in word for neg in negative_keywords):
            if has_negation:
                positive_count += 1  # Negated negative = positive (e.g., "not bad")
            else:
                negative_count += 1
    
    # Determine sentiment based on counts
    if positive_count > negative_count:
        sentiment = 'Positive'
        confidence = min(0.6 + (positive_count * 0.1), 0.95)
    elif negative_count > positive_count:
        sentiment = 'Negative'
        confidence = min(0.6 + (negative_count * 0.1), 0.95)
    else:
        sentiment = 'Neutral'
        confidence = 0.5
    
    return sentiment, confidence


@app.route('/analyze_feedback', methods=['POST'])
def analyze_feedback():
    try:
        data = request.get_json()
        comment = data.get('comment')
        
        if not comment:
            return jsonify({"error": "No comment provided"}), 400
        
        # Hybrid approach: ML primary, rule-based fallback
        if nlp_ready:
            seq = tokenizer.texts_to_sequences([comment])
            padded = pad_sequences(seq, maxlen=100)
            pred = sentiment_model.predict(padded, verbose=0)
            label_idx = np.argmax(pred)
            labels = {0: 'Negative', 1: 'Neutral', 2: 'Positive'}
            ml_result = labels[label_idx]
            ml_confidence = float(np.max(pred))
            
            # Use ML if confidence is high (>= 60%), otherwise use rule-based
            if ml_confidence >= 0.6:
                result = ml_result
                confidence = ml_confidence
                print(f"[SENTIMENT] ML Analysis (High Confidence): {result} ({confidence:.2f})")
            else:
                result, confidence = rule_based_sentiment_analysis(comment)
                print(f"[SENTIMENT] ML confidence too low ({ml_confidence:.2f}), using Rule-based: {result} ({confidence:.2f})")
        else:
            # ML not available, use rule-based
            result, confidence = rule_based_sentiment_analysis(comment)
            print(f"[SENTIMENT] Rule-based Analysis (ML offline): {result} ({confidence:.2f})")
        
        return jsonify({
            "comment": comment,
            "sentiment": result,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)