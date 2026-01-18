"""
FYP Comparison Script
Compare Logic-Based vs Pure ML Recommendations
"""

import requests
import json

# Service URLs
LOGIC_SERVICE = "http://127.0.0.1:5000"  # ai_service.py
ML_SERVICE = "http://127.0.0.1:5001"      # ai_service_pure_ml.py

def print_section(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def test_user(user_id):
    print_section(f"TESTING USER: {user_id}")
    
    # Test Logic-Based Service
    print("\n📊 LOGIC-BASED APPROACH (Port 5000)")
    print("-" * 70)
    try:
        response = requests.post(
            f"{LOGIC_SERVICE}/recommend",
            json={"user_id": user_id},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Status: {data.get('status')}")
            print(f"✓ Recommendations ({len(data.get('recommendations', []))}):")
            for i, item in enumerate(data.get('recommendations', []), 1):
                print(f"   {i}. {item}")
        else:
            print(f"✗ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"✗ Service not running: {e}")
        print("  → Start with: python ai_service.py")
    
    # Test Pure ML Service
    print("\n🤖 PURE ML APPROACH (Port 5001)")
    print("-" * 70)
    try:
        response = requests.post(
            f"{ML_SERVICE}/recommend",
            json={"user_id": user_id},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Status: {data.get('status')}")
            print(f"✓ Approach: {data.get('approach')}")
            print(f"✓ Recommendations ({len(data.get('recommendations', []))}):")
            for i, item in enumerate(data.get('recommendations', []), 1):
                print(f"   {i}. {item}")
        else:
            print(f"✗ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"✗ Service not running: {e}")
        print("  → Start with: python ai_service_pure_ml.py")
    
    # Get comparison analysis
    print("\n📈 COMPARISON ANALYSIS")
    print("-" * 70)
    try:
        response = requests.post(
            f"{ML_SERVICE}/compare",
            json={"user_id": user_id},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            comp = data.get('comparison', {})
            
            print("\n🤖 ML Advantages:")
            for adv in comp.get('ml_advantages', []):
                print(f"   • {adv}")
            
            print("\n📊 Logic Advantages:")
            for adv in comp.get('logic_advantages', []):
                print(f"   • {adv}")
    except:
        pass

def main():
    print_section("FYP: RECOMMENDATION SYSTEM COMPARISON")
    print("\nThis script compares two approaches:")
    print("  1. Logic-Based: Uses rules, categories, and ratings")
    print("  2. Pure ML: Uses neural network predictions only")
    
    # Test users
    test_users = [
        "6937d6737ade80a94df9a322",  # Your existing user
        "675f3da3b7e0c957a5e66fe9",  # Another user
        "new_user_test_123"           # New user (cold start)
    ]
    
    for user_id in test_users:
        test_user(user_id)
    
    print_section("SUMMARY FOR FYP PRESENTATION")
    print("""
📊 LOGIC-BASED SYSTEM (ai_service.py - Port 5000)
   Approach: Rule-based with category matching
   Strengths:
     • Transparent recommendations (explainable)
     • Works immediately with new menu items
     • Respects user ratings (4-5★ favorites)
     • Real-time updates
   Weaknesses:
     • Requires explicit user actions (purchases, ratings)
     • Can't discover hidden patterns
     • Limited to defined rules

🤖 PURE ML SYSTEM (ai_service_pure_ml.py - Port 5001)
   Approach: Neural network collaborative filtering
   Strengths:
     • Discovers hidden patterns in behavior
     • Learns from all users (collaborative)
     • Can predict unexpected preferences
     • Gets better with more data
   Weaknesses:
     • "Black box" (hard to explain WHY)
     • Needs retraining for new items
     • Requires sufficient training data
     • Cold start problem for new users

💡 RECOMMENDATION FOR FYP:
   Use HYBRID approach in production:
     • Pure ML for pattern discovery
     • Logic for transparency and control
     • Combine both scores for final ranking
    """)

if __name__ == "__main__":
    main()
