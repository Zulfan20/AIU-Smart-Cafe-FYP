"""
Test script to verify personalized recommendations
"""
import requests
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

ML_SERVICE_URL = "http://127.0.0.1:5000"
MONGODB_URI = "mongodb+srv://zulfanisious20_db_user:RgxMh7QEGqmiBsaD@aiu-cafe.khakonf.mongodb.net/test?retryWrites=true&w=majority&appName=db-aiu-cafe"

print("=" * 60)
print("PERSONALIZED RECOMMENDATION TEST")
print("=" * 60)

# Connect to MongoDB
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client.get_database()
    print(f"✓ Connected to MongoDB (Database: {db.name})")
except Exception as e:
    print(f"✗ Failed to connect to MongoDB: {e}")
    exit(1)

# Find a user with orders
print("\n" + "-" * 60)
print("Finding users with order history...")
print("-" * 60)

users_collection = db['users']
orders_collection = db['orders']

# Get all users
all_users = list(users_collection.find({'role': 'student'}))
print(f"Total students in database: {len(all_users)}")

# Find users with completed orders
users_with_orders = []
for user in all_users:
    order_count = orders_collection.count_documents({
        'userId': user['_id'],
        'status': {'$in': ['Completed', 'Ready']}
    })
    if order_count > 0:
        users_with_orders.append({
            'id': str(user['_id']),
            'name': user.get('name', 'Unknown'),
            'email': user.get('email', 'Unknown'),
            'order_count': order_count
        })

print(f"\nUsers with order history: {len(users_with_orders)}")

if len(users_with_orders) == 0:
    print("\n⚠️  WARNING: No users with order history found!")
    print("   To test personalization:")
    print("   1. Log in to the app as a student")
    print("   2. Place and complete at least one order")
    print("   3. Run this test again")
    
    # Test with a new user instead
    print("\n" + "-" * 60)
    print("Testing with NEW USER (should get popular items)...")
    print("-" * 60)
    
    test_user_id = "new_user_" + datetime.now().strftime("%Y%m%d%H%M%S")
    
    try:
        response = requests.post(
            f"{ML_SERVICE_URL}/recommend",
            json={"user_id": test_user_id},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✓ Recommendations received!")
            print(f"  Status: {data.get('status')}")
            print(f"  Items: {data.get('recommendations', [])}")
            print(f"\nThis is expected behavior for new users (cold start)")
        else:
            print(f"✗ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"✗ Request failed: {e}")
    
    exit(0)

# Test with users who have orders
print("\n" + "=" * 60)
print("TESTING PERSONALIZATION")
print("=" * 60)

for i, user_info in enumerate(users_with_orders[:3], 1):  # Test first 3 users
    print(f"\n{'='*60}")
    print(f"TEST {i}: User with Order History")
    print(f"{'='*60}")
    print(f"User ID: {user_info['id']}")
    print(f"Name: {user_info['name']}")
    print(f"Email: {user_info['email']}")
    print(f"Completed Orders: {user_info['order_count']}")
    
    # Get their order details
    user_orders = list(orders_collection.find({
        'userId': ObjectId(user_info['id']),
        'status': {'$in': ['Completed', 'Ready']}
    }))
    
    purchased_items = []
    for order in user_orders:
        for item in order.get('items', []):
            purchased_items.append(item.get('name'))
    
    print(f"\nPurchased Items: {list(set(purchased_items))}")
    
    # Get recommendations
    print(f"\n{'─'*60}")
    print("Requesting recommendations from ML service...")
    print(f"{'─'*60}")
    
    try:
        response = requests.post(
            f"{ML_SERVICE_URL}/recommend",
            json={"user_id": user_info['id']},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            recommendations = data.get('recommendations', [])
            status = data.get('status', 'Unknown')
            
            print(f"\n✓ SUCCESS!")
            print(f"  Status: {status}")
            print(f"  Recommendations: {recommendations}")
            
            # Check if personalized
            if "Personalized" in status:
                print(f"\n✅ PERSONALIZATION WORKING!")
                print(f"   Recommendations are based on purchase history")
                
                # Check if recommendations exclude purchased items
                overlap = set(recommendations) & set(purchased_items)
                if overlap:
                    print(f"\n⚠️  Note: {len(overlap)} recommended items were already purchased: {overlap}")
                else:
                    print(f"\n✅ All recommendations are NEW items (not purchased yet)")
            else:
                print(f"\n⚠️  Using fallback: {status}")
                print(f"   This may indicate an issue with personalization logic")
        else:
            print(f"\n✗ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"\n✗ Request failed: {e}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
