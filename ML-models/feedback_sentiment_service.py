from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js to call this API

# Load the trained model
MODEL_PATH = './my_cafe_model'

print("="*50)
print("Loading Sentiment Analysis Model...")
print("="*50)

try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    model.eval()  # Set to evaluation mode
    print("✓ Model loaded successfully from", MODEL_PATH)
    model_ready = True
except Exception as e:
    print(f"✗ Error loading model: {e}")
    model_ready = False

print("="*50)


@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "Online",
        "service": "Feedback Sentiment Analysis",
        "model_status": "Ready" if model_ready else "Error - Model not loaded",
        "model_path": MODEL_PATH
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
    if not model_ready:
        return jsonify({
            "error": "Model not loaded. Please check server logs."
        }), 503
    
    try:
        data = request.get_json()
        comment = data.get('comment', '').strip()
        
        if not comment:
            return jsonify({"error": "No comment provided"}), 400
        
        # Tokenize and predict
        inputs = tokenizer(comment, return_tensors="pt", truncation=True, 
                          padding=True, max_length=512)
        
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            predicted_class = torch.argmax(predictions, dim=-1).item()
            confidence = predictions[0][predicted_class].item()
        
        # Map class to sentiment label
        # Adjust this mapping based on your model's training labels
        sentiment_map = {
            0: "Negative",
            1: "Neutral", 
            2: "Positive"
        }
        
        sentiment = sentiment_map.get(predicted_class, "Unknown")
        
        print(f"[ANALYSIS] Comment: '{comment[:50]}...'")
        print(f"[RESULT] Sentiment: {sentiment} (confidence: {confidence:.2f})")
        
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
    
    Response:
    {
        "results": [
            {"comment": "Great food!", "sentiment": "Positive", "confidence": 0.95},
            {"comment": "Bad service", "sentiment": "Negative", "confidence": 0.88},
            {"comment": "Average meal", "sentiment": "Neutral", "confidence": 0.72}
        ]
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
            inputs = tokenizer(comment, return_tensors="pt", truncation=True,
                             padding=True, max_length=512)
            
            with torch.no_grad():
                outputs = model(**inputs)
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


if __name__ == '__main__':
    print("\n" + "="*50)
    print("Starting Feedback Sentiment Analysis Service")
    print("Port: 5001")
    print("Endpoints:")
    print("  GET  /              - Health check")
    print("  POST /analyze_feedback  - Single feedback analysis")
    print("  POST /batch_analyze     - Batch feedback analysis")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
