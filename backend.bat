@echo off
REM Backend Starter for Exam Surveillance Management Application
echo ============================================
echo Starting Backend Spring Boot Server
echo ============================================
echo.

cd "projet CL\projet"

echo Checking Java installation...
java -version >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 21 or higher
    pause
    exit /b 1
)

echo.
echo Checking Maven installation...
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Apache Maven from https://maven.apache.org/
    pause
    exit /b 1
)

echo.
echo ============================================
echo IMPORTANT: MySQL Database Required
echo ============================================
echo This application requires MySQL server running on localhost:3306
echo Database name: fsegs
echo Username: root
echo Password: (empty)
echo.
echo Please make sure MySQL is running before continuing.
echo If MySQL is not installed, install it from: https://dev.mysql.com/downloads/mysql/
echo.
pause

echo.
echo Starting Spring Boot application...
echo The backend API will be available at: http://localhost:8081
echo.
echo Press Ctrl+C to stop the server
echo.

call mvn spring-boot:run

pause
