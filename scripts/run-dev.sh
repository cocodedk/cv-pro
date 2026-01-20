#!/bin/bash

# CV Generator - Development Startup Script
# This script starts the backend in Docker and the frontend locally

set -e

echo "🚀 Starting CV Generator Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Supabase helper
SUPABASE_HELPER="$SCRIPT_DIR/supabase-dev.sh"
if [ -f "$SUPABASE_HELPER" ]; then
    # shellcheck source=/dev/null
    . "$SUPABASE_HELPER"
fi

# PID files for build watcher and dev server
BUILD_WATCHER_PID_FILE="$PROJECT_ROOT/.build-watcher.pid"
DEV_SERVER_PID_FILE="$PROJECT_ROOT/.dev-server.pid"

kill_tree() {
    local pid="$1"
    if [ -z "$pid" ]; then
        return
    fi
    if command -v pgrep > /dev/null 2>&1; then
        local children
        children=$(pgrep -P "$pid" || true)
        for child in $children; do
            kill_tree "$child"
        done
    fi
    kill "$pid" 2>/dev/null || true
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"

    # Stop build watcher if running
    if [ -f "$BUILD_WATCHER_PID_FILE" ]; then
        BUILD_WATCHER_PID=$(cat "$BUILD_WATCHER_PID_FILE")
        if ps -p "$BUILD_WATCHER_PID" > /dev/null 2>&1; then
            echo -e "${BLUE}Stopping build watcher...${NC}"
            kill_tree "$BUILD_WATCHER_PID"
        fi
        rm -f "$BUILD_WATCHER_PID_FILE"
    fi

    # Stop dev server if running
    if [ -f "$DEV_SERVER_PID_FILE" ]; then
        DEV_SERVER_PID=$(cat "$DEV_SERVER_PID_FILE")
        if ps -p "$DEV_SERVER_PID" > /dev/null 2>&1; then
            echo -e "${BLUE}Stopping frontend dev server...${NC}"
            kill_tree "$DEV_SERVER_PID"
        fi
        rm -f "$DEV_SERVER_PID_FILE"
    fi

    if [ "$(type -t supabase_stop)" = "function" ]; then
        supabase_stop
    fi

    docker-compose down
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Start local Supabase
if [ "$(type -t supabase_start)" = "function" ]; then
    echo -e "${BLUE}🧰 Starting local Supabase...${NC}"
    if ! supabase_start; then
        echo -e "${RED}❌ Failed to start Supabase. Ensure the Supabase CLI is available.${NC}"
        exit 1
    fi
fi

# Start backend service
echo -e "${BLUE}📦 Starting Docker services (backend)...${NC}"
docker-compose up -d

# Wait for backend to be ready
echo -e "${BLUE}⏳ Waiting for backend to be ready...${NC}"
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${YELLOW}⚠️  Backend health check timeout, but continuing anyway...${NC}"
fi

# Check if dependencies need installing
SHOULD_INSTALL=false
NODE_MODULES_LOCK="node_modules/.package-lock.json"

if [ ! -d "node_modules" ]; then
    SHOULD_INSTALL=true
else
    if [ -f "$NODE_MODULES_LOCK" ]; then
        if [ -f "package-lock.json" ] && [ "package-lock.json" -nt "$NODE_MODULES_LOCK" ]; then
            SHOULD_INSTALL=true
        fi
        if [ -f "package.json" ] && [ "package.json" -nt "$NODE_MODULES_LOCK" ]; then
            SHOULD_INSTALL=true
        fi
    else
        if [ -f "package-lock.json" ] && [ "package-lock.json" -nt "node_modules" ]; then
            SHOULD_INSTALL=true
        fi
        if [ -f "package.json" ] && [ "package.json" -nt "node_modules" ]; then
            SHOULD_INSTALL=true
        fi
    fi
fi

if [ "$SHOULD_INSTALL" = true ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
fi

# Start build watcher in background
echo -e "${BLUE}🔨 Starting build watcher...${NC}"
npm run build:watch > /dev/null 2>&1 &
BUILD_WATCHER_PID=$!
echo "$BUILD_WATCHER_PID" > "$BUILD_WATCHER_PID_FILE"
echo -e "${GREEN}✅ Build watcher started (PID: $BUILD_WATCHER_PID)${NC}"

# Start frontend dev server
echo ""
echo -e "${GREEN}✅ Docker services are running!${NC}"
echo -e "${BLUE}🌐 Starting frontend dev server...${NC}"
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}   CV Generator is running!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "Frontend (with HMR): ${BLUE}http://localhost:5173${NC}"
echo -e "Backend API:         ${BLUE}http://localhost:8000${NC}"
echo -e "API Docs:            ${BLUE}http://localhost:8000/docs${NC}"
echo -e "Supabase Studio:     ${BLUE}http://localhost:54323${NC}"
echo -e "Supabase API:        ${BLUE}http://localhost:54321${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Start frontend (wait on dev server)
npm run dev &
DEV_SERVER_PID=$!
echo "$DEV_SERVER_PID" > "$DEV_SERVER_PID_FILE"
wait "$DEV_SERVER_PID"
rm -f "$DEV_SERVER_PID_FILE"
