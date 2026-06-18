import { useSelector, useDispatch } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { logout } from '../features/auth/authSlice'
import { selectCartTotalItems } from '../features/cart/cartSlice'
import { getWishlist } from '../features/wishlist/wishlistSlice'
import { useEffect } from 'react'

function Navbar() {
  const { token, user } = useSelector((state) => state.auth)
  const cartCount = useSelector(selectCartTotalItems)
  const dispatch = useDispatch()

  useEffect(() => {
    if (token && user?.role === 'customer') {
      dispatch(getWishlist())
    }
  }, [token, user, dispatch])

  const handleLogout = () => {
    dispatch(logout())
  }

  const getDashboardPath = () => {
    if (!user) return '/'
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'vendor') return '/vendor/dashboard'
    return '/customer/dashboard'
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-white' : 'text-gray-400 hover:text-white'
    }`

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left — Logo + Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold tracking-tight text-white">
            Zalima<span className="text-blue-500">.</span>
          </Link>

          <div className="hidden sm:flex items-center gap-4">
            <NavLink to="/stores" className={navLinkClass}>Stores</NavLink>
            <NavLink to="/products" className={navLinkClass}>Products</NavLink>
            {token && user?.role === 'customer' && (
              <>
                <NavLink to="/orders" className={navLinkClass}>My Orders</NavLink>
                <NavLink to="/wishlist" className={navLinkClass}>Wishlist</NavLink>
              </>
            )}
          </div>
        </div>

        {/* Right — Cart + Auth */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full px-1">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {token && user ? (
            <>
              <span className="text-sm text-gray-400 hidden md:inline">
                {user.name}
              </span>
              <Link
                to={getDashboardPath()}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
