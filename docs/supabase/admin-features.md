# Admin Features

## Admin Capabilities

Comprehensive administrative features leveraging Supabase's authentication and database capabilities for managing the multi-user CV Generator platform.

## User Management

### User Administration
```sql
-- Admin queries for user management
CREATE OR REPLACE VIEW admin_users AS
SELECT
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.is_active,
    p.created_at,
    COUNT(c.id) as cv_count,
    MAX(c.updated_at) as last_cv_update
FROM profiles p
LEFT JOIN cvs c ON p.id = c.user_id
WHERE p.role IN ('user', 'admin')
GROUP BY p.id, p.email, p.full_name, p.role, p.is_active, p.created_at;
```

### Admin API Endpoints
```python
# Backend admin routes
@app.get("/admin/users")
def get_users(current_user: dict = Depends(get_current_admin)):
    """Get all users with statistics"""
    return supabase.table('admin_users').select('*').execute()

@app.put("/admin/users/{user_id}/role")
def update_user_role(user_id: str, role: str, current_user: dict = Depends(get_current_admin)):
    """Update user role (admin only)"""
    return supabase.table('profiles').update({'role': role}).eq('id', user_id).execute()

@app.delete("/admin/users/{user_id}")
def deactivate_user(user_id: str, current_user: dict = Depends(get_current_admin)):
    """Deactivate user account"""
    return supabase.table('profiles').update({'is_active': False}).eq('id', user_id).execute()
```

## System Analytics

### Usage Statistics
```sql
-- Daily active users
CREATE VIEW daily_stats AS
SELECT
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) as cvs_created,
    COUNT(CASE WHEN theme IS NOT NULL THEN 1 END) as themed_cvs
FROM cvs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Popular themes
CREATE VIEW theme_popularity AS
SELECT
    theme,
    COUNT(*) as usage_count,
    COUNT(DISTINCT user_id) as unique_users
FROM cvs
WHERE theme IS NOT NULL
GROUP BY theme
ORDER BY usage_count DESC;
```

### Admin Dashboard Data
```typescript
// Frontend admin dashboard
const { data: stats } = await supabase
    .from('daily_stats')
    .select('*')
    .limit(30);

const { data: themes } = await supabase
    .from('theme_popularity')
    .select('*')
    .limit(10);
```

## Content Moderation

### CV Review System
```sql
-- CV moderation table
CREATE TABLE cv_moderation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID REFERENCES cvs(id),
    moderator_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    feedback TEXT,
    moderated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderation policies
CREATE POLICY "Admins can moderate all cvs"
ON cv_moderation FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
```

## System Configuration

### Feature Flags
```sql
-- System configuration table
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example configurations
INSERT INTO system_config (key, value) VALUES
('ai_enabled', 'true'),
('max_cvs_per_user', '50'),
('allowed_themes', '["classic", "modern", "professional", "creative"]');
```

### Admin Configuration API
```python
@app.get("/admin/config")
def get_system_config(current_user: dict = Depends(get_current_admin)):
    return supabase.table('system_config').select('*').execute()

@app.put("/admin/config/{key}")
def update_config(key: str, value: dict, current_user: dict = Depends(get_current_admin)):
    return supabase.table('system_config').update({
        'value': value,
        'updated_by': current_user['id'],
        'updated_at': 'now()'
    }).eq('key', key).execute()
```

## Security & Compliance

### Audit Logging
```sql
-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to log changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
BEGIN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### Data Export
```python
@app.get("/admin/export/users")
def export_users(current_user: dict = Depends(get_current_admin)):
    """Export all user data for backup/compliance"""
    users = supabase.table('profiles').select('*').execute()
    cvs = supabase.table('cvs').select('*').execute()
    # Generate CSV/JSON export
    return create_export_file(users.data, cvs.data)
```

## Email Integration

### Supabase Email Features
```typescript
// Send welcome email
const { data, error } = await supabase.auth.admin.inviteUserByEmail('user@example.com', {
  data: {
    role: 'user'
  },
  redirectTo: 'https://app.cv-pro.com/welcome'
});

// Send password reset
const { data, error } = await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://app.cv-pro.com/reset-password'
});
```

### Automated Emails
```sql
-- Email templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example templates
INSERT INTO email_templates (name, subject, html_content) VALUES
('welcome', 'Welcome to CV Pro!', '<h1>Welcome!</h1><p>Your account is ready...</p>'),
('cv_generated', 'Your CV is ready!', '<h1>CV Generated</h1><p>Download your CV here...</p>');
```

## Maintenance Features

### Database Cleanup
```python
@app.post("/admin/maintenance/cleanup")
def cleanup_old_data(days: int = 90, current_user: dict = Depends(get_current_admin)):
    """Clean up old temporary data"""
    cutoff_date = datetime.now() - timedelta(days=days)

    # Remove old audit logs
    supabase.table('audit_log').delete().lt('created_at', cutoff_date).execute()

    # Archive old CV versions
    # ... cleanup logic
```

### System Health Checks
```python
@app.get("/admin/health")
def system_health(current_user: dict = Depends(get_current_admin)):
    """System health dashboard"""
    return {
        "database": check_db_connection(),
        "storage": check_storage_usage(),
        "users": get_user_count(),
        "cvs": get_cv_count(),
        "errors": get_recent_errors()
    }
```