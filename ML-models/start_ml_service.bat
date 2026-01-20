@echo off
echo ============================================================
echo Starting AI Service - All Models Combined
echo ============================================================
echo.
echo This service includes:
echo   1. Sentiment Analysis (Feedback)
echo   2. Recommendation System (Personalized Menu)
echo   3. Visual Search (Image-based Search)
echo.
echo Port: 5001
echo.
echo Models:
echo   - Sentiment: ./newml/
echo   - Recommender: recommender_mode.h5 + recommender_data.pkl
echo   - Visual Search: ./my_category_model/
echo ============================================================
echo.

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

echo Starting AI Service on port 5001...
python ai_service1.py
