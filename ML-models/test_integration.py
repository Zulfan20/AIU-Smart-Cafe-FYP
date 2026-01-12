"""
Test script for sentiment analysis integration
Run this to verify the sentiment model is working correctly
"""

import requests
import json

# Service URL
ML_SERVICE_URL = "http://127.0.0.1:5000"

def test_service_health():
    """Test if the service is running"""
    print("=" * 60)
    print("TEST 1: Service Health Check")
    print("=" * 60)
    try:
        response = requests.get(f"{ML_SERVICE_URL}/")
        print(f"✓ Service is online!")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"✗ Service is offline: {e}")
        return False

def test_sentiment_analysis():
    """Test sentiment analysis endpoint"""
    print("\n" + "=" * 60)
    print("TEST 2: Sentiment Analysis")
    print("=" * 60)
    
    test_cases = [
        {
            "comment": "The food was absolutely amazing! Best meal I've ever had.",
            "expected": "Positive"
        },
        {
            "comment": "Terrible service. Food was cold and tasted bad.",
            "expected": "Negative"
        },
        {
            "comment": "The portion size was average. Nothing special.",
            "expected": "Neutral"
        },
        {
            "comment": "I love this place! The staff is so friendly and the food is delicious.",
            "expected": "Positive"
        },
        {
            "comment": "Disappointed with the quality. Won't be coming back.",
            "expected": "Negative"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Comment: \"{test_case['comment']}\"")
        print(f"Expected: {test_case['expected']}")
        
        try:
            response = requests.post(
                f"{ML_SERVICE_URL}/analyze_feedback",
                json={"comment": test_case['comment']},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                sentiment = result.get('sentiment')
                confidence = result.get('confidence', 0)
                
                match = "✓" if sentiment == test_case['expected'] else "✗"
                print(f"{match} Result: {sentiment} (Confidence: {confidence:.2%})")
                
                if sentiment != test_case['expected']:
                    print(f"  Warning: Expected {test_case['expected']} but got {sentiment}")
            else:
                print(f"✗ Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"✗ Request failed: {e}")

def test_recommendations():
    """Test recommendations endpoint"""
    print("\n" + "=" * 60)
    print("TEST 3: Recommendations")
    print("=" * 60)
    
    # Use a test user ID (replace with a real one from your database)
    test_user_id = "507f1f77bcf86cd799439011"
    
    print(f"\nRequesting recommendations for user: {test_user_id}")
    
    try:
        response = requests.post(
            f"{ML_SERVICE_URL}/recommend",
            json={"user_id": test_user_id},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Recommendations received:")
            print(f"  Status: {result.get('status')}")
            print(f"  Items: {result.get('recommendations')}")
        else:
            print(f"✗ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"✗ Request failed: {e}")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("AI SERVICE INTEGRATION TEST")
    print("=" * 60)
    print("\nMake sure ai_service.py is running on port 5000")
    print("Command: python ai_service.py\n")
    
    # Run tests
    if test_service_health():
        test_sentiment_analysis()
        test_recommendations()
    else:
        print("\n✗ Cannot run tests - service is not running!")
        print("Please start the service with: python ai_service.py")
    
    print("\n" + "=" * 60)
    print("TESTS COMPLETE")
    print("=" * 60)
