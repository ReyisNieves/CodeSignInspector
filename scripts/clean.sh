#!/bin/bash

# CodeSign Inspector - Cleanup Script
# This script cleans build artifacts and stops running processes

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

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_status "🧹 Cleaning CodeSign Inspector project..."

# Stop running processes
if [ -f "$PROJECT_ROOT/tmp/backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_ROOT/tmp/backend.pid")
    kill $BACKEND_PID 2>/dev/null || true
    rm -f "$PROJECT_ROOT/tmp/backend.pid"
    print_success "Stopped backend API process"
fi

if [ -f "$PROJECT_ROOT/tmp/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_ROOT/tmp/frontend.pid")
    kill $FRONTEND_PID 2>/dev/null || true
    rm -f "$PROJECT_ROOT/tmp/frontend.pid"
    print_success "Stopped frontend process"
fi

if [ -f "$PROJECT_ROOT/tmp/backend-dev.pid" ]; then
    BACKEND_DEV_PID=$(cat "$PROJECT_ROOT/tmp/backend-dev.pid")
    kill $BACKEND_DEV_PID 2>/dev/null || true
    rm -f "$PROJECT_ROOT/tmp/backend-dev.pid"
    print_success "Stopped backend dev process"
fi

if [ -f "$PROJECT_ROOT/tmp/frontend-dev.pid" ]; then
    FRONTEND_DEV_PID=$(cat "$PROJECT_ROOT/tmp/frontend-dev.pid")
    kill $FRONTEND_DEV_PID 2>/dev/null || true
    rm -f "$PROJECT_ROOT/tmp/frontend-dev.pid"
    print_success "Stopped frontend dev process"
fi

# Kill processes on ports 5000 and 3000
print_status "🔍 Checking for processes on ports 5000 and 3000..."
if lsof -i :5000 &> /dev/null; then
    print_warning "Killing processes on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
    print_success "Port 5000 cleaned"
fi

if lsof -i :3000 &> /dev/null; then
    print_warning "Killing processes on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    print_success "Port 3000 cleaned"
fi

# Clean backend build artifacts
print_status "🗑️  Cleaning backend build artifacts..."
cd "$PROJECT_ROOT"
find . -name "bin" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "obj" -type d -exec rm -rf {} + 2>/dev/null || true
print_success "Backend build artifacts cleaned"

# Clean frontend build artifacts
print_status "🗑️  Cleaning frontend build artifacts..."
if [ -d "$PROJECT_ROOT/frontend/build" ]; then
    rm -rf "$PROJECT_ROOT/frontend/build"
    print_success "Frontend build directory cleaned"
fi

if [ -d "$PROJECT_ROOT/frontend/dist" ]; then
    rm -rf "$PROJECT_ROOT/frontend/dist"
    print_success "Frontend dist directory cleaned"
fi

if [ -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    print_warning "Removing node_modules (this may take a moment)..."
    rm -rf "$PROJECT_ROOT/frontend/node_modules"
    print_success "node_modules directory cleaned"
fi

# Clean temporary files
if [ -d "$PROJECT_ROOT/tmp" ]; then
    rm -rf "$PROJECT_ROOT/tmp"
    print_success "Temporary files cleaned"
fi

# Clean log files
find "$PROJECT_ROOT" -name "*.log" -type f -delete 2>/dev/null || true
print_success "Log files cleaned"

print_success "🎉 Cleanup completed!"
print_status "Run './scripts/start.sh' to start the application again"
