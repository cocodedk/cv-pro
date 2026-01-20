# Debugging Guide

Advanced debugging techniques and tools for the CV Generator.

## Backend Debugging

### Viewing Logs

**Real-time logs**:
```bash
docker-compose logs -f app
```

**Filter logs**:
```bash
docker-compose logs app | grep ERROR
```

### Interactive Debugging

**Access container shell**:
```bash
docker-compose exec app bash
```

**Run Python interactively**:
```bash
docker-compose exec app python
```

**Test database connection**:
```bash
docker-compose exec app python -c "from backend.database.supabase.client import get_admin_client; get_admin_client().table('user_profiles').select('id').limit(1).execute(); print('ok')"
```

### API Testing

**Using curl**:
```bash
# Health check
curl http://localhost:8000/api/health

# Create CV
curl -X POST http://localhost:8000/api/generate-cv-docx \
  -H "Content-Type: application/json" \
  -d '{"personal_info": {"name": "Test"}}'
```

**Using Swagger UI**:
- Access http://localhost:8000/docs
- Test endpoints interactively
- View request/response schemas

## Frontend Debugging

### Browser DevTools

**Console**: View errors, log API responses, inspect network requests.
**Network Tab**: Monitor API calls, check request/response data, identify failures.
**React DevTools**: Install extension, inspect component state, debug props/hooks.

### Debugging Tips

**Console logs**: `console.log('Form data:', data)`, `console.error('API error:', error)`
**Breakpoints**: Use browser debugger, set breakpoints, step through execution.

## Database Debugging

**Supabase Studio** (http://localhost:54323):
Use the SQL editor to inspect `cvs`, `cv_profiles`, and `cover_letters`.

## Performance Debugging

**Backend**: Add timing logs, use FastAPI middleware, monitor query performance.
**Database**: Use EXPLAIN in SQL, monitor slow queries, check indexes.
**Frontend**: Use React DevTools Profiler, check network performance, optimize renders.

## Common Scenarios

**API 500 Error**: Check logs, verify DB connection, check validation, review stack trace.
**Form Submission Fails**: Check console, verify endpoint URL, check payload, review validation.
**Data Not Saving**: Check DB connection, verify query execution, check transactions, review logs.

See [Common Issues](common-issues.md) for more scenarios.
