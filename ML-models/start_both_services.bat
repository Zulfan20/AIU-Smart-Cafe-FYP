@echo off
REM FYP Demo: Start Both Recommendation Services
REM Run this to demo logic-based vs pure ML comparison

echo ============================================================
echo AIU Smart Cafe - FYP Recommendation System Comparison
echo ============================================================
echo.
echo This will start TWO services:
echo   1. Logic-Based System (Port 5000)
echo   2. Pure ML System (Port 5001)
echo.
echo Press Ctrl+C to stop both services
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking dependencies...
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Flask...
    pip install flask
)

python -c "import tensorflow" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: TensorFlow not installed
    echo Please run: pip install tensorflow
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Starting services...
echo ============================================================
echo.

REM Start both services in separate windows
start "Logic-Based Service (Port 5000)" cmd /k "python ai_service.py"
timeout /t 2 >nul

start "Pure ML Service (Port 5001)" cmd /k "python ai_service_pure_ml.py"
timeout /t 2 >nul

echo.
echo ============================================================
echo Both services are starting...
echo ============================================================
echo.
echo   Logic-Based: http://127.0.0.1:5000
echo   Pure ML:     http://127.0.0.1:5001
echo.
echo Test with: python compare_approaches.py
echo.
echo Close the terminal windows to stop services
echo ============================================================
pause
