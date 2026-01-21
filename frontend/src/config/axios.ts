/**
 * Axios configuration for API requests.
 *
 * This file configures axios defaults and attaches Supabase auth tokens.
 *
 * For GitHub Pages deployment, set VITE_API_BASE_URL environment variable
 * to point to your hosted backend API (e.g., https://api.example.com).
 *
 * If VITE_API_BASE_URL is not set, axios will use relative URLs which work
 * when the frontend and backend are on the same origin.
 */
import axios from 'axios'
import { supabase } from './supabase'

// Get API base URL from environment variable
// Vite exposes env variables via import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

axios.defaults.baseURL = API_BASE_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Cache for the access token to avoid repeated getSession() calls that can hang
let cachedToken: string | null = null
let tokenPromise: Promise<string | null> | null = null

// Listen for auth state changes to update the cached token
supabase.auth.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token ?? null
})

// Get token with timeout to prevent hanging
async function getTokenWithTimeout(timeoutMs = 3000): Promise<string | null> {
  // If we already have a cached token, use it
  if (cachedToken) {
    return cachedToken
  }

  // If a token fetch is in progress, wait for it
  if (tokenPromise) {
    return tokenPromise
  }

  // Fetch token with timeout
  tokenPromise = Promise.race([
    supabase.auth.getSession().then(({ data }) => {
      cachedToken = data.session?.access_token ?? null
      return cachedToken
    }),
    new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
  ]).finally(() => {
    tokenPromise = null
  })

  return tokenPromise
}

axios.interceptors.request.use(async config => {
  const token = await getTokenWithTimeout()
  if (token) {
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

export default axios
