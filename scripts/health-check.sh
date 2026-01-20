#!/bin/bash

# CV Generator - Health Check Script
# Checks backend health status and database connectivity.

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Defaults
BACKEND_URL="http://localhost:8000"
HEALTH_PATH="/api/health"
RETRIES=1
DELAY_SECONDS=1

show_help() {
    echo "CV Generator Health Check"
    echo ""
    echo "Usage:"
    echo "  ./scripts/health-check.sh [options]"
    echo ""
    echo "Options:"
    echo "  --backend-url <url>   Backend base URL (default: http://localhost:8000)"
    echo "  --retries <count>     Number of attempts (default: 1)"
    echo "  --delay <seconds>     Delay between retries (default: 1)"
    echo "  --help, -h            Show this help message"
}

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --backend-url)
            BACKEND_URL="$2"
            shift 2
            ;;
        --retries)
            RETRIES="$2"
            shift 2
            ;;
        --delay)
            DELAY_SECONDS="$2"
            shift 2
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help to see usage information"
            exit 1
            ;;
    esac
done

HEALTH_URL="${BACKEND_URL%/}${HEALTH_PATH}"

PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
fi

if [ -z "$PYTHON_BIN" ]; then
    echo -e "${RED}❌ Python is required to parse health responses.${NC}"
    exit 1
fi

echo -e "${BLUE}🏥 Running health check...${NC}"

attempt=1
last_response=""
while [ $attempt -le $RETRIES ]; do
    last_response="$(curl -s --max-time 5 "$HEALTH_URL" || true)"
    if [ -n "$last_response" ]; then
        parsed="$($PYTHON_BIN - <<'PY'
import json
import sys

try:
    payload = json.load(sys.stdin)
except json.JSONDecodeError:
    payload = {}

print(payload.get("status", ""))
print(payload.get("database", ""))
print(payload.get("provider", ""))
PY
<<< "$last_response")"

        status="$(echo "$parsed" | sed -n '1p')"
        database="$(echo "$parsed" | sed -n '2p')"
        provider="$(echo "$parsed" | sed -n '3p')"

        if [ "$status" = "healthy" ] && [ "$database" = "connected" ]; then
            echo -e "${GREEN}✅ Backend healthy (provider: ${provider:-unknown})${NC}"
            exit 0
        fi

        echo -e "${YELLOW}⚠️  Backend responded but is unhealthy (status: ${status:-unknown}).${NC}"
    else
        echo -e "${YELLOW}⚠️  No response from ${HEALTH_URL} (attempt $attempt/$RETRIES).${NC}"
    fi

    attempt=$((attempt + 1))
    if [ $attempt -le $RETRIES ]; then
        sleep "$DELAY_SECONDS"
    fi
done

echo -e "${RED}❌ Health check failed.${NC}"
if [ -n "$last_response" ]; then
    echo -e "${YELLOW}Response:${NC} $last_response"
fi
exit 1
