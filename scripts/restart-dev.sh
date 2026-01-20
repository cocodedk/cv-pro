#!/bin/bash

# CV Generator - Development Restart Script
# Stops and restarts all services

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Restarting CV Generator Development Environment...${NC}"

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

# Stop existing services
echo -e "${BLUE}🛑 Stopping existing services...${NC}"

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
    SUPABASE_FORCE_STOP=true supabase_stop
fi

docker-compose down

# Wait a moment for services to fully stop
sleep 2

echo -e "${GREEN}✅ Services stopped${NC}"

# Hand off startup to the primary script
echo -e "${BLUE}🚀 Handing off to run-dev.sh...${NC}"
exec "$SCRIPT_DIR/run-dev.sh"
