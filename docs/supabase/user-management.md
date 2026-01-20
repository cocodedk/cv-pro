# User Management System

This document covers user lifecycle flows that map to the current frontend and backend API patterns.

## Goals
- Self-service signup and login
- Onboarding to create a user-owned master profile (`cv_profiles`)
- Account settings (name, avatar, password)
- Account deletion via a backend endpoint

## Registration and Verification

Frontend signup:
```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

After verification, use the session to load or create the user profile:
- Check `cv_profiles` for the user.
- If none, create a blank profile and start onboarding.

## Onboarding (Master Profile)

The existing `/api/profile` endpoints can be reused:
- `GET /api/profile` -> load latest `cv_profiles` row
- `POST /api/profile` -> upsert latest `cv_profiles` row

Store the full `ProfileData` payload in `profile_data` JSONB. This keeps the API response unchanged.

## Account Settings

1. Update user metadata (name, avatar) in `user_profiles` via a backend endpoint.
2. Update auth credentials with supabase-js:
```typescript
await supabase.auth.updateUser({ password: newPassword })
await supabase.auth.updateUser({ email: newEmail })
```

Email changes require verification and redirect URLs configured in Supabase.

## Account Deletion

Account deletion must be server-side (service role required). Add a backend endpoint:
- `DELETE /api/account`
- Steps:
  1. Delete user-owned data (`cvs`, `cv_profiles`, `cover_letters`).
  2. Delete the auth user with `supabase.auth.admin.deleteUser(user_id)`.

## Access Control
- Use `user_profiles.role` for admin access.
- Use `user_profiles.is_active` to disable accounts without deleting data.
