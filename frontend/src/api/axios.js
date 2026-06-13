import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to standardize API format handling
api.interceptors.response.use(
  (response) => {
    // If backend returns { success: true, data: ... },
    // we merge the properties of response.data.data into response.data
    // so that existing destructuring like const { data } = ... (which yields response.data)
    // still works with both the old keys (e.g. data.store) and new keys (e.g. data.data.store)
    if (response.data && response.data.success && response.data.data !== undefined) {
      const dataPayload = response.data.data
      if (typeof dataPayload === 'object' && dataPayload !== null) {
        // Merge keys if it's an object/array (avoid overwriting success)
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
    return Promise.reject(error)
  }
)

export default api
