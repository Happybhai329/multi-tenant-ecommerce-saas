import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

function Home() {
  const { token, user } = useSelector((state) => state.auth)

  const getDashboardPath = () => {
    if (!user) return '/'
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'vendor') return '/vendor/dashboard'
    return '/customer/dashboard'
  }

  return (
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
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
            >
              Get Started
            </Link>
          )}

          <Link
            to="/products"
            className="w-full sm:w-auto px-8 py-3 bg-gray-900 border border-gray-800 hover:bg-gray-800 font-semibold text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer text-center"
          >
            Browse Products
          </Link>
          <Link
            to="/stores"
            className="w-full sm:w-auto px-8 py-3 bg-gray-900 border border-gray-800 hover:bg-gray-800 font-semibold text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer text-center"
          >
            View Stores
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
