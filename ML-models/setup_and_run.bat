@echo off
echo ========================================
echo Setting up Python ML Service
echo ========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat

REM Install dependencies
echo.
echo Installing dependencies...
python -m pip install --upgrade pip
pip install flask tensorflow pandas numpy scikit-learn

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Starting ML Service on http://127.0.0.1:5000
echo Press Ctrl+C to stop the service
echo.

REM Start the service
python ai_service.py

pause
