# Phase 05 - Frontend auth and session handling

Goal: implement user sign-in/out and tokenized API calls.

Steps:
1. Add Supabase client and AuthContext from `docs/supabase/auth-integration.md`.
2. Add sign-in and sign-up UI plus route guards for protected pages.
3. Attach the Supabase access token to axios requests.
4. Handle loading and signed-out states in the UI.

Exit criteria:
- Users can sign in and sign out.
- API requests include bearer tokens.
- Protected routes block unauthenticated users.
