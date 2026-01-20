# Development Setup

Complete guide for setting up the CV Generator development environment.

## Quick Setup

For the fastest setup, use the convenience script:

```bash
./scripts/run-dev.sh
```

This handles all setup steps automatically.

## Manual Setup

### Step 1: Start Supabase + Backend

Start Supabase locally:

```bash
supabase start
```

Start the backend service:

```bash
docker-compose up -d
```

This starts:
- Supabase services (ports 54321-54323)
- FastAPI backend (port 8000)

### Step 2: Install Frontend Dependencies

Install Node.js dependencies:

```bash
npm install
```

### Step 3: Start Frontend Dev Server

Start the Vite development server:

```bash
npm run dev
```

Frontend will be available at http://localhost:5173 with hot module replacement.

## Environment Variables

Create a `.env` file in the project root (optional, defaults provided):

```env
# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_DEFAULT_USER_ID=your-test-user-id

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:8000

# AI Configuration (Optional - for LLM rewrite feature)
AI_ENABLED=false
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your-api-key-here
AI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.7
AI_REQUEST_TIMEOUT_S=30
```

**Note**: AI environment variables are optional. The AI rewrite feature requires `AI_ENABLED=true`, `AI_BASE_URL`, and `AI_API_KEY` to be set. See [AI Configuration](../ai/configuration.md) for details.

## Verify Setup

1. **Backend**: http://localhost:8000/docs (API documentation)
2. **Frontend**: http://localhost:5173 (Web interface)
3. **Supabase Studio**: http://localhost:54323

## Development Workflow

See [Development Workflow](workflow.md) for best practices and common tasks.

## Troubleshooting

See [Troubleshooting Guide](../troubleshooting/common-issues.md) for common setup issues.
