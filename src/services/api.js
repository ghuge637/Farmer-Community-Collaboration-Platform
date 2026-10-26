import { Capacitor } from '@capacitor/core'

const TOKEN_KEY = 'AUTH_TOKEN'
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('CUSTOM_SERVER_URL')
    if (custom) return custom.endsWith('/api') ? custom : `${custom.replace(/\/+$/, '')}/api`

    // Detect if running inside Android APK WebView (Capacitor serves on http://localhost or capacitor://localhost without port 5173)
    const isCapacitorWebview = 
      Capacitor.isNativePlatform() || 
      window.location.protocol === 'capacitor:' || 
      (window.location.hostname === 'localhost' && window.location.port !== '5173') ||
      (window.location.hostname === '127.0.0.1' && window.location.port !== '5173')

    if (isCapacitorWebview) {
      const savedIp = localStorage.getItem('MOBILE_BACKEND_IP')
      return savedIp ? `${savedIp}/api` : 'http://10.0.2.2:8080/api'
    }
  }

  return import.meta.env.VITE_API_BASE_URL || '/api'
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const isFormData = body instanceof FormData
  let token = getToken && getToken()
  let authHeader = token ? { Authorization: `Bearer ${token}` } : {}
  const headersWithContent = isFormData ? { ...headers, ...authHeader } : { 'Content-Type': 'application/json', ...headers, ...authHeader }
  const opts = {
    method,
    headers: headersWithContent,
  }

  if (body) opts.body = isFormData ? body : JSON.stringify(body)

  const primaryBase = getApiBaseUrl().replace(/\/+$/, '')
  let candidateBases = [primaryBase]
  if (Capacitor.isNativePlatform() || window.location.protocol === 'capacitor:' || (window.location.hostname === 'localhost' && window.location.port !== '5173')) {
    candidateBases = [
      primaryBase,
      'http://172.24.50.1:8080/api',
      'http://10.0.2.2:8080/api'
    ].filter((v, idx, arr) => v && arr.indexOf(v) === idx)
  }

  let cleanPath = path
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4)
  }
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath
  }

  let res = null
  let lastFetchErr = null

  if (path.startsWith('http')) {
    res = await fetch(path, opts)
  } else {
    for (const base of candidateBases) {
      try {
        const url = `${base}${cleanPath}`
        res = await fetch(url, opts)
        if (res) break
      } catch (err) {
        lastFetchErr = err
      }
    }
  }

  if (!res) {
    throw lastFetchErr || new Error('Failed to fetch from backend server')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    let message = res.statusText || `Request failed (${res.status})`

    if (typeof err === 'string') {
      message = err
    } else if (err && typeof err === 'object') {
      if (Array.isArray(err.errors)) {
        message = err.errors.join(', ')
      } else if (err.errors && typeof err.errors === 'object') {
        message = Object.values(err.errors).flat().join(', ')
      } else {
        message = err.message || err.detail || err.error || err.title || message
      }
    }

    const e = new Error(message)
    e.status = res.status
    e.body = err
    throw e
  }

  return res.status === 204 ? null : res.json()
}

export const api = {
  get: (p) => request(p),
  post: (p, b) => request(p, { method: 'POST', body: b }),
  put: (p, b) => request(p, { method: 'PUT', body: b }),
  del: (p) => request(p, { method: 'DELETE' }),
}

export default api
