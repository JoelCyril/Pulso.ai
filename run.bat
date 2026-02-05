@echo off
setlocal
echo ==========================================
echo Starting Aura Health Design Development Server
echo ==========================================

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] node_modules folder not found. Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

:: Start the development server
echo [INFO] Starting Vite development server...
:: Set browser to chrome for Vite and also try to start it explicitly
set BROWSER=chrome
start chrome http://localhost:8080
call npm run dev

pause
