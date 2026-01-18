"""
Quick test script to verify ML service is working
Run this after starting ai_service.py
"""
import requests
import json

ML_SERVICE_URL = "http://127.0.0.1:5000"

print("=" * 50)
print("Testing ML Recommendation Service")
print("=" * 50)

# Test 1: Check if service is running
try:
    response = requests.get(f"{ML_SERVICE_URL}/")
    print("\n✓ Service is running!")
    print(f"Status: {response.json()}")
except Exception as e:
    print(f"\n✗ Service is NOT running: {e}")
    print("Please start ai_service.py first!")
    exit(1)

# Test 2: Test recommendation endpoint
print("\n" + "=" * 50)
print("Testing /recommend endpoint")
print("=" * 50)

test_user_ids = ["675f3da3b7e0c957a5e66fe9", "new_user_123", "675f3da3b7e0c957a5e66fe9"]

for user_id in test_user_ids:
    print(f"\nTest with user_id: {user_id}")
    try:
        response = requests.post(
            f"{ML_SERVICE_URL}/recommend",
            json={"user_id": user_id},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Success! Status: {data.get('status')}")
            print(f"  Recommendations: {data.get('recommendations', [])}")
        else:
            print(f"✗ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"✗ Request failed: {e}")

print("\n" + "=" * 50)
print("Test complete!")
print("=" * 50)
