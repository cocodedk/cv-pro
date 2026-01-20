# Production Deployment

Guide for deploying the CV Generator to production.

## Prerequisites

- Docker and Docker Compose installed on server
- Domain name configured (optional)
- SSL certificate (for HTTPS)
- Reverse proxy (nginx recommended)

## Environment Configuration

### Environment Variables

Create `.env` file with production values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
CORS_ORIGINS=https://yourdomain.com
```

**Security Notes**:
- Use strong, unique passwords
- Never commit `.env` to version control
- Use Docker secrets for sensitive data

## Docker Compose for Production

Modify `docker-compose.yml` for production:

1. **Remove volume mounts** (use built images)
2. **Set resource limits**
3. **Configure health checks**
4. **Use production images**

## Reverse Proxy Setup

**Nginx Example**:
```nginx
server {
    listen 80; server_name yourdomain.com;
    location / { proxy_pass http://localhost:8000; proxy_set_header Host $host; }
}
```

## SSL/TLS Setup

Use Let's Encrypt: `certbot --nginx -d yourdomain.com`

## Database Backup

- Supabase-hosted projects include automated backups (see Supabase dashboard).
- For self-hosted Postgres, use `pg_dump` and scheduled snapshots.

## Monitoring

### Health Checks

Monitor application health:
- API health endpoint: `/api/health`
- Docker health checks configured in Dockerfile

### Logging

Configure log aggregation:
- Use Docker logging drivers
- Set up log rotation
- Monitor error rates

## Scaling

For high traffic:
1. Use load balancer
2. Scale backend containers
3. Scale Supabase/Postgres resources
4. Implement caching layer

## Security Checklist

- [ ] Strong database passwords
- [ ] CORS configured for production domains
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] Regular security updates

## Maintenance

**Update application**: `git pull && docker-compose build && docker-compose up -d`

**Database maintenance**: Regular backups, monitor disk space, review query performance.
