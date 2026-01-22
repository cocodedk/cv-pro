# Issue 01: Development Authentication Bypass

## Severity
**Critical** - High risk of production compromise

## Description
The application contains a development authentication fallback mechanism that allows bypassing proper authentication when enabled. This feature is controlled by the `ALLOW_DEV_AUTH_FALLBACK` environment variable and `VITE_ALLOW_DEV_AUTH_FALLBACK` frontend variable.

## Location
- **Backend**: `backend/app_helpers/auth.py` (lines 24-48)
- **Frontend**: `frontend/src/contexts/AuthContext.tsx` (lines 52-86)

## Technical Details

### Backend Implementation
```python
# Only allow dev fallback in non-production environments
allow_dev_fallback = os.getenv("ALLOW_DEV_AUTH_FALLBACK", "").lower() == "true"
env = os.getenv("ENV", "").lower()
node_env = os.getenv("NODE_ENV", "").lower()
is_dev_env = env in ("development", "test") or node_env in ("development", "test")

if not (allow_dev_fallback or is_dev_env):
    raise HTTPException(status_code=401, detail="Missing token")

user_id = os.getenv("SUPABASE_DEFAULT_USER_ID")
```

### Frontend Implementation
```typescript
// Check for development auth fallback - only enable when explicitly set
const allowDevFallback = import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK === 'true'

if (allowDevFallback) {
  // Force development authentication - always use dev user when enabled
  const devUser = {
    id: '550e8400-e29b-41d4-a716-446655440000', // HARDCODED DEV USER ID
    email: 'dev@example.com',
    // ...
  }
  setUser(devUser as any)
  setRole('user')
  setIsActive(true)
  setLoading(false)
  return
}
```

## Impact
- **Production Security**: If this fallback is accidentally enabled in production, any user could access the application without authentication
- **Data Breach**: Unauthorized access to all user data and CVs
- **GDPR Violation**: Potential unauthorized processing of personal data

## Root Cause
- Development convenience feature not properly isolated from production
- Hardcoded user credentials in frontend code
- Environment variable checks could be bypassed or misconfigured

## Recommended Fix
1. **Remove hardcoded credentials** from production builds
2. **Environment-specific builds** - exclude dev authentication code from production bundles
3. **Runtime validation** - Add startup checks to ensure dev features are disabled in production
4. **Proper environment detection** - Use multiple indicators (NODE_ENV, deployment environment, etc.)

## Immediate Mitigation
- Set `ALLOW_DEV_AUTH_FALLBACK=false` in all production environments
- Set `VITE_ALLOW_DEV_AUTH_FALLBACK=false` in production builds
- Remove the hardcoded user ID from version control
- Add environment validation in deployment scripts

## Long-term Solution
- Implement proper authentication flows for all environments
- Use environment-specific configuration files
- Add security scanning to CI/CD pipeline to detect dev credentials in production builds
