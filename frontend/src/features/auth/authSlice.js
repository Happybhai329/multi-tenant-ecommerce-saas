import { createSlice } from '@reduxjs/toolkit'

// Safely parse initial user from localStorage
let initialUser = null
try {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    initialUser = JSON.parse(storedUser)
  }
} catch (err) {
  console.error('Error parsing stored user data:', err)
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

const initialToken = initialUser ? localStorage.getItem('token') : null
if (!initialUser && localStorage.getItem('token')) {
  localStorage.removeItem('token')
}

const initialState = {
  user: initialUser,
  token: initialToken,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true
      state.error = null
    },
    authSuccess: (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
      
      // Save credentials in localStorage
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    authFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.loading = false
      state.error = null
      
      // Remove credentials from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    sessionExpired: (state, action) => {
      state.user = null
      state.token = null
      state.loading = false
      state.error = action.payload || 'Your session has expired. Please sign in again.'

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const { authStart, authSuccess, authFailure, logout, sessionExpired, clearError } = authSlice.actions

export default authSlice.reducer
