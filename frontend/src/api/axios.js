import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
})

const sessionErrorCodes = new Set([
  'AUTH_TOKEN_MISSING',
  'AUTH_TOKEN_EXPIRED',
  'AUTH_TOKEN_INVALID',
  'AUTH_USER_NOT_FOUND',
])

const authEndpoints = ['/auth/login', '/auth/register']
let lastSessionEventAt = 0

const getApiErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message
  if (error.response?.status === 429) return 'Too many requests. Please wait a moment and try again.'
  if (error.response?.status >= 500) return 'The server is having trouble. Please try again shortly.'
  return error.message || 'Something went wrong. Please try again.'
}

const shouldHandleSessionError = (error) => {
  const status = error.response?.status
  const code = error.response?.data?.code
  const url = error.config?.url || ''

  if (authEndpoints.some((endpoint) => url.includes(endpoint))) {
    return false
  }

  return status === 401 && (sessionErrorCodes.has(code) || localStorage.getItem('token'))
}

const emitSessionExpired = (message) => {
  const now = Date.now()
  if (now - lastSessionEventAt < 1000) return

  lastSessionEventAt = now
  window.dispatchEvent(new CustomEvent('auth:session-expired', {
    detail: { message },
  }))
}

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to standardize API format handling and session failures
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success && response.data.data !== undefined) {
      const dataPayload = response.data.data
      if (typeof dataPayload === 'object' && dataPayload !== null) {
        Object.keys(dataPayload).forEach((key) => {
          if (key !== 'success') {
            response.data[key] = dataPayload[key]
          }
        })
      }
    }
    return response
  },
  (error) => {
    error.userMessage = getApiErrorMessage(error)

    if (shouldHandleSessionError(error)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      emitSessionExpired(error.userMessage)
    }

    return Promise.reject(error)
  }
)

export { getApiErrorMessage }
export default api
