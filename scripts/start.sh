#!/bin/bash

# CodeSign Inspector - Full Application Startup Script
# This script starts both backend API and frontend Electron app

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_status "🛡️  Starting CodeSign Inspector..."
print_status "📁 Project root: $PROJECT_ROOT"

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    print_error ".NET SDK is not installed. Please install .NET 8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success ".NET SDK version: $(dotnet --version)"
print_success "Node.js version: $(node --version)"
print_success "npm version: $(npm --version)"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port &> /dev/null; then
        return 0  # Port is in use
    else
        return 1  # Port is available
    fi
}

# Kill any existing processes on our ports
print_status "🧹 Cleaning up existing processes..."
if check_port 5000; then
    print_warning "Port 5000 is in use. Attempting to free it..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
fi

if check_port 3000; then
    print_warning "Port 3000 is in use. Attempting to free it..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Build backend
print_status "🔨 Building backend API..."
cd "$PROJECT_ROOT/backend/API"
if dotnet build; then
    print_success "Backend build completed"
else
    print_error "Backend build failed"
    exit 1
fi

# Install frontend dependencies
print_status "📦 Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_error "Frontend dependency installation failed"
    exit 1
fi

# Build frontend
print_status "🔨 Building frontend..."
if npm run build; then
    print_success "Frontend build completed"
else
    print_error "Frontend build failed"
    exit 1
fi

# Create PID file directory
mkdir -p "$PROJECT_ROOT/tmp"

# Start backend API in background
print_status "🚀 Starting backend API server..."
cd "$PROJECT_ROOT/backend/API"
nohup dotnet run > "$PROJECT_ROOT/tmp/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_ROOT/tmp/backend.pid"
print_success "Backend API started (PID: $BACKEND_PID)"

# Wait for backend to be ready
print_status "⏳ Waiting for backend API to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        print_success "Backend API is ready!"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
    echo -n "."
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Backend API failed to start within 30 seconds"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start Electron app
print_status "🖥️  Starting Electron application..."
cd "$PROJECT_ROOT/frontend"
npm start &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_ROOT/tmp/frontend.pid"
print_success "Electron application started (PID: $FRONTEND_PID)"

# Setup cleanup on exit
cleanup() {
    print_status "🛑 Shutting down application..."
    if [ -f "$PROJECT_ROOT/tmp/backend.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_ROOT/tmp/backend.pid")
        kill $BACKEND_PID 2>/dev/null || true
        rm -f "$PROJECT_ROOT/tmp/backend.pid"
        print_success "Backend API stopped"
    fi
    if [ -f "$PROJECT_ROOT/tmp/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_ROOT/tmp/frontend.pid")
        kill $FRONTEND_PID 2>/dev/null || true
        rm -f "$PROJECT_ROOT/tmp/frontend.pid"
        print_success "Electron application stopped"
    fi
    print_success "Cleanup completed"
}

trap cleanup EXIT INT TERM

print_success "🎉 CodeSign Inspector is now running!"
print_status "📡 Backend API: http://localhost:5000"
print_status "🖥️  Frontend: Electron application window"
print_status "📋 API Documentation: http://localhost:5000/swagger"
print_status ""
print_status "Press Ctrl+C to stop the application"

# Wait for frontend process to finish
wait $FRONTEND_PID
