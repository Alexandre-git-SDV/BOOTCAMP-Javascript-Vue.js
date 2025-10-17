// Centralized API client with JWT auth and refresh handling
import { useAuthStore } from '@/stores/authStore'

// Prefer a relative proxy during dev to avoid CORS; can be overridden via VITE_API_BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, { method = 'GET', headers = {}, body, auth = true } = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const store = useAuthStore()

  const finalHeaders = new Headers({ 'Content-Type': 'application/json', ...headers })
  if (auth && store.token) finalHeaders.set('Authorization', `Bearer ${store.token}`)

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  // If unauthorized and we have a refreshToken, try to refresh once
  if (res.status === 401 && auth && store.refreshToken) {
    const refreshed = await tryRefreshToken(store)
    if (refreshed) {
      // retry original request with new token
      const retryHeaders = new Headers(finalHeaders)
      retryHeaders.set('Authorization', `Bearer ${store.token}`)
      const retry = await fetch(url, {
        method,
        headers: retryHeaders,
        body: body ? JSON.stringify(body) : undefined,
      })
      return handleResponse(retry)
    }
  }

  return handleResponse(res)
}

async function tryRefreshToken(store) {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: store.refreshToken }),
    })
    if (!res.ok) throw new Error('Refresh failed')
    const data = await res.json()
    if (!data?.token || !data?.refreshToken) throw new Error('Bad refresh payload')
    store.setTokens(data.token, data.refreshToken)
    return true
  } catch (e) {
    store.logout()
    return false
  }
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')

  if (!res.ok) {
    const message = (payload && (payload.message || payload.error)) || `HTTP ${res.status}`
    const error = new Error(message)
    error.status = res.status
    error.payload = payload
    throw error
  }
  return payload
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

export default api
