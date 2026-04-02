@echo off
echo ========================================
echo NestQuest Prototype
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting development server...
echo ========================================
echo.
echo Open http://localhost:3000 in your browser
echo Press Ctrl+C to stop the server
echo.

call npm run dev

