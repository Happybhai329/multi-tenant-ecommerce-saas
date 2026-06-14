import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api, { getApiErrorMessage } from '../api/axios'
import { authStart, authSuccess, authFailure, clearError } from '../features/auth/authSlice'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [validationErrors, setValidationErrors] = useState({})

  const { loading, error, token, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Clear any existing auth errors when the registration page mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (token && user) {
      const from = location.state?.from?.pathname
      if (from) {
        navigate(from, { replace: true })
      } else {
        if (user.role === 'admin') navigate('/admin/dashboard')
        else if (user.role === 'vendor') navigate('/vendor/dashboard')
        else navigate('/customer/dashboard')
      }
    }
  }, [token, user, navigate, location])

  const validateForm = () => {
    const errors = {}
    if (!name.trim()) {
      errors.name = 'Name is required'
    }

    if (!email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must include a lowercase letter'
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must include an uppercase letter'
    } else if (!/\d/.test(password)) {
      errors.password = 'Password must include a number'
    }

    if (!role) {
      errors.role = 'Role is required'
    } else if (!['customer', 'vendor'].includes(role)) {
      errors.role = 'Invalid role selected'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      dispatch(authStart())
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      })

      if (response.data.success) {
        setSuccessMessage('Registration successful! A welcome email has been sent to your address.')
        // Delay redirect to allow user to read the message
        setTimeout(() => {
          dispatch(
            authSuccess({
              user: response.data.user,
              token: response.data.token,
            })
          )
        }, 3000)
      } else {
        dispatch(authFailure(response.data.message || 'Registration failed'))
      }
    } catch (err) {
      const errMsg = err.userMessage || getApiErrorMessage(err)
      dispatch(authFailure(errMsg))
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 py-8 px-4 border border-gray-800 shadow-2xl rounded-2xl sm:px-10">
          {/* API Error Alert */}
          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-4 bg-green-900/30 border border-green-800/50 text-green-400 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-950 border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-800'
                  }`}
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-950 border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-800'
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-950 border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-800'
                  }`}
                />
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-300"
              >
                Account Type
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-950 border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors ${
                    validationErrors.role ? 'border-red-500' : 'border-gray-800'
                  }`}
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor (Store Owner)</option>
                </select>
              </div>
              {validationErrors.role && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.role}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
