import numpy as np
import pandas as pd
import tensorflow as tf
import pickle
from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing.sequence import pad_sequences # Crucial for NLP

# Initialize Flask App
app = Flask(__name__)

print("-----------------------------------")
print("1. Loading AI Models...")

# ==========================================
# A. LOAD RECOMMENDATION ENGINE
# ==========================================
try:
    rec_model = tf.keras.models.load_model('recommender_model.h5', compile=False)
    with open('user_encoder.pkl', 'rb') as f:
        user_enc = pickle.load(f)
    with open('item_encoder.pkl', 'rb') as f:
        item_enc = pickle.load(f)

    # Prepare helper data for recommendation
    num_items = len(item_enc.classes_)
    all_food_idxs = np.arange(num_items)
    print("   [SUCCESS] Recommendation Model Loaded!")
    rec_ready = True
except Exception as e:
    print(f"   [WARNING] Recommendation files missing: {e}")
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
    print(f"   [WARNING] NLP files (sentiment_model.h5 or tokenizer.pkl) missing. Feature disabled.")
    nlp_ready = False

print("-----------------------------------")


@app.route('/')
def home():
    status = "Online"
    return jsonify({
        "status": status,
        "recommendation_engine": "Active" if rec_ready else "Inactive",
        "nlp_engine": "Active" if nlp_ready else "Inactive"
    })

# ==========================================
# ENDPOINT 1: RECOMMENDATIONS (For Menu)
# ==========================================
@app.route('/recommend', methods=['POST'])
def recommend():
    if not rec_ready:
        return jsonify({"error": "Recommendation Engine is offline"}), 500

    try:
        data = request.get_json()
        user_id_str = data.get('user_id')
        
        # Handle New Users (Not in database)
        if user_id_str not in user_enc.classes_:
            random_items = np.random.choice(item_enc.classes_, 5, replace=False)
            return jsonify({
                "user_id": user_id_str,
                "recommendations": random_items.tolist(),
                "status": "New User - Random Recommendations"
            })

        # Predict
        user_idx = user_enc.transform([user_id_str])[0]
        user_input_array = np.full(num_items, user_idx)
        
        # The Model predicts ratings for ALL items
        predictions = rec_model.predict([user_input_array, all_food_idxs], verbose=0).flatten()
        
        # Get Top 5
        top_5_indices = predictions.argsort()[-5:][::-1]
        top_5_foods = item_enc.inverse_transform(top_5_indices)
        
        return jsonify({
            "user_id": user_id_str,
            "recommendations": top_5_foods.tolist(),
            "status": "Success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# ENDPOINT 2: SENTIMENT ANALYSIS (For Dashboard)
# ==========================================
@app.route('/analyze_feedback', methods=['POST'])
def analyze_feedback():
    if not nlp_ready:
        return jsonify({"error": "NLP Engine is offline (Missing .h5 or .pkl)"}), 500

    try:
        data = request.get_json()
        comment = data.get('comment') # e.g. "The food was cold"
        
        if not comment:
            return jsonify({"error": "No comment provided"}), 400
        
        # 1. Preprocess (Must match training logic!)
        seq = tokenizer.texts_to_sequences([comment])
        padded = pad_sequences(seq, maxlen=100) # Max length from training
        
        # 2. Predict
        pred = sentiment_model.predict(padded, verbose=0)
        label_idx = np.argmax(pred) # 0, 1, or 2
        
        # 3. Convert Number to Label
        labels = {0: 'Negative', 1: 'Neutral', 2: 'Positive'}
        result = labels[label_idx]
        confidence = float(np.max(pred))
        
        return jsonify({
            "comment": comment,
            "sentiment": result,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)