@echo off
echo ============================================================
echo Starting Pure ML Service with Real MongoDB Integration
echo ============================================================
echo.
echo This service combines:
echo   - TensorFlow Neural Network (Pre-trained ML Model)
echo   - Real-time MongoDB Data (Your actual users and orders)
echo.
echo How it works:
echo   1. If user in training data: Pure ML predictions
echo   2. If user NOT in training but has orders: Item-based ML
echo   3. If new user: Popular items from database
echo.
echo Port: 5001
echo Database: MongoDB Atlas (aiu-cafe)
echo ============================================================
echo.

python ai_service_pure_ml.py
