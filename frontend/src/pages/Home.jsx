import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { logout } from '../features/auth/authSlice'

function Home() {
  const { token, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  // Get the correct dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return '/'
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'vendor') return '/vendor/dashboard'
    return '/customer/dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-800 p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white">
              Multi-Tenant <span className="text-blue-500">E-Commerce</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {token && user ? (
              <>
                <span className="text-sm text-gray-400 hidden sm:inline">
                  Hello, <span className="text-white font-medium">{user.name}</span>
                </span>
                <Link
                  to={getDashboardPath()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Banner */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6">
            Connecting Customers, Vendors & Administrators
          </h1>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            Welcome to our fully integrated multi-tenant e-commerce system. Build
            your brand, manage your vendor store, or explore a catalog of products under one unified backend.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {token ? (
              <Link
                to={getDashboardPath()}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3 bg-gray-900 border border-gray-800 hover:bg-gray-800 font-semibold text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer text-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
