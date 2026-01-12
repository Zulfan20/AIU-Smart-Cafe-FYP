from flask import Flask, request, jsonify
import tensorflow as tf
import pickle
import numpy as np

app = Flask(__name__)

# Load the model and encoders
# Load without compiling since we only need it for inference
model = tf.keras.models.load_model('recommender_model.h5', compile=False)
with open('user_encoder.pkl', 'rb') as f:
    user_enc = pickle.load(f)
with open('item_encoder.pkl', 'rb') as f:
    item_enc = pickle.load(f)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "running",
        "service": "AI Recommendation Service",
        "version": "1.0",
        "endpoints": {
            "predict": "/predict (POST)"
        },
        "model_info": {
            "total_items": len(item_enc.classes_),
            "total_users": len(user_enc.classes_)
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    user_id = data.get('user_id')
    
    # 1. Encode user_id
    u_idx = user_enc.transform([user_id])[0]
    
    # 2. Prepare inputs for all items
    num_items = len(item_enc.classes_)
    item_indices = np.arange(num_items)
    user_input = np.array([u_idx] * num_items)
    
    # 3. Predict
    predictions = model.predict([user_input, item_indices], verbose=0).flatten()
    
    # 4. Get Top 5
    top_indices = predictions.argsort()[-5:][::-1]
    recommendations = item_enc.inverse_transform(top_indices)
    
    return jsonify({"recommendations": recommendations.tolist()})

if __name__ == '__main__':
    app.run(port=5000)