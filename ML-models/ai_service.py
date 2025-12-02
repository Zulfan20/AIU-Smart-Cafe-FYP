import numpy as np
import pandas as pd
import tensorflow as tf
import pickle
from flask import Flask, request, jsonify

# Initialize Flask App
app = Flask(__name__)

print("-----------------------------------")
print("1. Loading AI Model and Encoders...")
# Load the Model (The Brain)
model = tf.keras.models.load_model('recommender_model.h5',compile=False)

# Load the Encoders (The Translators)
with open('user_encoder.pkl', 'rb') as f:
    user_enc = pickle.load(f)

with open('item_encoder.pkl', 'rb') as f:
    item_enc = pickle.load(f)

print("   - Model Loaded!")
print("   - Encoders Loaded!")

# Prepare the list of all food items (0 to 69)
num_items = len(item_enc.classes_)
all_food_idxs = np.arange(num_items)
print(f"   - System ready to recommend from {num_items} food items.")
print("-----------------------------------")

@app.route('/')
def home():
    return "AI Service is Running! Use POST /recommend endpoint."

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        # 1. Get User ID from the Request (sent by Node.js)
        data = request.get_json()
        user_id_str = data.get('user_id') # e.g., "U086"
        
        print(f"\n[REQUEST] Received recommendation request for: {user_id_str}")

        # 2. Check if this User exists in our "Brain"
        if user_id_str not in user_enc.classes_:
            print("   - User New/Unknown. Returning random popular items.")
            # Fallback: Just return random 5 items for new users
            random_items = np.random.choice(item_enc.classes_, 5, replace=False)
            return jsonify({
                "user_id": user_id_str,
                "recommendations": random_items.tolist(),
                "status": "New User - Random Recommendation"
            })

        # 3. Convert String ID ("U086") -> AI Number (5)
        user_idx = user_enc.transform([user_id_str])[0]

        # 4. Prepare Input for the AI
        # The AI expects: [ [User_ID, User_ID...], [Item_0, Item_1...] ]
        user_input_array = np.full(num_items, user_idx)

        # 5. Ask the Model to Predict Ratings for ALL foods
        # This is the "Method 1" inputs: [User List, Item List]
        predictions = model.predict([user_input_array, all_food_idxs], verbose=0).flatten()

        # 6. Find the Top 5 Highest Scores
        # argsort gives us the indices of the sorted array
        top_5_indices = predictions.argsort()[-5:][::-1]
        
        # 7. Translate AI Numbers (12, 45) -> Food Names ("Nasi Lemak", "Burger")
        top_5_foods = item_enc.inverse_transform(top_5_indices)
        
        print(f"   - Recommended: {top_5_foods}")

        # 8. Send Response back to Node.js
        return jsonify({
            "user_id": user_id_str,
            "recommendations": top_5_foods.tolist(),
            "status": "Success"
        })

    except Exception as e:
        print(f"   [ERROR]: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the server on Port 5000
    app.run(port=5000, debug=True)