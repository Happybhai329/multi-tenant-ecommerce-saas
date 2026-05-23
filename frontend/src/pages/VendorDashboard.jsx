import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'

function VendorDashboard() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Vendor Portal
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center items-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
            <p className="text-gray-400 text-sm mt-1">Vendor Account Profile</p>
          </div>

          <div className="border-t border-gray-800 pt-6 space-y-4">
            <div>
              <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                Store Owner
              </span>
              <span className="text-gray-200">{user?.name}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                Email Address
              </span>
              <span className="text-gray-200">{user?.email}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                Role
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VendorDashboard
