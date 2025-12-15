@echo off
REM Frontend Starter for Exam Surveillance Management Application
echo ============================================
echo Starting Frontend Development Server
echo ============================================
echo.

cd "projet CL\frontend"

echo Checking npm installation...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Starting Vite development server...
echo The application will be available at: http://localhost:5173 or http://localhost:5174
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
