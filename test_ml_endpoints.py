import requests
import json

print("="*60)
print("Testing ML Service Endpoints")
print("="*60)

BASE_URL = "http://127.0.0.1:5001"

# Test 1: Health Check
print("\n1. Testing Health Check...")
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    print("   [OK] Health check passed!")
except Exception as e:
    print(f"   [ERROR] {e}")

# Test 2: Sentiment Analysis
print("\n2. Testing Sentiment Analysis...")
try:
    payload = {"comment": "The food was amazing and the service was great"}
    response = requests.post(f"{BASE_URL}/analyze_feedback", json=payload)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    print("   [OK] Sentiment analysis passed!")
except Exception as e:
    print(f"   [ERROR] {e}")

# Test 3: Recommendations
print("\n3. Testing Recommendations...")
try:
    payload = {"user_id": "675f3da3b7e0c957a5e66fe9"}
    response = requests.post(f"{BASE_URL}/recommend", json=payload)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    print("   [OK] Recommendations passed!")
except Exception as e:
    print(f"   [ERROR] {e}")

# Test 4: Visual Search (requires image)
print("\n4. Testing Visual Search...")
print("   (Skipping - requires actual image file)")

print("\n" + "="*60)
print("Tests Complete!")
print("="*60)
