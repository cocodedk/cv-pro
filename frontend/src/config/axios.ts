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

axios.interceptors.request.use(async config => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

export default axios
