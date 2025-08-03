#!/bin/bash

# CodeSign Inspector - Development Mode Script
# This script starts backend API and frontend dev server with hot reload

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_status "🔧 Starting CodeSign Inspector in Development Mode..."

# Create PID file directory
mkdir -p "$PROJECT_ROOT/tmp"

# Start backend API with hot reload
print_status "🚀 Starting backend API with hot reload..."
cd "$PROJECT_ROOT/backend/API"
dotnet watch run > "$PROJECT_ROOT/tmp/backend-dev.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_ROOT/tmp/backend-dev.pid"
print_success "Backend API started with hot reload (PID: $BACKEND_PID)"

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

# Start frontend dev server
print_status "🖥️  Starting frontend development server..."
cd "$PROJECT_ROOT/frontend"
npm install
npm run dev:renderer &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_ROOT/tmp/frontend-dev.pid"
print_success "Frontend dev server started (PID: $FRONTEND_PID)"

# Setup cleanup
cleanup() {
    print_status "🛑 Shutting down development servers..."
    if [ -f "$PROJECT_ROOT/tmp/backend-dev.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_ROOT/tmp/backend-dev.pid")
        kill $BACKEND_PID 2>/dev/null || true
        rm -f "$PROJECT_ROOT/tmp/backend-dev.pid"
        print_success "Backend API stopped"
    fi
    if [ -f "$PROJECT_ROOT/tmp/frontend-dev.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_ROOT/tmp/frontend-dev.pid")
        kill $FRONTEND_PID 2>/dev/null || true
        rm -f "$PROJECT_ROOT/tmp/frontend-dev.pid"
        print_success "Frontend dev server stopped"
    fi
}

trap cleanup EXIT INT TERM

print_success "🎉 Development servers are running!"
print_status "📡 Backend API: http://localhost:5000 (with hot reload)"
print_status "🖥️  Frontend: http://localhost:3000 (with hot reload)"
print_status "📋 API Documentation: http://localhost:5000/swagger"
print_status ""
print_status "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
