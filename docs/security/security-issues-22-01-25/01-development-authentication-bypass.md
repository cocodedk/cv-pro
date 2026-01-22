# Issue 01: Development Authentication Bypass

## Severity
**Critical** - High risk of production compromise

## Status
**Remediated** - Dev fallback now requires explicit enablement and a dev/test runtime.

## Description
The application contains a development authentication fallback mechanism that allows bypassing proper authentication when enabled. This feature is controlled by the `ALLOW_DEV_AUTH_FALLBACK` environment variable and `VITE_ALLOW_DEV_AUTH_FALLBACK` frontend variable.

## Location
- **Backend**: `backend/app_helpers/auth.py`
- **Frontend**: `frontend/src/contexts/AuthContext.tsx`

## Technical Details

### Backend Implementation (Remediated)
```python
allow_dev_fallback = os.getenv("ALLOW_DEV_AUTH_FALLBACK", "").lower() == "true"
env = os.getenv("ENV", "").lower()
node_env = os.getenv("NODE_ENV", "").lower()
is_dev_env = env in ("development", "test") or node_env in ("development", "test")

if not (allow_dev_fallback and is_dev_env):
    if allow_dev_fallback:
        logger.error("Development auth fallback enabled outside dev/test; refusing request.")
    raise HTTPException(status_code=401, detail="Missing token")

user_id = os.getenv("SUPABASE_DEFAULT_USER_ID")
```

### Frontend Implementation (Remediated)
```typescript
const devFallbackEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK === 'true'

if (devFallbackEnabled) {
  // Force development authentication - always use dev user when enabled
  const devUser = {
    id: import.meta.env.VITE_DEV_AUTH_USER_ID ?? '550e8400-e29b-41d4-a716-446655440000',
    email: import.meta.env.VITE_DEV_AUTH_USER_EMAIL ?? 'dev@example.com',
    // ...
  }
  setUser(devUser)
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

## Fix Applied
1. **Backend gating tightened** - fallback requires both explicit enablement and dev/test runtime.
2. **Frontend gating tightened** - fallback only runs in Vite dev mode and no longer affects admin/auth in production builds.
3. **Dev user configuration scoped** - optional dev-only env overrides replace hardcoded defaults.

## Immediate Mitigation
- Set `ALLOW_DEV_AUTH_FALLBACK=false` in all production environments
- Set `VITE_ALLOW_DEV_AUTH_FALLBACK=false` in production builds
- Ensure `ENV`/`NODE_ENV` are set to production in deployment
- Keep dev-only overrides (`VITE_DEV_AUTH_USER_ID`, `VITE_DEV_AUTH_USER_EMAIL`) scoped to local development

## Long-term Solution
- Implement proper authentication flows for all environments
- Use environment-specific configuration files
- Add security scanning to CI/CD pipeline to detect dev credentials in production builds
