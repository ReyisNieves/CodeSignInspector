@echo off
REM CodeSign Inspector - Windows Startup Script

setlocal EnableDelayedExpansion

echo 🛡️  Starting CodeSign Inspector...

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

echo 📁 Project root: %PROJECT_ROOT%

REM Check if .NET is installed
where dotnet >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ .NET SDK is not installed. Please install .NET 8+ and try again.
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    exit /b 1
)

echo ✅ .NET SDK version:
dotnet --version

echo ✅ Node.js version:
node --version

echo ✅ npm version:
npm --version

REM Kill any existing processes on our ports
echo 🧹 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /PID %%a /F >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /PID %%a /F >nul 2>nul

REM Create temp directory
if not exist "%PROJECT_ROOT%\tmp" mkdir "%PROJECT_ROOT%\tmp"

REM Build backend
echo 🔨 Building backend API...
cd /d "%PROJECT_ROOT%\backend\API"
dotnet build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    exit /b 1
)
echo ✅ Backend build completed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd /d "%PROJECT_ROOT%\frontend"
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    exit /b 1
)
echo ✅ Frontend dependencies installed

REM Build frontend
echo 🔨 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)
echo ✅ Frontend build completed

REM Start backend API in background
echo 🚀 Starting backend API server...
cd /d "%PROJECT_ROOT%\backend\API"
start "Backend API" /MIN dotnet run

REM Wait for backend to be ready
echo ⏳ Waiting for backend API to be ready...
timeout /t 10 /nobreak >nul

REM Start Electron app
echo 🖥️  Starting Electron application...
cd /d "%PROJECT_ROOT%\frontend"
call npm start

echo ✅ 🎉 CodeSign Inspector started!
echo 📡 Backend API: http://localhost:5000
echo 📋 API Documentation: http://localhost:5000/swagger

pause
